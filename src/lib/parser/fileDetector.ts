/**
 * DSH Web Sensor - 页面可下载文件嗅探与解析引擎
 */

export type FileCategory = 'document' | 'data' | 'archive' | 'model' | 'media' | 'code' | 'other';

export interface DownloadableFile {
  id: string;
  url: string;
  filename: string;
  extension: string;
  category: FileCategory;
  title: string;
  fileSizeEstimate?: string;
  isSelected?: boolean;
  status?: 'pending' | 'downloading' | 'saved' | 'error';
  errorMessage?: string;
  savedPath?: string;
}

// 扩展名映射表
const EXTENSION_CATEGORY_MAP: Record<string, FileCategory> = {
  // 文档
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  ppt: 'document',
  pptx: 'document',
  xls: 'document',
  xlsx: 'document',
  txt: 'document',
  rtf: 'document',
  epub: 'document',
  mobi: 'document',
  pages: 'document',
  key: 'document',
  numbers: 'document',

  // 数据表格与结构化数据
  csv: 'data',
  tsv: 'data',
  json: 'data',
  jsonl: 'data',
  parquet: 'data',
  arrow: 'data',
  sql: 'data',
  xml: 'data',
  yaml: 'data',
  yml: 'data',

  // 压缩文件
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  tgz: 'archive',
  bz2: 'archive',
  xz: 'archive',

  // AI 模型与权重
  safetensors: 'model',
  gguf: 'model',
  onnx: 'model',
  bin: 'model',
  pt: 'model',
  pth: 'model',
  ckpt: 'model',
  h5: 'model',

  // 音视频多媒体
  mp3: 'media',
  mp4: 'media',
  wav: 'media',
  m4a: 'media',
  flac: 'media',
  aac: 'media',
  webm: 'media',
  avi: 'media',
  mov: 'media',
  mkv: 'media',

  // 代码与脚本
  py: 'code',
  ipynb: 'code',
  js: 'code',
  ts: 'code',
  rs: 'code',
  go: 'code',
  cpp: 'code',
  c: 'code',
  java: 'code',
  sh: 'code',
};

// 正则检测特殊下载接口 URL (如 GitHub releases, 云盘直链, 带有 export=download 参数等)
const DOWNLOAD_URL_PATTERNS = [
  /\/releases\/download\/[^/]+\/[^/]+$/i,
  /\/raw\/[^/]+\/[^/]+\.[a-zA-Z0-9]{2,6}$/i,
  /\/blobs\/download\/[^/]+$/i,
  /[?&](?:export|action|download)=download\b/i,
  /[?&]response-content-disposition=attachment\b/i,
];

/**
 * 从 URL、download 属性或锚点文本清洗并推导合理的文件名
 */
export function deriveFilename(rawUrl: string, downloadAttr?: string | null, linkText?: string | null): { filename: string; extension: string } {
  let cleanName = '';

  // 1. 优先使用 download 属性声明的文件名
  if (downloadAttr && downloadAttr.trim()) {
    cleanName = downloadAttr.trim();
  }

  // 2. 尝试从 URL 路径中提取
  if (!cleanName) {
    try {
      const parsedUrl = new URL(rawUrl, 'https://example.com');
      const pathname = parsedUrl.pathname;
      const lastSegment = pathname.split('/').filter(Boolean).pop();
      if (lastSegment) {
        cleanName = decodeURIComponent(lastSegment);
      }
      
      // 如果末尾没有扩展名，但 query 中有 filename / file 参数
      if (!cleanName.includes('.') && parsedUrl.search) {
        const queryParams = parsedUrl.searchParams;
        const qFile = queryParams.get('filename') || queryParams.get('file') || queryParams.get('name');
        if (qFile) {
          cleanName = decodeURIComponent(qFile);
        }
      }
    } catch {
      // 容错处理
    }
  }

  // 3. 尝试从链接文本中提取
  if ((!cleanName || !cleanName.includes('.')) && linkText && linkText.trim()) {
    const trimmed = linkText.trim();
    // 检查链接文本是否形如 "xxx.pdf" 或包含扩展名
    const match = trimmed.match(/[\w\u4e00-\u9fa5\-_()\[\]]+\.[a-zA-Z0-9]{2,8}\b/);
    if (match) {
      cleanName = match[0];
    } else if (!cleanName) {
      cleanName = trimmed;
    }
  }

  // 4. 清理非法字符
  cleanName = cleanName.replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim();
  if (!cleanName) {
    cleanName = `download_${Date.now()}`;
  }

  // 5. 提取扩展名
  let ext = '';
  const lastDotIdx = cleanName.lastIndexOf('.');
  if (lastDotIdx > 0 && lastDotIdx < cleanName.length - 1) {
    ext = cleanName.slice(lastDotIdx + 1).toLowerCase();
  }

  // 6. 如果仍然没有扩展名，尝试根据 URL 猜测
  if (!ext) {
    for (const knownExt of Object.keys(EXTENSION_CATEGORY_MAP)) {
      if (rawUrl.toLowerCase().includes(`.${knownExt}`)) {
        ext = knownExt;
        cleanName = `${cleanName}.${ext}`;
        break;
      }
    }
  }

  return { filename: cleanName, extension: ext };
}

/**
 * 根据扩展名或 URL 推断文件分类
 */
export function getCategoryForExtension(ext: string, rawUrl: string): FileCategory {
  const normalizedExt = ext.toLowerCase();
  if (normalizedExt in EXTENSION_CATEGORY_MAP) {
    return EXTENSION_CATEGORY_MAP[normalizedExt];
  }
  for (const pattern of DOWNLOAD_URL_PATTERNS) {
    if (pattern.test(rawUrl)) {
      return 'other';
    }
  }
  return 'other';
}

/**
 * 从周边文本提取可能的估算文件大小（例如 "2.4 MB", "500 KB", "1.2G"）
 */
export function extractSizeEstimate(text: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/\b(\d+(?:\.\d+)?)\s*(GB|MB|KB|Bytes|G|M|K)\b/i);
  if (match) {
    return `${match[1]} ${match[2].toUpperCase()}`;
  }
  return undefined;
}

/**
 * 判断一个 URL 是否为可下载文件
 */
export function isDownloadableUrl(rawUrl: string, downloadAttr?: string | null): boolean {
  if (!rawUrl || rawUrl.startsWith('javascript:') || rawUrl.startsWith('#') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) {
    return false;
  }

  // 若明确带有 download 属性，直接认定为下载项
  if (downloadAttr !== undefined && downloadAttr !== null) {
    return true;
  }

  try {
    const urlObj = new URL(rawUrl, 'https://example.com');
    const pathname = urlObj.pathname.toLowerCase();

    // 显式排除常见网页端动态路由及 html 页面，绝非独立文件
    if (/\.(html?|shtml|php|jsp|asp|aspx)(?:[?#]|$)/i.test(pathname)) {
      return false;
    }

    // 1. 严格检查末尾文件名（例如 /path/to/doc.pdf -> 扩展名为 pdf）
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments.pop() || '';
    const dotIdx = lastSegment.lastIndexOf('.');
    if (dotIdx > 0 && dotIdx < lastSegment.length - 1) {
      const ext = lastSegment.slice(dotIdx + 1);
      if (ext in EXTENSION_CATEGORY_MAP) {
        // 对常见网页脚本文档 (.js, .css) 仅在含有 download 属性或显式文件时接纳，防止抓到页面本身的 script 链接
        if (ext === 'js') {
          return false;
        }
        return true;
      }
    }

    // 2. 检查 query 参数中的明确文件名（如 ?file=paper.pdf 或 ?filename=dataset.csv）
    if (urlObj.search) {
      for (const key of ['filename', 'file', 'name', 'attachment']) {
        const val = urlObj.searchParams.get(key);
        if (val && val.includes('.')) {
          const qExt = val.split('.').pop()?.toLowerCase();
          if (qExt && qExt in EXTENSION_CATEGORY_MAP && qExt !== 'js') {
            return true;
          }
        }
      }
    }

    // 3. 检查白名单专用下载接口 Pattern
    for (const pattern of DOWNLOAD_URL_PATTERNS) {
      if (pattern.test(rawUrl)) {
        return true;
      }
    }
  } catch {
    // 无法解析标准 URL
  }

  return false;
}

/**
 * 扫描 DOM 节点（或者选定容器/整篇 document）中的所有可下载文件
 */
export function scanElementForDownloadableFiles(container: Document | HTMLElement, baseUrl: string): DownloadableFile[] {
  const results: DownloadableFile[] = [];
  const seenUrls = new Set<string>();
  const MAX_DETECTED_FILES = 120; // 严格上限，杜绝内存与 DOM 树雪崩

  // 1. 扫描 <a> 标签
  const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href]');
  for (let i = 0; i < anchors.length; i++) {
    if (results.length >= MAX_DETECTED_FILES) break;
    const a = anchors[i];

    const rawHref = a.getAttribute('href');
    if (!rawHref) continue;

    let absoluteUrl = '';
    try {
      absoluteUrl = new URL(rawHref, baseUrl).href;
    } catch {
      continue;
    }

    const downloadAttr = a.getAttribute('download');
    if (!isDownloadableUrl(absoluteUrl, downloadAttr)) {
      continue;
    }

    // 去重
    const normalizedUrl = absoluteUrl.split('#')[0];
    if (seenUrls.has(normalizedUrl)) {
      continue;
    }
    seenUrls.add(normalizedUrl);

    // 采用 textContent 替代 innerText，避免强制触发浏览器同步布局 (Forced Reflow)
    const linkText = (a.textContent || '').trim() || a.getAttribute('title') || a.getAttribute('aria-label') || '';
    // 仅安全获取紧邻后继文本节点极短片段（如 " (1.5 MB)"），绝不遍历整个父容器序列化大文本
    const siblingText = (a.nextSibling?.textContent || '').trim().slice(0, 60);

    const { filename, extension } = deriveFilename(absoluteUrl, downloadAttr, linkText);
    const category = getCategoryForExtension(extension, absoluteUrl);
    const fileSizeEstimate = extractSizeEstimate(linkText) || extractSizeEstimate(siblingText);

    results.push({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: absoluteUrl,
      filename,
      extension: extension || 'bin',
      category,
      title: linkText || filename,
      fileSizeEstimate,
      isSelected: true,
      status: 'pending',
    });
  }

  // 2. 扫描 <iframe> / <embed> / <object> (例如内嵌 PDF 预览)
  if (results.length < MAX_DETECTED_FILES) {
    const embeds = container.querySelectorAll<HTMLElement>('iframe[src], embed[src], object[data]');
    for (let i = 0; i < embeds.length; i++) {
      if (results.length >= MAX_DETECTED_FILES) break;
      const elem = embeds[i];
      const src = elem.getAttribute('src') || elem.getAttribute('data');
      if (!src) continue;

      let absoluteUrl = '';
      try {
        absoluteUrl = new URL(src, baseUrl).href;
      } catch {
        continue;
      }

      if (!isDownloadableUrl(absoluteUrl)) continue;

      const normalizedUrl = absoluteUrl.split('#')[0];
      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);

      const { filename, extension } = deriveFilename(absoluteUrl);
      const category = getCategoryForExtension(extension, absoluteUrl);

      results.push({
        id: `file-embed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: absoluteUrl,
        filename,
        extension: extension || 'pdf',
        category,
        title: `[内嵌文档] ${filename}`,
        isSelected: true,
        status: 'pending',
      });
    }
  }

  // 3. 扫描 <video> / <audio> / <source> 多媒体直链
  if (results.length < MAX_DETECTED_FILES) {
    const mediaElements = container.querySelectorAll<HTMLElement>('video[src], audio[src], source[src]');
    for (let i = 0; i < mediaElements.length; i++) {
      if (results.length >= MAX_DETECTED_FILES) break;
      const elem = mediaElements[i];
      const src = elem.getAttribute('src');
      if (!src) continue;

      let absoluteUrl = '';
      try {
        absoluteUrl = new URL(src, baseUrl).href;
      } catch {
        continue;
      }

      if (!isDownloadableUrl(absoluteUrl)) continue;

      const normalizedUrl = absoluteUrl.split('#')[0];
      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);

      const { filename, extension } = deriveFilename(absoluteUrl);
      const category = getCategoryForExtension(extension, absoluteUrl);

      results.push({
        id: `file-media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: absoluteUrl,
        filename,
        extension: extension || 'mp4',
        category,
        title: `[音视频文件] ${filename}`,
        isSelected: true,
        status: 'pending',
      });
    }
  }

  return results;
}
