import { Readability } from '@mozilla/readability';
import { htmlToMarkdown } from './turndown';
import { extractAndBundleImages, replaceMarkdownImageUrls } from './mediaExtractor';
import { MediaAttachment } from '@/types';

export interface ParsedArticle {
  title: string;
  byline?: string;
  excerpt?: string;
  markdown: string;
  rawHtml: string;
  mediaAttachments: MediaAttachment[];
}

/**
 * 基于 Readability 解析当前页面的主体文章，提取 Markdown 与多模态资源
 */
export async function parseCurrentPageArticle(doc: Document, downloadImages = true): Promise<ParsedArticle> {
  // 克隆 document 避免污染当前页面 DOM
  const documentClone = doc.cloneNode(true) as Document;
  const reader = new Readability(documentClone, {
    charThreshold: 20,
    keepClasses: true,
  });

  const article = reader.parse();
  const title = article?.title || doc.title || 'Untitled Web Page';
  const byline = article?.byline || '';
  const excerpt = article?.excerpt || '';
  const rawHtml = article?.content || doc.body.innerHTML;

  // 创建一个临时容器提取图片资源
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = rawHtml;

  const { attachments, urlMap } = await extractAndBundleImages(tempDiv, downloadImages);
  
  // 转换主体为 Markdown
  let markdown = htmlToMarkdown(rawHtml);
  markdown = replaceMarkdownImageUrls(markdown, urlMap);

  // 拼接元数据头部
  const header = `# ${title}\n\n> 来源: [${doc.location.href}](${doc.location.href})\n> 抓取时间: ${new Date().toLocaleString()}\n${byline ? `> 作者: ${byline}\n` : ''}\n---\n\n`;

  return {
    title,
    byline,
    excerpt,
    markdown: header + markdown,
    rawHtml,
    mediaAttachments: attachments,
  };
}
