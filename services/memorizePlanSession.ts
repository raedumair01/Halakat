type StorageAdapter = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
};

const PLAN_SESSION_KEY = 'halakat_memorize_plan_v1';

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

export type ExistingPlanId = 'focused' | 'balanced' | 'steady';

export type MemorizePlan =
  | {
      kind: 'existing';
      id: ExistingPlanId;
      startedAt: string;
    }
  | {
      kind: 'custom';
      level: string;
      pagesPerDay: string;
      minutesPerDay: string;
      order: string;
      startedAt: string;
    };

export type MemorizePlanInput =
  | {
      kind: 'existing';
      id: ExistingPlanId;
    }
  | {
      kind: 'custom';
      level: string;
      pagesPerDay: string;
      minutesPerDay: string;
      order: string;
    };

export async function setActiveMemorizePlan(plan: MemorizePlanInput): Promise<void> {
  const storage = getStorageAdapter();
  const payload: MemorizePlan = { ...plan, startedAt: new Date().toISOString() } as MemorizePlan;
  await storage.setItem(PLAN_SESSION_KEY, JSON.stringify(payload));
}

export async function getActiveMemorizePlan(): Promise<MemorizePlan | null> {
  const storage = getStorageAdapter();
  const raw = await storage.getItem(PLAN_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as MemorizePlan;
    if (!parsed?.kind || !parsed?.startedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearActiveMemorizePlan(): Promise<void> {
  const storage = getStorageAdapter();
  await storage.removeItem(PLAN_SESSION_KEY);
}

