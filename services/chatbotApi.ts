import { CHAT_SYSTEM_PROMPT, GROQ_CHAT_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../constants/chatbot';

export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export async function sendChatRequest(
  messages: ChatMessage[]
): Promise<string> {
  if (!GROQ_CHAT_API_KEY) {
    throw new Error('Chat AI is not configured yet. Add EXPO_PUBLIC_GROQ_CHAT_API_KEY to your .env file.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_CHAT_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('Chat API error:', response.status, errorText);
    throw new Error('Failed to get a response from the assistant.');
  }

  const data = await response.json();
  const content =
    data.choices?.[0]?.message?.content ??
    'Sorry, I could not generate a response.';

  return content;
}

