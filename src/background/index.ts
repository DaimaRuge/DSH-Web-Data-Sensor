import { executeSaveBundle } from '@/lib/storage/bundleSaver';
import { CapturedItem, ExtensionMessage } from '@/types';

// 配置点击扩展图标直接打开 Side Panel
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

// 初始化右键菜单
chrome.runtime.onInstalled.addListener(() => {
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

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'dsh-capture-page') {
    chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_FULL_PAGE' });
  } else if (info.menuItemId === 'dsh-capture-selection') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_SELECTION',
      payload: { text: info.selectionText },
    });
  } else if (info.menuItemId === 'dsh-capture-screenshot') {
    chrome.tabs.sendMessage(tab.id, { type: 'START_SCREENSHOT_CAPTURE' });
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
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: `图片已保存至 ${result.savedPath}` },
      });
    } catch (err) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_TOAST',
        payload: { message: `保存失败: ${(err as Error).message}`, isError: true },
      });
    }
  }
});

// 监听来自 Content Script 或 Side Panel 的消息
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'CAPTURE_VISIBLE_TAB_REQUEST') {
    const windowId = _sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;
    chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({ success: false, error: chrome.runtime.lastError?.message || '可视区域截屏失败' });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
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
