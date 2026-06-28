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
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    const isNetworkError =
      (error instanceof Error && error.name === 'AbortError') ||
      error instanceof TypeError ||
      (error instanceof Error && /network request failed/i.test(error.message));

    if (isNetworkError) {
      throw new Error('Unable to reach the Halakat server. Please check your internet connection and make sure the app is connected to the deployed backend.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | { message?: string }
    | null;

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Endpoint not found. Please redeploy the backend with the latest auth changes.');
    }

    throw new Error(data?.message || `Request failed with status ${response.status}.`);
  }

  return data as T;
}

export function requestSignupOtp(payload: { fullName: string; email: string; password: string }) {
  return request<{ message: string; otp?: string }>('/auth/signup/request-otp', {
    method: 'POST',
    body: payload,
  });
}

export function signup(payload: { email: string; otp: string }) {
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

export function requestPasswordReset(payload: { email: string }) {
  return request<{ message: string; resetToken?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

export function resetPassword(payload: { email: string; resetToken: string; password: string }) {
  return request<{ message: string }>('/auth/reset-password', {
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
