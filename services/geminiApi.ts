import { File } from 'expo-file-system';
import { API_BASE_URL } from './api';

const AI_API_BASE_URL = (process.env.EXPO_PUBLIC_AI_API_URL?.trim() || API_BASE_URL).replace(/\/+$/, '');

export type GeminiStatus = {
  configured: boolean;
  model: string;
  provider: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null) as (T & { message?: string }) | null;
  if (!response.ok) {
    throw new Error(data?.message || `AI request failed with status ${response.status}.`);
  }
  return data as T;
}

export async function getGeminiStatus(): Promise<GeminiStatus> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/status`);
  return parseResponse<GeminiStatus>(response);
}

export async function sendGeminiChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const response = await fetch(`${AI_API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  const data = await parseResponse<{ text: string }>(response);
  return data.text;
}

export async function transcribeRecitation(uri: string) {
  const file = new File(uri);
  const audioBase64 = await file.base64();
  const mimeType = uri.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mp4';
  const response = await fetch(`${AI_API_BASE_URL}/ai/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  const data = await parseResponse<{ text: string }>(response);
  return data.text;
}
