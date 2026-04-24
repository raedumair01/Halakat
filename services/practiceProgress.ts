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
  reciteSessions: number;
  memorizeSessions: number;
  updatedAt: string;
};

export type PracticeProgress = {
  daily: Record<string, DailyPracticeStats>;
  totals: {
    recitedVerses: number;
    memorizedVerses: number;
    reciteSessions: number;
    memorizeSessions: number;
  };
  updatedAt: string;
};

function createEmptyProgress(): PracticeProgress {
  return {
    daily: {},
    totals: {
      recitedVerses: 0,
      memorizedVerses: 0,
      reciteSessions: 0,
      memorizeSessions: 0,
    },
    updatedAt: new Date().toISOString(),
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

export async function getPracticeProgress(): Promise<PracticeProgress> {
  const storage = getStorageAdapter();
  const raw = await storage.getItem(PRACTICE_PROGRESS_KEY);

  if (!raw) return createEmptyProgress();

  try {
    const parsed = JSON.parse(raw) as PracticeProgress;
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
    reciteSessions: 0,
    memorizeSessions: 0,
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
    reciteSessions: 0,
    memorizeSessions: 0,
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
  return nextProgress;
}

export async function clearPracticeProgress(): Promise<void> {
  const storage = getStorageAdapter();
  await storage.removeItem(PRACTICE_PROGRESS_KEY);
}
