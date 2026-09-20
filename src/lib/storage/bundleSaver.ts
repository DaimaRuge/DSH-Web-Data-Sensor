import { CapturedItem } from '@/types';
import { getSettings, getActiveProject } from './settings';
import { getWorkspaceDirectoryHandle, saveBundleViaFsAccess } from './fsAccess';
import { checkBridgeHealth, saveBundleViaBridge } from './bridgeClient';
import { analyzeContentWithDeepSeek } from '../ai/deepseek';
import { trackEvent } from '../telemetry/tracker';

const HISTORY_KEY = 'dsh_recent_captures';

export async function getRecentCaptures(): Promise<CapturedItem[]> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const res = await chrome.storage.local.get(HISTORY_KEY);
    return res[HISTORY_KEY] || [];
  }
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addRecentCapture(item: CapturedItem): Promise<void> {
  const list = await getRecentCaptures();
  // 只保留最近 50 条记录在插件本地缓存，避免存储溢出
  const updated = [item, ...list.filter(i => i.id !== item.id)].slice(0, 50);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [HISTORY_KEY]: updated });
  } else {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }
}

export interface SaveResult {
  success: boolean;
  mode: 'fs_access' | 'local_bridge' | 'downloads';
  savedPath: string;
  message?: string;
  item: CapturedItem;
}

/**
 * 核心统一落盘管道：智能路由 Track A (FS Access) 与 Track B (Local Bridge)
 */
export async function executeSaveBundle(itemToSave: CapturedItem): Promise<SaveResult> {
  const settings = await getSettings();
  const project = await getActiveProject();

  const activeTopics = (itemToSave.topics && itemToSave.topics.length > 0)
    ? itemToSave.topics
    : (settings.activeTopics && settings.activeTopics.length > 0)
      ? settings.activeTopics
      : [settings.activeTopic || 'General'];

  const primaryTopic = itemToSave.topic || activeTopics.join('+');

  const item: CapturedItem = {
    ...itemToSave,
    project: itemToSave.project || project.name,
    topic: primaryTopic,
    topics: activeTopics,
    tags: Array.from(new Set([...(itemToSave.tags || []), ...activeTopics])),
  };

  // 1. 如果启用了 DeepSeek 智能分析且未手动设置摘要与标签
  if (
    settings.deepseekApiKey &&
    (settings.enableAutoSummary || settings.enableAutoTagging) &&
    (!item.aiSummary || item.tags.length === 0)
  ) {
    try {
      const aiResult = await analyzeContentWithDeepSeek(
        item.markdownContent,
        settings.deepseekApiKey,
        settings.deepseekModel,
        settings.deepseekBaseUrl
      );
      if (aiResult) {
        if (settings.enableAutoSummary && !item.aiSummary) {
          item.aiSummary = aiResult.summary;
        }
        if (settings.enableAutoTagging && (!item.tags || item.tags.length === 0)) {
          item.tags = Array.from(new Set([...(item.tags || []), ...aiResult.tags]));
        }
      }
    } catch (e) {
      console.warn('DeepSeek 预处理分析微降级', e);
    }
  }

  // 2. 检查轨 B：本地 DSH Bridge 是否存活
  const bridgeHealth = await checkBridgeHealth(settings.bridgeUrl);
  if (bridgeHealth && bridgeHealth.status === 'ok') {
    try {
      const bridgeRes = await saveBundleViaBridge(
        settings.bridgeUrl,
        project.workspacePath,
        item
      );
      item.status = 'saved';
      item.savedPath = bridgeRes.saved_path;
      await addRecentCapture(item);
      notifySaved(item);
      trackEvent({
        eventType: 'capture_item',
        projectId: project.id,
        projectName: project.name,
        topic: item.topic,
        url: item.url,
        pageTitle: item.title,
        metadata: {
          documentType: item.documentType,
          mode: 'local_bridge',
          savedPath: bridgeRes.saved_path,
          workspacePath: project.workspacePath,
        },
      }).catch(() => {});
      return {
        success: true,
        mode: 'local_bridge',
        savedPath: bridgeRes.saved_path,
        message: '已通过本地 DSH Bridge 存入本地磁盘',
        item,
      };
    } catch (e) {
      console.warn('Bridge 保存失败，尝试回退到 File System Access API', e);
    }
  }

  // 3. 检查轨 A：File System Access API 授权目录
  const dirHandle = await getWorkspaceDirectoryHandle(project.id);
  if (dirHandle) {
    try {
      const fsRes = await saveBundleViaFsAccess(dirHandle, item);
      item.status = 'saved';
      item.savedPath = `${project.workspacePath || dirHandle.name}/${fsRes.targetPath}`;
      await addRecentCapture(item);
      notifySaved(item);
      trackEvent({
        eventType: 'capture_item',
        projectId: project.id,
        projectName: project.name,
        topic: item.topic,
        url: item.url,
        pageTitle: item.title,
        metadata: {
          documentType: item.documentType,
          mode: 'fs_access',
          savedPath: item.savedPath,
          workspacePath: project.workspacePath,
        },
      }).catch(() => {});
      return {
        success: true,
        mode: 'fs_access',
        savedPath: item.savedPath,
        message: '已通过 Chrome File System API 写入本地授权目录',
        item,
      };
    } catch (err) {
      console.error('File System Access API 落盘失败:', err);
      throw new Error(`写入本地磁盘失败，请检查文件夹权限: ${(err as Error).message}`);
    }
  }

  // 4. 备选通道：通过 Chrome Downloads API 自动落盘至 Downloads/DSH_WebSensor/
  if (typeof chrome !== 'undefined' && chrome.downloads && chrome.downloads.download) {
    try {
      const safeProject = (project.name || 'default').replace(/[\\/:*?"<>|\s]/g, '_');
      const safeTopic = (item.topic || 'General').replace(/[\\/:*?"<>|\s]/g, '_');
      const dateStr = item.capturedAt.slice(0, 10).replace(/-/g, '');
      const slug = (item.title || 'untitled').slice(0, 25).trim().replace(/[\\/:*?"<>|\s]+/g, '_');
      const folder = `DSH_WebSensor/${safeProject}/${safeTopic}/${dateStr}_${slug}_${item.id.slice(-6)}`;

      // 4.1 下载 content.md
      const mdBlob = new Blob([item.markdownContent], { type: 'text/markdown;charset=utf-8' });
      const mdUrl = URL.createObjectURL(mdBlob);
      chrome.downloads.download({
        url: mdUrl,
        filename: `${folder}/content.md`,
        saveAs: false,
      });

      // 4.2 下载附件（如截图快照）
      for (const att of (item.mediaAttachments || [])) {
        if (att.blobDataUrl) {
          chrome.downloads.download({
            url: att.blobDataUrl,
            filename: `${folder}/assets/${att.filename}`,
            saveAs: false,
          });
        }
      }

      item.status = 'saved';
      item.savedPath = `Downloads/${folder}`;
      await addRecentCapture(item);

      notifySaved(item);
      return {
        success: true,
        mode: 'downloads',
        savedPath: item.savedPath,
        message: '已通过 Chrome 下载通道写入本地 Downloads/DSH_WebSensor 目录',
        item,
      };
    } catch (dErr) {
      console.warn('Chrome Downloads 备选通道落盘失败:', dErr);
    }
  }

  // 如果所有通道均受限，抛出友好指引
  throw new Error(
    `尚未配置有效落盘目标！请在 DSH 侧边栏为项目【${project.name}】授权本地文件夹，或启动本地 Bridge 服务 (127.0.0.1:8765)。`
  );
}

function notifySaved(item: CapturedItem) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'ITEM_SAVED_EVENT', payload: item }).catch(() => {});
  }
}
