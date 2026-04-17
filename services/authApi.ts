import { API_BASE_URL } from './api';

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  bio: string;
  location: string;
  streakGoal: number;
  circlesJoined: number;
  memorizedVerses: number;
  memberSince: string;
};

export type AuthResponse = {
  token: string;
  user: UserProfile;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: Record<string, unknown>;
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.');
  }

  return data as T;
}

export function signup(payload: { fullName: string; email: string; password: string }) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function getProfile(token: string) {
  const response = await request<{ user: UserProfile }>('/auth/profile', {
    token,
  });

  return response.user;
}

export async function updateProfile(
  token: string,
  payload: Partial<Pick<UserProfile, 'fullName' | 'bio' | 'location' | 'streakGoal'>>
) {
  const response = await request<{ user: UserProfile }>('/auth/profile', {
    method: 'PATCH',
    token,
    body: payload,
  });

  return response.user;
}
