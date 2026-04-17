export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_CHAT_API_KEY =
  process.env.EXPO_PUBLIC_GROQ_CHAT_API_KEY ??
  process.env.EXPO_PUBLIC_GROQ_API_KEY ??
  '';
export const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? 'llama-3.3-70b-versatile';

export const CHAT_SYSTEM_PROMPT =
  'You are a helpful assistant for the Halakat app. ' +
  'Answer user questions clearly and concisely. ' +
  'When answering religious questions, prefer well-known, mainstream opinions and avoid giving personal fatwas. ' +
  'If you are not sure about an Islamic ruling, say you are not certain and advise the user to consult a qualified scholar.';

