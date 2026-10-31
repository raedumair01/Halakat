import { sendGeminiChat } from './geminiApi';

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export async function sendChatRequest(
  messages: ChatMessage[]
): Promise<string> {
  return sendGeminiChat(
    messages
      .filter(message => message.role === 'user' || message.role === 'assistant')
      .map(message => ({
        role: message.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: message.content,
      }))
  );
}

