import { get, set, del } from 'idb-keyval';
import { CapturedItem, resolveUrlType } from '@/types';

const DIR_HANDLE_PREFIX = 'dsh_fs_dir_handle_';

/**
 * 确保给定目录句柄下物理存在 dshWebSensor 子目录
 */
export async function ensureSensorDirectoryOnHandle(handle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  return await handle.getDirectoryHandle('dshWebSensor', { create: true });
}

/**
 * 请求用户在浏览器中选取一个本地磁盘文件夹作为项目的工作空间保存目录
 * 选取后自动创建/确保 /dshWebSensor 子目录存在，并同时持久化到当前项目与全局根目录
 */
export async function pickWorkspaceDirectory(projectId: string): Promise<{ name: string; handle: FileSystemDirectoryHandle }> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('当前浏览器不支持 File System Access API，请使用现代 Chromium 内核浏览器');
  }

  // 调起系统原生文件夹选取框
  const handle = await (window as unknown as { showDirectoryPicker: (options?: { mode?: string }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({
    mode: 'readwrite',
  });

  // 自动建议并立即物理创建 dshWebSensor 子目录
  try {
    await handle.getDirectoryHandle('dshWebSensor', { create: true });
  } catch (err) {
    console.warn('自动在授权目录中创建 dshWebSensor 失败:', err);
  }

  // 保存句柄到 IndexedDB（针对当前项目、最新句柄以及根空间）
  await set(`${DIR_HANDLE_PREFIX}${projectId}`, handle);
  await set(`${DIR_HANDLE_PREFIX}latest`, handle);
  await set(`${DIR_HANDLE_PREFIX}root`, handle);

  return { name: handle.name, handle };
}

/**
 * 获取已保存的项目目录句柄并验证/请求读写权限。
 * 若当前项目尚未单独选取，自动尝试复用已授权的工作区根句柄或为其创建子目录，实现项目无缝切换！
 */
export async function getWorkspaceDirectoryHandle(projectId: string, projectName?: string): Promise<FileSystemDirectoryHandle | null> {
  let handle = await get<FileSystemDirectoryHandle>(`${DIR_HANDLE_PREFIX}${projectId}`);

  // 若当前项目无独立句柄，尝试复用已授权的根句柄/最新句柄
  if (!handle) {
    const rootHandle = await get<FileSystemDirectoryHandle>(`${DIR_HANDLE_PREFIX}root`) 
      || await get<FileSystemDirectoryHandle>(`${DIR_HANDLE_PREFIX}latest`);
    if (rootHandle) {
      // 验证根句柄权限
      try {
        const queryRes = await (rootHandle as unknown as { queryPermission: (options: { mode: string }) => Promise<string> }).queryPermission({ mode: 'readwrite' });
        if (queryRes === 'granted') {
          if (projectName && projectName !== rootHandle.name) {
            try {
              // 自动在根目录下为新项目开辟专属子目录
              const projDir = await rootHandle.getDirectoryHandle(projectName, { create: true });
              await projDir.getDirectoryHandle('dshWebSensor', { create: true });
              await set(`${DIR_HANDLE_PREFIX}${projectId}`, projDir);
              return projDir;
            } catch {
              handle = rootHandle;
            }
          } else {
            handle = rootHandle;
          }
        }
      } catch (err) {
        console.warn('验证工作区根句柄权限失败', err);
      }
    }
  }

  if (!handle) return null;

  // 校验权限并确保 dshWebSensor 存在
  try {
    const queryResult = await (handle as unknown as { queryPermission: (options: { mode: string }) => Promise<string> }).queryPermission({ mode: 'readwrite' });
    if (queryResult === 'granted') {
      await ensureSensorDirectoryOnHandle(handle).catch(() => {});
      return handle;
    }
    const requestResult = await (handle as unknown as { requestPermission: (options: { mode: string }) => Promise<string> }).requestPermission({ mode: 'readwrite' });
    if (requestResult === 'granted') {
      await ensureSensorDirectoryOnHandle(handle).catch(() => {});
      return handle;
    }
  } catch (err) {
    console.warn('验证或请求目录句柄权限失败', err);
  }
  return null;
}

/**
 * 清除已保存的目录句柄
 */
export async function clearWorkspaceDirectoryHandle(projectId: string): Promise<void> {
  await del(`${DIR_HANDLE_PREFIX}${projectId}`);
}

/**
 * 将采集条目完整落盘到 FileSystemDirectoryHandle 指定的目录结构中
 * 路径规范: {ProjectDir}/{Topic}/{YYYYMMDD}_{slug}/
 * 文件包含: content.md, metadata.json, assets/*
 */
export async function saveBundleViaFsAccess(
  handle: FileSystemDirectoryHandle,
  item: CapturedItem
): Promise<{ success: boolean; targetPath: string }> {
  const safeTopic = (item.topic || 'General').replace(/[\\/:*?"<>|]/g, '_');
  const dateStr = item.capturedAt.slice(0, 10).replace(/-/g, '');
  const slug = (item.title || 'untitled')
    .slice(0, 30)
    .trim()
    .replace(/[\\/:*?"<>|\s]+/g, '_');
  const bundleFolderName = `${dateStr}_${slug}_${item.id.slice(-6)}`;

  // 1. 自动切换或创建项目空间根目录下的 dshWebSensor 子目录
  const sensorDir = await handle.getDirectoryHandle('dshWebSensor', { create: true });

  // 2. 在 dshWebSensor 下获取或创建 Topic 目录
  const topicDir = await sensorDir.getDirectoryHandle(safeTopic, { create: true });

  // 3. 创建当前线索独立的资产包目录
  const bundleDir = await topicDir.getDirectoryHandle(bundleFolderName, { create: true });

  // 3. 写入 content.md
  const mdFile = await bundleDir.getFileHandle('content.md', { create: true });
  const mdWritable = await mdFile.createWritable();
  await mdWritable.write(item.markdownContent);
  await mdWritable.close();

  // 4. 写入 metadata.json
  const metaObj = {
    id: item.id,
    project: item.project,
    topic: item.topic,
    topics: item.topics || [item.topic],
    title: item.title,
    url: item.url,
    url_type: item.urlType || resolveUrlType(item.url),
    source_platform: item.sourcePlatform,
    captured_at: item.capturedAt,
    document_type: item.documentType,
    tags: item.tags,
    ai_summary: item.aiSummary || '',
    user_notes: item.userNotes || '',
    ai_metadata: item.aiMetadata || {},
    is_screenshot: item.documentType === 'screenshot',
    screenshot_metadata: item.screenshotMetadata || null,
    media_attachments: item.mediaAttachments.map(m => ({
      id: m.id,
      type: m.type,
      original_url: m.originalUrl,
      filename: m.filename,
      local_path: m.localPath,
    })),
  };
  const metaFile = await bundleDir.getFileHandle('metadata.json', { create: true });
  const metaWritable = await metaFile.createWritable();
  await metaWritable.write(JSON.stringify(metaObj, null, 2));
  await metaWritable.close();

  // 5. 如果有静态资源附件，创建 assets/ 目录并写入
  if (item.mediaAttachments && item.mediaAttachments.length > 0) {
    const assetsDir = await bundleDir.getDirectoryHandle('assets', { create: true });
    for (const attachment of item.mediaAttachments) {
      if (attachment.blobDataUrl) {
        try {
          const res = await fetch(attachment.blobDataUrl);
          const blob = await res.blob();
          const assetFile = await assetsDir.getFileHandle(attachment.filename, { create: true });
          const assetWritable = await assetFile.createWritable();
          await assetWritable.write(blob);
          await assetWritable.close();
        } catch (e) {
          console.warn(`写入附件 ${attachment.filename} 失败:`, e);
        }
      }
    }
  }

  const relativePath = `dshWebSensor/${safeTopic}/${bundleFolderName}/`;
  return { success: true, targetPath: relativePath };
}
