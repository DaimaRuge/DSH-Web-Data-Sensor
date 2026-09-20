import { MediaAttachment } from '@/types';

export interface ExtractedTurn {
  prompt: string;
  answer: string;
  thinking?: string;
  modelName?: string;
  turnIndex?: number;
  markdown: string;
  mediaAttachments?: MediaAttachment[];
}

export interface ExtractedSession {
  title: string;
  modelName?: string;
  turns: ExtractedTurn[];
  markdown: string;
  mediaAttachments?: MediaAttachment[];
}

export interface IChatAdapter {
  readonly id: string;
  readonly name: string;
  matches(url: string): boolean;
  detectTurns(): HTMLElement[];
  extractTurn(turnEl: HTMLElement): ExtractedTurn | null;
  extractSession(): ExtractedSession | null;
  injectUI(onSaveTurn: (turn: ExtractedTurn) => void): void;
}
