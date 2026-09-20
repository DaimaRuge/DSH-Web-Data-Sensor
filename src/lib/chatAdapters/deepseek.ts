import { IChatAdapter, ExtractedTurn, ExtractedSession } from './types';
import { htmlToMarkdown } from '../parser/turndown';

export class DeepSeekChatAdapter implements IChatAdapter {
  readonly id = 'deepseek';
  readonly name = 'DeepSeek Chat';

  matches(url: string): boolean {
    return url.includes('chat.deepseek.com');
  }

  detectTurns(): HTMLElement[] {
    // 探测 DeepSeek 对话流中的 Assistant 回复容器
    const assistantContainers = Array.from(
      document.querySelectorAll<HTMLElement>('.ds-markdown, div[class*="ds-markdown"], div[class*="chat-message"]')
    );
    return assistantContainers.filter(el => {
      // 排除用户自己的提问框（通常包含特定的用户样式或类名）
      return !el.closest('.user-message') && el.textContent && el.textContent.trim().length > 0;
    });
  }

  extractTurn(turnEl: HTMLElement): ExtractedTurn | null {
    try {
      // 1. 提取思考过程 (Thinking)
      let thinking = '';
      const thinkEl = turnEl.querySelector('.ds-think, div[class*="think"], .ds-collapse');
      if (thinkEl) {
        thinking = htmlToMarkdown(thinkEl.innerHTML).trim();
      }

      // 2. 提取正文回复
      // 克隆节点移除 thinking 块以防内容混杂
      const clone = turnEl.cloneNode(true) as HTMLElement;
      const cloneThink = clone.querySelector('.ds-think, div[class*="think"], .ds-collapse');
      if (cloneThink) cloneThink.remove();
      
      const answer = htmlToMarkdown(clone.innerHTML).trim();

      // 3. 寻找前置的用户提问 Prompt
      let prompt = '';
      let prev = turnEl.parentElement?.previousElementSibling;
      while (prev) {
        const text = prev.textContent?.trim();
        if (text && text.length > 0) {
          prompt = text;
          break;
        }
        prev = prev.previousElementSibling;
      }
      if (!prompt) {
        prompt = '用户在 DeepSeek 上的提问';
      }

      // 4. 格式化组装 Markdown
      let markdown = `### ❓ Prompt\n\n${prompt}\n\n`;
      if (thinking) {
        markdown += `<details>\n<summary>🧠 思考过程 (DeepSeek Thinking)</summary>\n\n${thinking}\n\n</details>\n\n`;
      }
      markdown += `### 💡 DeepSeek 回答\n\n${answer}\n\n`;

      return {
        prompt,
        answer,
        thinking,
        modelName: 'DeepSeek-V3 / R1',
        markdown,
      };
    } catch (e) {
      console.warn('解析 DeepSeek 对话轮次失败', e);
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

    const pageTitle = document.title.replace('- DeepSeek', '').trim() || 'DeepSeek 对话会话';
    let fullMarkdown = `# ${pageTitle}\n\n> 来源: [DeepSeek Chat](${window.location.href})\n> 归档时间: ${new Date().toLocaleString()}\n---\n\n`;
    
    turns.forEach((t, i) => {
      fullMarkdown += `## 轮次 ${i + 1}\n\n${t.markdown}\n---\n\n`;
    });

    return {
      title: pageTitle,
      modelName: 'DeepSeek-V3 / R1',
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
      btn.title = '将此轮对话（提示词 + 思考过程 + 回答）保存至 DSH 知识库';
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

      // 放置在消息框的顶部或动作栏
      el.style.position = 'relative';
      el.prepend(btn);
    });
  }
}
