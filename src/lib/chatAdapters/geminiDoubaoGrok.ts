import { IChatAdapter, ExtractedTurn, ExtractedSession } from './types';
import { htmlToMarkdown } from '../parser/turndown';

export class GeminiChatAdapter implements IChatAdapter {
  readonly id = 'gemini';
  readonly name = 'Google Gemini';

  matches(url: string): boolean {
    return url.includes('gemini.google.com');
  }

  detectTurns(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('model-response, message-content, div[class*="model-response"]'));
  }

  extractTurn(turnEl: HTMLElement): ExtractedTurn | null {
    try {
      const answer = htmlToMarkdown(turnEl.innerHTML).trim();
      let prompt = 'Gemini 提问';
      const prevUser = turnEl.closest('.conversation-container')?.querySelector('.user-query');
      if (prevUser) {
        prompt = prevUser.textContent?.trim() || prompt;
      }

      return {
        prompt,
        answer,
        modelName: 'Google Gemini',
        markdown: `### ❓ Prompt\n\n${prompt}\n\n### 💡 Gemini 回答\n\n${answer}\n\n`,
      };
    } catch {
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

    const pageTitle = document.title.replace('- Gemini', '').trim() || 'Gemini 对话记录';
    let fullMarkdown = `# ${pageTitle}\n\n> 来源: [Gemini](${window.location.href})\n> 归档时间: ${new Date().toLocaleString()}\n---\n\n`;

    turns.forEach((t, i) => {
      fullMarkdown += `## 轮次 ${i + 1}\n\n${t.markdown}\n---\n\n`;
    });

    return {
      title: pageTitle,
      modelName: 'Google Gemini',
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
      btn.innerHTML = `存入 DSH`;
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const turnData = this.extractTurn(el);
        if (turnData) {
          btn.innerText = '已存入 ✓';
          setTimeout(() => { btn.innerText = '存入 DSH'; }, 2000);
          onSaveTurn(turnData);
        }
      };
      el.appendChild(btn);
    });
  }
}

export class DoubaoChatAdapter implements IChatAdapter {
  readonly id = 'doubao';
  readonly name = '豆包 (Doubao)';

  matches(url: string): boolean {
    return url.includes('doubao.com');
  }

  detectTurns(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('div[class*="assistant-bubble"], div[data-testid="assistant_message"]'));
  }

  extractTurn(turnEl: HTMLElement): ExtractedTurn | null {
    const answer = htmlToMarkdown(turnEl.innerHTML).trim();
    return {
      prompt: '豆包对话提问',
      answer,
      modelName: 'Doubao',
      markdown: `### 💡 豆包回答\n\n${answer}\n\n`,
    };
  }

  extractSession(): ExtractedSession | null {
    const turnsEls = this.detectTurns();
    if (turnsEls.length === 0) return null;
    const turns = turnsEls.map((el, i) => {
      const turn = this.extractTurn(el)!;
      turn.turnIndex = i + 1;
      return turn;
    });

    return {
      title: document.title || '豆包对话记录',
      modelName: 'Doubao',
      turns,
      markdown: `# 豆包对话归档\n\n` + turns.map(t => t.markdown).join('\n---\n'),
    };
  }

  injectUI(onSaveTurn: (turn: ExtractedTurn) => void): void {
    const turns = this.detectTurns();
    turns.forEach(el => {
      if (el.dataset.dshInjected === 'true') return;
      el.dataset.dshInjected = 'true';
      const btn = document.createElement('button');
      btn.className = 'dsh-chat-inject-btn';
      btn.innerText = '存入 DSH';
      btn.onclick = () => {
        const turn = this.extractTurn(el);
        if (turn) onSaveTurn(turn);
      };
      el.appendChild(btn);
    });
  }
}

export class GrokChatAdapter implements IChatAdapter {
  readonly id = 'grok';
  readonly name = 'xAI Grok';

  matches(url: string): boolean {
    return url.includes('grok.com') || url.includes('x.com/i/grok');
  }

  detectTurns(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('div[class*="response-message"], div[data-testid="grok-response"]'));
  }

  extractTurn(turnEl: HTMLElement): ExtractedTurn | null {
    const answer = htmlToMarkdown(turnEl.innerHTML).trim();
    return {
      prompt: 'Grok 提问',
      answer,
      modelName: 'xAI Grok',
      markdown: `### 💡 Grok 回答\n\n${answer}\n\n`,
    };
  }

  extractSession(): ExtractedSession | null {
    const turnsEls = this.detectTurns();
    if (turnsEls.length === 0) return null;
    const turns = turnsEls.map((el, i) => {
      const turn = this.extractTurn(el)!;
      turn.turnIndex = i + 1;
      return turn;
    });

    return {
      title: document.title || 'Grok 对话记录',
      modelName: 'xAI Grok',
      turns,
      markdown: `# Grok 对话记录\n\n` + turns.map(t => t.markdown).join('\n---\n'),
    };
  }

  injectUI(onSaveTurn: (turn: ExtractedTurn) => void): void {
    const turns = this.detectTurns();
    turns.forEach(el => {
      if (el.dataset.dshInjected === 'true') return;
      el.dataset.dshInjected = 'true';
      const btn = document.createElement('button');
      btn.className = 'dsh-chat-inject-btn';
      btn.innerText = '存入 DSH';
      btn.onclick = () => {
        const turn = this.extractTurn(el);
        if (turn) onSaveTurn(turn);
      };
      el.appendChild(btn);
    });
  }
}
