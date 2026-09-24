import { adapterRegistry } from '@/lib/chatAdapters/registry';
import { ExtractedTurn } from '@/lib/chatAdapters/types';
import { parseCurrentPageArticle } from '@/lib/parser/readability';
import { captureVideoCue } from '@/lib/chatAdapters/videoAdapter';
import { startInteractiveScreenshot } from './screenshotCropper';
import { scanElementForDownloadableFiles } from '@/lib/parser/fileDetector';
import { CapturedItem, ExtensionMessage, resolveUrlType } from '@/types';

// 获取当前页面绝对 URL（网络或本地 file:/// 均可安全获取）
function getCurrentPageUrl(): string {
  return window.location.href || document.URL || location.href || 'about:blank';
}

// 注入样式
function injectStyles() {
  const styleId = 'dsh-sensor-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .dsh-chat-inject-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      margin: 4px 6px;
      font-size: 12px;
      font-weight: 500;
      color: #15803d;
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 1000;
    }
    .dsh-chat-inject-btn:hover {
      background-color: #dcfce7;
      color: #14532d;
      border-color: #86efac;
      transform: translateY(-1px);
    }
    .dsh-floating-pill {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #0f172a;
      color: #f8fafc;
      font-size: 13px;
      font-weight: 500;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
      z-index: 999999;
      transform: translateY(-100%);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .dsh-floating-pill:hover {
      background: #1e293b;
      color: #4ade80;
    }
    .dsh-toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .dsh-toast {
      pointer-events: auto;
      padding: 10px 16px;
      background: #0f172a;
      color: #ffffff;
      font-size: 13px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border-left: 4px solid #22c55e;
      animation: dshFadeIn 0.3s ease;
    }
    .dsh-toast.error {
      border-left-color: #ef4444;
    }
    @keyframes dshFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// 浮动轻量 Toast 通知
function showToast(message: string, isError = false) {
  let container = document.getElementById('dsh-toast-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dsh-toast-root';
    container.className = 'dsh-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `dsh-toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 统一向后台发送保存任务
function sendSaveTask(
  item: CapturedItem,
  onComplete?: (res: { success: boolean; error?: string; savedPath?: string }) => void
) {
  chrome.runtime.sendMessage(
    { type: 'SAVE_BUNDLE', payload: item },
    (response) => {
      if (response && response.success) {
        showToast(`✓ 已成功归档至 DSH: ${item.title.slice(0, 25)}`);
        onComplete?.({ success: true, savedPath: response.data?.savedPath });
      } else {
        const errMsg = response?.error || '未能成功写入磁盘';
        showToast(`✕ 保存失败: ${errMsg}`, true);
        onComplete?.({ success: false, error: errMsg });
      }
    }
  );
}

// 初始化浮动划词工具栏
let activePill: HTMLElement | null = null;
function initSelectionToolbar() {
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (activePill) {
      activePill.remove();
      activePill = null;
    }

    if (!text || text.length < 5) return;

    // 排除如果在 input 或 textarea 内部
    const anchorNode = selection?.anchorNode?.parentElement;
    if (anchorNode?.closest('input, textarea, [contenteditable="true"]')) return;

    const range = selection?.getRangeAt(0);
    if (!range) return;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    activePill = document.createElement('div');
    activePill.className = 'dsh-floating-pill';
    activePill.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      存入 DSH
    `;

    activePill.style.top = `${window.scrollY + rect.top - 8}px`;
    activePill.style.left = `${window.scrollX + rect.left + rect.width / 2 - 40}px`;

    activePill.onmousedown = (e) => e.stopPropagation();
    activePill.onclick = (e) => {
      e.stopPropagation();
      const currentUrl = getCurrentPageUrl();
      const item: CapturedItem = {
        id: `snip-${Date.now()}`,
        project: '',
        topic: '',
        title: `摘录: ${text.slice(0, 30)}...`,
        url: currentUrl,
        urlType: resolveUrlType(currentUrl),
        sourcePlatform: 'web_article',
        capturedAt: new Date().toISOString(),
        documentType: 'snippet',
        tags: ['Snippet', 'Quote'],
        markdownContent: `> ${text.replace(/\n+/g, '\n> ')}\n\n---\n> 来源出处: [${document.title || currentUrl}](${currentUrl})`,
        mediaAttachments: [],
      };
      sendSaveTask(item);
      if (activePill) {
        activePill.remove();
        activePill = null;
      }
    };

    document.body.appendChild(activePill);
  });
}

// 检查并初始化 AI Chat 适配器
function initChatAdapter() {
  const currentUrl = getCurrentPageUrl();
  const adapter = adapterRegistry.findAdapter(currentUrl);
  if (!adapter) return;

  console.log(`[DSH Sensor] 检测到匹配的 AI Chat 平台: ${adapter.name}`);

  const handleSaveTurn = (turn: ExtractedTurn) => {
    const itemUrl = getCurrentPageUrl();
    const item: CapturedItem = {
      id: `chat-${Date.now()}`,
      project: '',
      topic: 'AI-Chat',
      title: `${adapter.name}: ${turn.prompt.slice(0, 30)}`,
      url: itemUrl,
      urlType: resolveUrlType(itemUrl),
      sourcePlatform: adapter.id as any,
      capturedAt: new Date().toISOString(),
      documentType: 'chat_turn',
      tags: ['AIChat', adapter.name, turn.modelName || 'LLM'],
      markdownContent: turn.markdown,
      aiMetadata: {
        modelName: turn.modelName,
        hasThinkingChain: !!turn.thinking,
        thinkingContent: turn.thinking,
        promptContext: turn.prompt,
      },
      mediaAttachments: turn.mediaAttachments || [],
    };
    sendSaveTask(item);
  };

  // 初次注入
  adapter.injectUI(handleSaveTurn);

  // 监听 DOM 流式生成更新
  const observer = new MutationObserver(() => {
    adapter.injectUI(handleSaveTurn);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// 监听来自 Background 或 Side Panel 的指令
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'SHOW_TOAST') {
    const payload = message.payload as { message: string; isError?: boolean };
    showToast(payload.message, payload.isError);
    sendResponse({ ok: true });
  }

  if (message.type === 'CAPTURE_FULL_PAGE') {
    const currentUrl = getCurrentPageUrl();
    parseCurrentPageArticle(document)
      .then(article => {
        const item: CapturedItem = {
          id: `page-${Date.now()}`,
          project: '',
          topic: '',
          title: article.title,
          url: currentUrl,
          urlType: resolveUrlType(currentUrl),
          sourcePlatform: 'web_article',
          capturedAt: new Date().toISOString(),
          documentType: 'article',
          tags: ['Article', 'Research'],
          markdownContent: article.markdown,
          mediaAttachments: article.mediaAttachments,
        };
        sendSaveTask(item);
        sendResponse({ success: true, item });
      })
      .catch(err => {
        showToast(`提取正文失败: ${err.message}`, true);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (message.type === 'CAPTURE_SELECTION') {
    const payload = message.payload as { text?: string };
    const text = payload?.text || window.getSelection()?.toString() || '';
    if (text) {
      const currentUrl = getCurrentPageUrl();
      const item: CapturedItem = {
        id: `snip-${Date.now()}`,
        project: '',
        topic: '',
        title: `摘录: ${text.slice(0, 30)}...`,
        url: currentUrl,
        urlType: resolveUrlType(currentUrl),
        sourcePlatform: 'web_article',
        capturedAt: new Date().toISOString(),
        documentType: 'snippet',
        tags: ['Snippet', 'Quote'],
        markdownContent: `> ${text.replace(/\n+/g, '\n> ')}\n\n---\n> 来源出处: [${document.title || currentUrl}](${currentUrl})`,
        mediaAttachments: [],
      };
      sendSaveTask(item);
      sendResponse({ success: true });
    }
  }

  if (message.type === 'CAPTURE_VIDEO_CUE' as any) {
    const videoData = captureVideoCue();
    if (videoData) {
      const currentUrl = videoData.url || getCurrentPageUrl();
      const item: CapturedItem = {
        id: `vid-${Date.now()}`,
        project: '',
        topic: 'Video',
        title: videoData.title || '视频线索',
        url: currentUrl,
        urlType: resolveUrlType(currentUrl),
        sourcePlatform: videoData.sourcePlatform || 'bilibili',
        capturedAt: new Date().toISOString(),
        documentType: 'media',
        tags: videoData.tags || ['Video'],
        markdownContent: videoData.markdownContent || '',
        mediaAttachments: [],
      };
      sendSaveTask(item);
      sendResponse({ success: true, item });
    } else {
      showToast('当前页面未检测到视频播放器或非支持平台', true);
      sendResponse({ success: false, error: '未检测到视频' });
    }
    return true;
  }

  if (message.type === 'PING') {
    sendResponse({ pong: true });
    return true;
  }

  if (message.type === 'DETECT_PAGE_FILES') {
    try {
      const currentUrl = getCurrentPageUrl();
      const files = scanElementForDownloadableFiles(document, currentUrl);
      sendResponse({
        success: true,
        files,
        pageTitle: document.title,
        pageUrl: currentUrl,
      });
    } catch (err) {
      sendResponse({
        success: false,
        error: (err as Error).message,
        files: [],
      });
    }
    return true;
  }

  if (message.type === 'START_SCREENSHOT_CAPTURE') {
    const payload = message.payload as { project?: string; topics?: string[] } | undefined;
    startInteractiveScreenshot(
      (item, onComplete) => {
        sendSaveTask(item, onComplete);
      },
      (err) => {
        showToast(`截图失败: ${err}`, true);
      },
      payload?.project,
      payload?.topics
    );
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CAPTURE_CHAT_SESSION') {
    const currentUrl = getCurrentPageUrl();
    const adapter = adapterRegistry.findAdapter(currentUrl);
    if (adapter) {
      const session = adapter.extractSession();
      if (session) {
        const item: CapturedItem = {
          id: `session-${Date.now()}`,
          project: '',
          topic: 'AI-Chat',
          title: session.title,
          url: currentUrl,
          urlType: resolveUrlType(currentUrl),
          sourcePlatform: adapter.id as any,
          capturedAt: new Date().toISOString(),
          documentType: 'chat_session',
          tags: ['AISession', adapter.name, session.modelName || 'LLM'],
          markdownContent: session.markdown,
          mediaAttachments: session.mediaAttachments || [],
        };
        sendSaveTask(item);
        sendResponse({ success: true, item });
      } else {
        showToast('未能识别到完整的对话轮次', true);
        sendResponse({ success: false, error: '未能识别对话' });
      }
    } else {
      showToast('当前页面不是受支持的 AI 对话平台', true);
      sendResponse({ success: false, error: '未匹配适配器' });
    }
    return true;
  }
});

// 启动注入
injectStyles();
initSelectionToolbar();
initChatAdapter();
