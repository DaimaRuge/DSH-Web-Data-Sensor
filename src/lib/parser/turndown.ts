import TurndownService from 'turndown';
// @ts-expect-error turndown-plugin-gfm has no official types
import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

// 启用 GitHub Flavored Markdown (表格, 删除线, 任务列表)
turndownService.use(gfm);

// 保留 details / summary 思考块结构
turndownService.addRule('detailsRule', {
  filter: 'details',
  replacement: function (content, node) {
    const element = node as HTMLElement;
    const summary = element.querySelector('summary')?.textContent || '思考过程 (Thinking)';
    // 移除原始 summary 节点文本以防重复
    const innerContent = content.replace(summary, '').trim();
    return `\n\n<details>\n<summary>${summary}</summary>\n\n${innerContent}\n\n</details>\n\n`;
  }
});

// 智能保留代码块及其语言标签
turndownService.addRule('fencedCodeBlock', {
  filter: function (node) {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild !== null &&
      node.firstChild.nodeName === 'CODE'
    );
  },
  replacement: function (_content, node) {
    const codeNode = node.firstChild as HTMLElement;
    const className = codeNode.getAttribute('class') || '';
    const langMatch = className.match(/(?:language|lang)-(\w+)/);
    const lang = langMatch ? langMatch[1] : '';
    return `\n\n\`\`\`${lang}\n${codeNode.textContent || ''}\n\`\`\`\n\n`;
  }
});

export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return turndownService.turndown(html);
}
