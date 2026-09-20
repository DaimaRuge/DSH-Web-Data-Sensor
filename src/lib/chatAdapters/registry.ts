import { IChatAdapter } from './types';
import { DeepSeekChatAdapter } from './deepseek';
import { ChatGPTAdapter } from './chatgpt';
import { ClaudeChatAdapter } from './claude';
import { GeminiChatAdapter, DoubaoChatAdapter, GrokChatAdapter } from './geminiDoubaoGrok';

export class ChatAdapterRegistry {
  private adapters: IChatAdapter[] = [
    new DeepSeekChatAdapter(),
    new ChatGPTAdapter(),
    new ClaudeChatAdapter(),
    new GeminiChatAdapter(),
    new DoubaoChatAdapter(),
    new GrokChatAdapter(),
  ];

  findAdapter(url: string): IChatAdapter | null {
    return this.adapters.find(a => a.matches(url)) || null;
  }
}

export const adapterRegistry = new ChatAdapterRegistry();
