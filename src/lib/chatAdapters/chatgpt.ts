import { IChatAdapter, ExtractedTurn, ExtractedSession } from './types';
import { htmlToMarkdown } from '../parser/turndown';

export class ChatGPTAdapter implements IChatAdapter {
  readonly id = 'chatgpt';
  readonly name = 'ChatGPT';

  matches(url: string): boolean {
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }

  detectTurns(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-message-author-role="assistant"]'));
  }

  extractTurn(turnEl: HTMLElement): ExtractedTurn | null {
    try {
      // 1. 提取回答内容
      const markdownEl = turnEl.querySelector('.markdown') || turnEl;
      const answer = htmlToMarkdown(markdownEl.innerHTML).trim();

      // 2. 寻找前置的用户提问
      let prompt = '';
      const turnRow = turnEl.closest('[data-testid^="conversation-turn"]') || turnEl.parentElement;
      const prevTurnRow = turnRow?.previousElementSibling;
      if (prevTurnRow) {
        const userEl = prevTurnRow.querySelector('[data-message-author-role="user"]');
        if (userEl) {
          prompt = userEl.textContent?.trim() || '';
        }
      }
      if (!prompt) {
        prompt = 'ChatGPT 对话提问';
      }

      // 3. 检查思考过程 (o1 / o3 模型的思维链)
      let thinking = '';
      const thoughtEl = turnEl.querySelector('[data-testid="thought"], div[class*="thought"]');
      if (thoughtEl) {
        thinking = thoughtEl.textContent?.trim() || '';
      }

      const currentUrl = (typeof window !== 'undefined' ? window.location.href : '') || 'https://chatgpt.com';
      let markdown = `# 💬 ChatGPT 对话轮次\n\n> 🌐 **来源地址**: [${currentUrl}](${currentUrl})\n> ⏰ **抓取时刻**: ${new Date().toLocaleString()}\n> 🏷️ **模型**: ChatGPT (OpenAI)\n\n---\n\n### ❓ Prompt\n\n${prompt}\n\n`;
      if (thinking) {
        markdown += `<details>\n<summary>🧠 ChatGPT 思考过程 (Thought Chain)</summary>\n\n${thinking}\n\n</details>\n\n`;
      }
      markdown += `### 💡 ChatGPT 回答\n\n${answer}\n\n`;

      return {
        prompt,
        answer,
        thinking,
        modelName: 'ChatGPT (OpenAI)',
        markdown,
      };
    } catch (e) {
      console.warn('解析 ChatGPT 轮次失败', e);
      return null;
    }
  }

  extractSession(): ExtractedSession | null {
    const turnsEls = this.detectTurns();
    if (turnsEls.length === 0) return null;

    const turns: ExtractedTurn[] = [];
    turnsEls.forEach((el, idx) => {
      const turn = this.extractTurn(el);
      if (turn) {
        turn.turnIndex = idx + 1;
        turns.push(turn);
      }
    });

    const pageTitle = document.title.replace('- ChatGPT', '').trim() || 'ChatGPT 对话记录';
    let fullMarkdown = `# ${pageTitle}\n\n> 来源: [ChatGPT](${window.location.href})\n> 归档时间: ${new Date().toLocaleString()}\n---\n\n`;

    turns.forEach((t, i) => {
      fullMarkdown += `## 轮次 ${i + 1}\n\n${t.markdown}\n---\n\n`;
    });

    return {
      title: pageTitle,
      modelName: 'ChatGPT',
      turns,
      markdown: fullMarkdown,
    };
  }

  injectUI(onSaveTurn: (turn: ExtractedTurn) => void): void {
    const turns = this.detectTurns();
    turns.forEach(el => {
      if (el.dataset.dshInjected === 'true') return;
      el.dataset.dshInjected = 'true';

      const actionsBar = el.querySelector('div[class*="items-center"], div[class*="text-gray-500"]') || el;
      const btn = document.createElement('button');
      btn.className = 'dsh-chat-inject-btn';
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `;
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const turnData = this.extractTurn(el);
        if (turnData) {
          btn.innerText = '已存入 ✓';
          setTimeout(() => {
            btn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `;
          }, 2500);
          onSaveTurn(turnData);
        }
      };

      actionsBar.appendChild(btn);
    });
  }
}
