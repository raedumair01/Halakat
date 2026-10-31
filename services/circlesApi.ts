import { API_BASE_URL } from './api';
import { getActiveSession } from './authSession';

export type Circle = {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  level: string;
  pagesPerDay: number;
  minutesPerDay: number;
  maxMembers: number;
  memberCount: number;
  isMember: boolean;
  isPremium: boolean;
  locationLabel: string;
  coordinates: [number, number] | null;
  distanceKm?: number;
  matchScore?: number;
  createdAt?: string;
};

export type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  mapsUrl: string | null;
  type: string;
  rating: number | null;
  ratingCount: number;
  source: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await getActiveSession();
  if (!session?.token) throw new Error('Please sign in to use Halakat circles.');

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Unable to reach the Halakat server. Please check your connection.');
  }

  const data = await response.json().catch(() => null) as (T & { message?: string }) | null;
  if (!response.ok) throw new Error(data?.message || `Request failed with status ${response.status}.`);
  return data as T;
}

export async function listCircles() {
  return (await request<{ circles: Circle[] }>('/circles')).circles;
}

export async function getTopCircles() {
  return (await request<{ circles: Circle[] }>('/circles/top')).circles;
}

export async function getMyCircles() {
  return (await request<{ circles: Circle[] }>('/circles/mine')).circles;
}

export async function getNearbyCircles(latitude: number, longitude: number, radiusKm = 500) {
  return (await request<{ circles: Circle[] }>(`/circles/nearby?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&radiusKm=${radiusKm}`)).circles;
}

export async function getNearbyPlaces(latitude: number, longitude: number, radiusKm = 15) {
  return (await request<{ places: NearbyPlace[] }>(`/places/nearby?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&radiusKm=${radiusKm}`)).places;
}

export async function getCircleMatches(params: { level?: string; pagesPerDay?: number; minutesPerDay?: number }) {
  const query = new URLSearchParams();
  if (params.level) query.set('level', params.level);
  if (params.pagesPerDay) query.set('pagesPerDay', String(params.pagesPerDay));
  if (params.minutesPerDay) query.set('minutesPerDay', String(params.minutesPerDay));
  return (await request<{ circles: Circle[] }>(`/circles/matches?${query.toString()}`)).circles;
}

export async function createCircle(payload: {
  name: string;
  description?: string;
  level: string;
  pagesPerDay: number;
  minutesPerDay: number;
  maxMembers?: number;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
}) {
  return (await request<{ circle: Circle }>('/circles', { method: 'POST', body: JSON.stringify(payload) })).circle;
}

export async function joinCircle(id: string) {
  return (await request<{ circle: Circle }>(`/circles/${id}/join`, { method: 'POST' })).circle;
}
