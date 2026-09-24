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

// 正则检测特殊下载接口 URL (如 GitHub releases, 云盘直链, 带有 download/attachment 参数等)
const DOWNLOAD_URL_PATTERNS = [
  /\/releases\/download\//i,
  /\/download\b/i,
  /\bexport=download\b/i,
  /\bresponse-content-disposition=attachment\b/i,
  /\battachment\b/i,
  /\bfile_download\b/i,
  /\/raw\//i,
  /\/blobs\/download\//i,
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
  if (!rawUrl || rawUrl.startsWith('javascript:') || rawUrl.startsWith('#') || rawUrl.startsWith('mailto:')) {
    return false;
  }

  if (downloadAttr !== undefined && downloadAttr !== null) {
    return true;
  }

  // 提取路径中的扩展名
  try {
    const urlObj = new URL(rawUrl, 'https://example.com');
    const pathname = urlObj.pathname.toLowerCase();
    
    // 检查已知扩展名
    for (const ext of Object.keys(EXTENSION_CATEGORY_MAP)) {
      if (pathname.endsWith(`.${ext}`) || pathname.includes(`.${ext}/`)) {
        return true;
      }
    }

    // 检查已知下载 pattern
    for (const pattern of DOWNLOAD_URL_PATTERNS) {
      if (pattern.test(rawUrl)) {
        return true;
      }
    }
  } catch {
    // 无法解析为标准 URL
  }

  return false;
}

/**
 * 扫描 DOM 节点（或者选定容器/整篇 document）中的所有可下载文件
 */
export function scanElementForDownloadableFiles(container: Document | HTMLElement, baseUrl: string): DownloadableFile[] {
  const results: DownloadableFile[] = [];
  const seenUrls = new Set<string>();

  // 1. 扫描 <a> 标签
  const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href]');
  anchors.forEach(a => {
    const rawHref = a.getAttribute('href');
    if (!rawHref) return;

    let absoluteUrl = '';
    try {
      absoluteUrl = new URL(rawHref, baseUrl).href;
    } catch {
      return;
    }

    const downloadAttr = a.getAttribute('download');
    if (!isDownloadableUrl(absoluteUrl, downloadAttr)) {
      return;
    }

    // 去重
    const normalizedUrl = absoluteUrl.split('#')[0];
    if (seenUrls.has(normalizedUrl)) {
      return;
    }
    seenUrls.add(normalizedUrl);

    const linkText = a.innerText?.trim() || a.getAttribute('title') || a.getAttribute('aria-label') || '';
    const surroundingText = a.parentElement?.innerText || '';
    const { filename, extension } = deriveFilename(absoluteUrl, downloadAttr, linkText);
    const category = getCategoryForExtension(extension, absoluteUrl);
    const fileSizeEstimate = extractSizeEstimate(linkText) || extractSizeEstimate(surroundingText);

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
  });

  // 2. 扫描 <iframe> / <embed> / <object> (例如内嵌 PDF 预览)
  const embeds = container.querySelectorAll<HTMLElement>('iframe[src], embed[src], object[data]');
  embeds.forEach(elem => {
    const src = elem.getAttribute('src') || elem.getAttribute('data');
    if (!src) return;

    let absoluteUrl = '';
    try {
      absoluteUrl = new URL(src, baseUrl).href;
    } catch {
      return;
    }

    if (!isDownloadableUrl(absoluteUrl)) {
      return;
    }

    const normalizedUrl = absoluteUrl.split('#')[0];
    if (seenUrls.has(normalizedUrl)) return;
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
  });

  // 3. 扫描 <video> / <audio> / <source> 多媒体直链
  const mediaElements = container.querySelectorAll<HTMLElement>('video[src], audio[src], source[src]');
  mediaElements.forEach(elem => {
    const src = elem.getAttribute('src');
    if (!src) return;

    let absoluteUrl = '';
    try {
      absoluteUrl = new URL(src, baseUrl).href;
    } catch {
      return;
    }

    if (!isDownloadableUrl(absoluteUrl)) return;

    const normalizedUrl = absoluteUrl.split('#')[0];
    if (seenUrls.has(normalizedUrl)) return;
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
  });

  return results;
}
