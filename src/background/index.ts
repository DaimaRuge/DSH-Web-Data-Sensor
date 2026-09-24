import { executeSaveBundle } from '@/lib/storage/bundleSaver';
import { getSettings, getActiveProject } from '@/lib/storage/settings';
import { CapturedItem, ExtensionMessage, resolveUrlType } from '@/types';
import { deriveFilename } from '@/lib/parser/fileDetector';

// 配置点击扩展图标直接打开 Side Panel
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

// 初始化右键菜单（先移除旧菜单，防止重复 ID 报错）
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'dsh-capture-page',
      title: '📥 抓取当前页面为 DSH 线索',
      contexts: ['page'],
    });

    chrome.contextMenus.create({
      id: 'dsh-capture-selection',
      title: '✂️ 将选中文本存入 DSH 知识库',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'dsh-download-file-link',
      title: '📥 下载此文件到 DSH 研究目录并索引',
      contexts: ['link'],
    });

    chrome.contextMenus.create({
      id: 'dsh-batch-download-files',
      title: '📦 批量下载本页文件到 DSH 研究目录',
      contexts: ['page', 'selection'],
    });

    chrome.contextMenus.create({
      id: 'dsh-capture-image',
      title: '🖼️ 将此图片存入 DSH 资源库',
      contexts: ['image'],
    });

    chrome.contextMenus.create({
      id: 'dsh-capture-screenshot',
      title: '📸 页面截图快照 (可裁剪标注) 存入 DSH',
      contexts: ['page'],
    });
  });
}

chrome.runtime.onInstalled.addListener(setupContextMenus);
if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(setupContextMenus);
}

// 辅助函数：向目标 Tab 发送消息，若未注入 Content Script 则自动动态注入并重试
async function sendMessageWithAutoInject(tabId: number, message: ExtensionMessage): Promise<void> {
  chrome.tabs.sendMessage(tabId, message, async () => {
    if (chrome.runtime.lastError) {
      const errMsg = chrome.runtime.lastError.message || '';
      if (errMsg.includes('Receiving end does not exist') || errMsg.includes('Could not establish connection')) {
        try {
          const manifest = chrome.runtime.getManifest();
          const scripts = manifest.content_scripts?.[0]?.js;
          if (scripts && scripts.length > 0) {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: scripts,
            });
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, message);
            }, 150);
          }
        } catch (err) {
          console.warn('Background 动态注入 Content Script 失败', err);
        }
      }
    }
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + chunkSize, len))));
  }
  return btoa(binary);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function downloadFileFromUrl(url: string): Promise<{ dataUrl: string; size: number; contentType: string; serverFilename?: string }> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`下载失败 HTTP ${resp.status} ${resp.statusText}`);
  }
  const contentType = resp.headers.get('content-type') || 'application/octet-stream';
  const disposition = resp.headers.get('content-disposition') || '';
  let serverFilename = '';
  if (disposition) {
    const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)["']?/i);
    if (filenameMatch && filenameMatch[1]) {
      serverFilename = decodeURIComponent(filenameMatch[1].trim());
    }
  }

  const buffer = await resp.arrayBuffer();
  const size = buffer.byteLength;
  const base64 = arrayBufferToBase64(buffer);
  const dataUrl = `data:${contentType};base64,${base64}`;

  return {
    dataUrl,
    size,
    contentType,
    serverFilename: serverFilename || undefined,
  };
}

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'dsh-capture-page') {
    sendMessageWithAutoInject(tab.id, { type: 'CAPTURE_FULL_PAGE' });
  } else if (info.menuItemId === 'dsh-capture-selection') {
    sendMessageWithAutoInject(tab.id, {
      type: 'CAPTURE_SELECTION',
      payload: { text: info.selectionText },
    });
  } else if (info.menuItemId === 'dsh-capture-screenshot') {
    sendMessageWithAutoInject(tab.id, { type: 'START_SCREENSHOT_CAPTURE' });
  } else if (info.menuItemId === 'dsh-download-file-link') {
    const fileUrl = info.linkUrl || info.srcUrl;
    if (!fileUrl) {
      sendMessageWithAutoInject(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: '未能获取有效的下载链接', isError: true },
      });
      return;
    }

    sendMessageWithAutoInject(tab.id, {
      type: 'SHOW_TOAST',
      payload: { message: '⏳ 正在下载文件并索引至 DSH 当前项目空间...' },
    });

    try {
      const settings = await getSettings();
      const project = await getActiveProject();
      const activeTopics = (settings.activeTopics && settings.activeTopics.length > 0)
        ? settings.activeTopics
        : [settings.activeTopic || 'General'];

      const fileData = await downloadFileFromUrl(fileUrl);
      const derived = deriveFilename(fileUrl, fileData.serverFilename);
      const filename = fileData.serverFilename || derived.filename;
      const ext = derived.extension || 'bin';
      const sizeStr = formatFileSize(fileData.size);

      const item: CapturedItem = {
        id: `file-${Date.now()}`,
        project: project.name,
        topic: activeTopics.join('+'),
        topics: activeTopics,
        title: `[文件] ${filename}`,
        url: fileUrl,
        urlType: resolveUrlType(fileUrl),
        sourcePlatform: 'other',
        capturedAt: new Date().toISOString(),
        documentType: 'file',
        tags: ['Download', 'File', ext.toUpperCase(), ...activeTopics],
        markdownContent: `# 📁 文件下载索引: ${filename}\n\n> 🌐 **来源下载地址**: [${fileUrl}](${fileUrl})\n> 📄 **来源宿主页面**: [${tab.title || tab.url || '未知页面'}](${tab.url || fileUrl})\n> 🏷️ **归属主题**: ${activeTopics.join('、')}\n> 📦 **文件类型**: ${ext.toUpperCase()}\n> 📊 **文件大小**: ${sizeStr}\n> ⏰ **下载时刻**: ${new Date().toLocaleString()}\n\n---\n### 💾 本地物理文件\n- 相对路径: \`assets/${filename}\`\n- 存储空间: \`dshWebSensor/${activeTopics.join('+')}/.../assets/${filename}\`\n`,
        mediaAttachments: [
          {
            id: `att-file-${Date.now()}`,
            type: 'file',
            originalUrl: fileUrl,
            filename: filename,
            localPath: `assets/${filename}`,
            blobDataUrl: fileData.dataUrl,
          },
        ],
      };

      const result = await executeSaveBundle(item);
      sendMessageWithAutoInject(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: `✓ 文件【${filename}】(${sizeStr}) 已存入 DSH 研究目录并完成索引！` },
      });
    } catch (err) {
      sendMessageWithAutoInject(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: `下载失败: ${(err as Error).message}`, isError: true },
      });
    }
  } else if (info.menuItemId === 'dsh-batch-download-files') {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      try {
        if (tab.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        }
      } catch (e) {
        console.warn('打开侧边栏失败', e);
      }
    }
    chrome.runtime.sendMessage({
      type: 'OPEN_DOWNLOAD_PANEL',
      payload: { autoScan: true, tabId: tab.id },
    }).catch(() => {});

    sendMessageWithAutoInject(tab.id, {
      type: 'SHOW_TOAST',
      payload: { message: '已开启 DSH 侧边栏【文件探测与批量下载】' },
    });
  } else if (info.menuItemId === 'dsh-capture-image') {
    const pageUrl = tab.url || info.pageUrl || info.frameUrl || info.srcUrl || 'local://image-asset';
    const originalSrc = info.srcUrl || '';
    const item: CapturedItem = {
      id: `img-${Date.now()}`,
      project: '',
      topic: '',
      title: `图片素材: ${tab.title || '网页图片'}`,
      url: pageUrl,
      sourcePlatform: 'web_article',
      capturedAt: new Date().toISOString(),
      documentType: 'media',
      tags: ['Image', 'Asset'],
      markdownContent: `![${tab.title || 'image'}](${originalSrc})\n\n> 🌐 **来源页面**: [${pageUrl}](${pageUrl})\n> 🖼️ **原图地址**: ${originalSrc || '未知'}\n> ⏰ **抓取时刻**: ${new Date().toLocaleString()}`,
      mediaAttachments: [
        {
          id: `att-${Date.now()}`,
          type: 'image',
          originalUrl: originalSrc,
          filename: `img_${Date.now()}.png`,
          localPath: `assets/img_${Date.now()}.png`,
        },
      ],
    };

    try {
      const result = await executeSaveBundle(item);
      sendMessageWithAutoInject(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: `图片已保存至 ${result.savedPath}` },
      });
    } catch (err) {
      sendMessageWithAutoInject(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: `保存失败: ${(err as Error).message}`, isError: true },
      });
    }
  }
});

// 监听来自 Content Script 或 Side Panel 的消息
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'CAPTURE_VISIBLE_TAB_REQUEST') {
    const targetWinId = _sender.tab?.windowId;
    const captureOptions = { format: 'png' as const };

    const captureActiveWindow = (primaryError?: string) => {
      chrome.tabs.captureVisibleTab(captureOptions, (fallbackDataUrl) => {
        if (chrome.runtime.lastError || !fallbackDataUrl) {
          // 若直接抓取失败，回退尝试获取当前最后聚焦的窗口抓取
          chrome.windows.getLastFocused({ populate: false }, (win) => {
            if (win && typeof win.id === 'number' && win.id > 0 && win.id !== targetWinId) {
              chrome.tabs.captureVisibleTab(win.id, captureOptions, (lastUrl) => {
                if (chrome.runtime.lastError || !lastUrl) {
                  sendResponse({
                    success: false,
                    error: chrome.runtime.lastError?.message || primaryError || '可视区域截屏失败',
                  });
                } else {
                  sendResponse({ success: true, dataUrl: lastUrl });
                }
              });
            } else {
              sendResponse({
                success: false,
                error: chrome.runtime.lastError?.message || primaryError || '可视区域截屏失败',
              });
            }
          });
        } else {
          sendResponse({ success: true, dataUrl: fallbackDataUrl });
        }
      });
    };

    if (typeof targetWinId === 'number' && targetWinId > 0) {
      chrome.tabs.captureVisibleTab(targetWinId, captureOptions, (dataUrl) => {
        if (!chrome.runtime.lastError && dataUrl) {
          sendResponse({ success: true, dataUrl });
        } else {
          const err = chrome.runtime.lastError?.message;
          captureActiveWindow(err);
        }
      });
    } else {
      captureActiveWindow();
    }
    return true;
  }

  if (message.type === 'SAVE_BUNDLE') {
    const item = message.payload as CapturedItem;
    executeSaveBundle(item)
      .then(res => {
        sendResponse({ success: true, data: res });
      })
      .catch(err => {
        sendResponse({ success: false, error: (err as Error).message });
      });
    return true; // 异步响应保持通道
  }

  if (message.type === 'PING') {
    sendResponse({ pong: true });
    return true;
  }
});
