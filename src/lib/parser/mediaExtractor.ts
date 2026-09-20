import { MediaAttachment } from '@/types';

/**
 * 将在线图片转换为 Base64 Data URL
 */
export async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to fetch image blob:', url, e);
    return null;
  }
}

/**
 * 扫描指定 HTML 元素中的所有图片，并下载打包为 MediaAttachment 列表，
 * 同时返回将原始图片 URL 替换为本地 assets/ 路径的 HTML/Markdown
 */
export async function extractAndBundleImages(
  container: HTMLElement,
  downloadImages = true
): Promise<{ attachments: MediaAttachment[]; urlMap: Map<string, string> }> {
  const images = Array.from(container.querySelectorAll('img'));
  const attachments: MediaAttachment[] = [];
  const urlMap = new Map<string, string>();

  let counter = 1;
  for (const img of images) {
    const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
    if (!src || src.startsWith('data:') || urlMap.has(src)) continue;

    // 过滤掉极小的头像/图标（小于 32px）
    if (img.naturalWidth > 0 && img.naturalWidth < 32 && img.naturalHeight < 32) {
      continue;
    }

    const extMatch = src.match(/\.(png|jpe?g|gif|webp|svg)/i);
    const ext = extMatch ? extMatch[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
    const filename = `img_${String(counter).padStart(2, '0')}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const localPath = `assets/${filename}`;

    urlMap.set(src, localPath);

    let blobDataUrl: string | undefined = undefined;
    if (downloadImages) {
      blobDataUrl = (await urlToDataUrl(src)) || undefined;
    }

    attachments.push({
      id: `media-${Date.now()}-${counter}`,
      type: 'image',
      originalUrl: src,
      filename,
      localPath,
      blobDataUrl,
    });

    counter++;
  }

  return { attachments, urlMap };
}

/**
 * 在生成的 Markdown 中将原始图片网络链接替换为本地 assets/ 路径
 */
export function replaceMarkdownImageUrls(markdown: string, urlMap: Map<string, string>): string {
  let result = markdown;
  urlMap.forEach((localPath, originalUrl) => {
    // 匹配 ![alt](url)
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`!\\[(.*?)\\]\\(${escapedUrl}\\)`, 'g');
    result = result.replace(regex, `![$1](${localPath})`);
  });
  return result;
}
