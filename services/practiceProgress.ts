import { API_BASE_URL } from './api';
import { getActiveSession } from './authSession';

type StorageAdapter = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
};

const PRACTICE_PROGRESS_KEY = 'halakat_practice_progress_v1';

const inMemoryStore = new Map<string, string>();

const memoryAdapter: StorageAdapter = {
  async setItem(key, value) {
    inMemoryStore.set(key, value);
  },
  async getItem(key) {
    return inMemoryStore.get(key) ?? null;
  },
  async removeItem(key) {
    inMemoryStore.delete(key);
  },
};

let cachedAdapter: StorageAdapter | null = null;

function getStorageAdapter(): StorageAdapter {
  if (cachedAdapter) return cachedAdapter;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const asyncStorage = require('@react-native-async-storage/async-storage').default as StorageAdapter;
    cachedAdapter = asyncStorage;
  } catch {
    cachedAdapter = memoryAdapter;
  }

  return cachedAdapter;
}

export type DailyPracticeStats = {
  date: string;
  recitedVerses: number;
  memorizedVerses: number;
  retainedVerses: number;
  reciteSessions: number;
  memorizeSessions: number;
  retainSessions: number;
  updatedAt: string;
};

export type PracticeProgress = {
  daily: Record<string, DailyPracticeStats>;
  totals: {
    recitedVerses: number;
    memorizedVerses: number;
    retainedVerses: number;
    reciteSessions: number;
    memorizeSessions: number;
    retainSessions: number;
  };
  updatedAt: string;
};

function createEmptyProgress(): PracticeProgress {
  return {
    daily: {},
    totals: {
      recitedVerses: 0,
      memorizedVerses: 0,
      retainedVerses: 0,
      reciteSessions: 0,
      memorizeSessions: 0,
      retainSessions: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDayStats(day: DailyPracticeStats): DailyPracticeStats {
  return {
    date: day.date,
    recitedVerses: day.recitedVerses ?? 0,
    memorizedVerses: day.memorizedVerses ?? 0,
    retainedVerses: day.retainedVerses ?? 0,
    reciteSessions: day.reciteSessions ?? 0,
    memorizeSessions: day.memorizeSessions ?? 0,
    retainSessions: day.retainSessions ?? 0,
    updatedAt: day.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeProgress(progress: PracticeProgress): PracticeProgress {
  const empty = createEmptyProgress();
  const daily = Object.fromEntries(
    Object.entries(progress.daily ?? {}).map(([date, day]) => [date, normalizeDayStats({ ...day, date })])
  );

  return {
    daily,
    totals: {
      recitedVerses: progress.totals?.recitedVerses ?? 0,
      memorizedVerses: progress.totals?.memorizedVerses ?? 0,
      retainedVerses: progress.totals?.retainedVerses ?? 0,
      reciteSessions: progress.totals?.reciteSessions ?? 0,
      memorizeSessions: progress.totals?.memorizeSessions ?? 0,
      retainSessions: progress.totals?.retainSessions ?? 0,
    },
    updatedAt: progress.updatedAt ?? empty.updatedAt,
  };
}

function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayIso() {
  return formatLocalIsoDate(new Date());
}

async function savePracticeProgress(progress: PracticeProgress) {
  const storage = getStorageAdapter();
  await storage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(progress));
}

async function fetchServerProgress(): Promise<PracticeProgress | null> {
  const session = await getActiveSession();
  if (!session?.token) return null;

  const response = await fetch(`${API_BASE_URL}/progress`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { progress?: PracticeProgress };
  return data.progress ? normalizeProgress(data.progress) : null;
}

async function recordServerActivity(
  type: 'recite' | 'memorize' | 'retain',
  versesCompleted: number,
  date: string
): Promise<PracticeProgress | null> {
  const session = await getActiveSession();
  if (!session?.token) return null;

  const response = await fetch(`${API_BASE_URL}/progress/activity`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, versesCompleted, date }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { progress?: PracticeProgress };
  return data.progress ? normalizeProgress(data.progress) : null;
}

export async function getPracticeProgress(): Promise<PracticeProgress> {
  try {
    const serverProgress = await fetchServerProgress();
    if (serverProgress) {
      await savePracticeProgress(serverProgress);
      return serverProgress;
    }
  } catch (error) {
    console.warn('[practiceProgress] Failed to fetch server progress:', error);
  }

  const storage = getStorageAdapter();
  const raw = await storage.getItem(PRACTICE_PROGRESS_KEY);

  if (!raw) return createEmptyProgress();

  try {
    const parsed = normalizeProgress(JSON.parse(raw) as PracticeProgress);
    if (!parsed?.daily || !parsed?.totals) {
      return createEmptyProgress();
    }

    return parsed;
  } catch {
    return createEmptyProgress();
  }
}

export async function recordRecitationProgress(versesCompleted = 1): Promise<PracticeProgress> {
  const progress = await getPracticeProgress();
  const today = getTodayIso();
  const now = new Date().toISOString();
  const currentDay = progress.daily[today] ?? {
    date: today,
    recitedVerses: 0,
    memorizedVerses: 0,
    retainedVerses: 0,
    reciteSessions: 0,
    memorizeSessions: 0,
    retainSessions: 0,
    updatedAt: now,
  };

  const nextProgress: PracticeProgress = {
    daily: {
      ...progress.daily,
      [today]: {
        ...currentDay,
        recitedVerses: currentDay.recitedVerses + versesCompleted,
        reciteSessions: currentDay.reciteSessions + 1,
        updatedAt: now,
      },
    },
    totals: {
      ...progress.totals,
      recitedVerses: progress.totals.recitedVerses + versesCompleted,
      reciteSessions: progress.totals.reciteSessions + 1,
    },
    updatedAt: now,
  };

  await savePracticeProgress(nextProgress);

  try {
    const serverProgress = await recordServerActivity('recite', versesCompleted, today);
    if (serverProgress) {
      await savePracticeProgress(serverProgress);
      return serverProgress;
    }
  } catch (error) {
    console.warn('[practiceProgress] Failed to sync recitation progress:', error);
  }

  return nextProgress;
}

export async function recordMemorizationProgress(versesCompleted = 1): Promise<PracticeProgress> {
  const progress = await getPracticeProgress();
  const today = getTodayIso();
  const now = new Date().toISOString();
  const currentDay = progress.daily[today] ?? {
    date: today,
    recitedVerses: 0,
    memorizedVerses: 0,
    retainedVerses: 0,
    reciteSessions: 0,
    memorizeSessions: 0,
    retainSessions: 0,
    updatedAt: now,
  };

  const nextProgress: PracticeProgress = {
    daily: {
      ...progress.daily,
      [today]: {
        ...currentDay,
        memorizedVerses: currentDay.memorizedVerses + versesCompleted,
        memorizeSessions: currentDay.memorizeSessions + 1,
        updatedAt: now,
      },
    },
    totals: {
      ...progress.totals,
      memorizedVerses: progress.totals.memorizedVerses + versesCompleted,
      memorizeSessions: progress.totals.memorizeSessions + 1,
    },
    updatedAt: now,
  };

  await savePracticeProgress(nextProgress);

  try {
    const serverProgress = await recordServerActivity('memorize', versesCompleted, today);
    if (serverProgress) {
      await savePracticeProgress(serverProgress);
      return serverProgress;
    }
  } catch (error) {
    console.warn('[practiceProgress] Failed to sync memorization progress:', error);
  }

  return nextProgress;
}

export async function recordRetentionProgress(versesCompleted = 1): Promise<PracticeProgress> {
  const progress = await getPracticeProgress();
  const today = getTodayIso();
  const now = new Date().toISOString();
  const currentDay = progress.daily[today] ?? {
    date: today,
    recitedVerses: 0,
    memorizedVerses: 0,
    retainedVerses: 0,
    reciteSessions: 0,
    memorizeSessions: 0,
    retainSessions: 0,
    updatedAt: now,
  };

  const nextProgress: PracticeProgress = {
    daily: {
      ...progress.daily,
      [today]: {
        ...currentDay,
        retainedVerses: currentDay.retainedVerses + versesCompleted,
        retainSessions: currentDay.retainSessions + 1,
        updatedAt: now,
      },
    },
    totals: {
      ...progress.totals,
      retainedVerses: progress.totals.retainedVerses + versesCompleted,
      retainSessions: progress.totals.retainSessions + 1,
    },
    updatedAt: now,
  };

  await savePracticeProgress(nextProgress);

  try {
    const serverProgress = await recordServerActivity('retain', versesCompleted, today);
    if (serverProgress) {
      await savePracticeProgress(serverProgress);
      return serverProgress;
    }
  } catch (error) {
    console.warn('[practiceProgress] Failed to sync retention progress:', error);
  }

  return nextProgress;
}

export async function clearPracticeProgress(): Promise<void> {
  const storage = getStorageAdapter();
  await storage.removeItem(PRACTICE_PROGRESS_KEY);
}
