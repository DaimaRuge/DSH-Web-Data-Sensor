import { IChatAdapter, ExtractedTurn, ExtractedSession } from './types';
import { htmlToMarkdown } from '../parser/turndown';

export class ClaudeChatAdapter implements IChatAdapter {
  readonly id = 'claude';
  readonly name = 'Claude AI';

  matches(url: string): boolean {
    return url.includes('claude.ai');
  }

  detectTurns(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll<HTMLElement>('.font-claude-message, [data-is-streaming], div[class*="font-claude"]')
    );
  }

  extractTurn(turnEl: HTMLElement): ExtractedTurn | null {
    try {
      // 1. 检查思考过程 (Claude 3.7 Sonnet Extended Thinking)
      let thinking = '';
      const thoughtEl = turnEl.querySelector('[data-testid="thought-box"], div[class*="thought"]');
      if (thoughtEl) {
        thinking = thoughtEl.textContent?.trim() || '';
      }

      // 2. 提取正文
      const clone = turnEl.cloneNode(true) as HTMLElement;
      const cloneThought = clone.querySelector('[data-testid="thought-box"], div[class*="thought"]');
      if (cloneThought) cloneThought.remove();

      const answer = htmlToMarkdown(clone.innerHTML).trim();

      // 3. 寻找前置的用户提问
      let prompt = '';
      const parentRow = turnEl.closest('[data-testid^="chat-turn"]') || turnEl.parentElement;
      const prevRow = parentRow?.previousElementSibling;
      if (prevRow) {
        prompt = prevRow.textContent?.trim() || '';
      }
      if (!prompt) {
        prompt = 'Claude 提问';
      }

      const currentUrl = (typeof window !== 'undefined' ? window.location.href : '') || 'https://claude.ai';
      let markdown = `# 🧠 Claude 对话轮次\n\n> 🌐 **来源地址**: [${currentUrl}](${currentUrl})\n> ⏰ **抓取时刻**: ${new Date().toLocaleString()}\n> 🏷️ **模型**: Claude 3.5 / 3.7\n\n---\n\n### ❓ Prompt\n\n${prompt}\n\n`;
      if (thinking) {
        markdown += `<details>\n<summary>🧠 Claude 扩展思考过程 (Extended Thinking)</summary>\n\n${thinking}\n\n</details>\n\n`;
      }
      markdown += `### 💡 Claude 回答\n\n${answer}\n\n`;

      return {
        prompt,
        answer,
        thinking,
        modelName: 'Claude 3.5 / 3.7',
        markdown,
      };
    } catch (e) {
      console.warn('解析 Claude 轮次失败', e);
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

    const pageTitle = document.title.replace('- Claude', '').trim() || 'Claude 对话归档';
    let fullMarkdown = `# ${pageTitle}\n\n> 来源: [Claude.ai](${window.location.href})\n> 归档时间: ${new Date().toLocaleString()}\n---\n\n`;

    turns.forEach((t, i) => {
      fullMarkdown += `## 轮次 ${i + 1}\n\n${t.markdown}\n---\n\n`;
    });

    return {
      title: pageTitle,
      modelName: 'Claude 3.5 / 3.7',
      turns,
      markdown: fullMarkdown,
    };
  }

  injectUI(onSaveTurn: (turn: ExtractedTurn) => void): void {
    const turns = this.detectTurns();
    turns.forEach(el => {
      if (el.dataset.dshInjected === 'true') return;
      el.dataset.dshInjected = 'true';

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

      el.appendChild(btn);
    });
  }
}
