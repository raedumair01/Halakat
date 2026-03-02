const AUTH_SESSION_KEY = 'halakat_auth_session_v1';

type StoredSession = {
  isLoggedIn: boolean;
  email?: string;
  createdAt: string;
};

const inMemoryStore = new Map<string, string>();

type StorageAdapter = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
};

let cachedAdapter: StorageAdapter | null = null;

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

function getStorageAdapter(): StorageAdapter {
  if (cachedAdapter) return cachedAdapter;

  try {
    // Lazy-require to avoid crashing app startup when native module is not yet linked.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const asyncStorage = require('@react-native-async-storage/async-storage').default as StorageAdapter;
    cachedAdapter = asyncStorage;
  } catch (error) {
    console.warn('[authSession] AsyncStorage unavailable, using in-memory fallback:', error);
    cachedAdapter = memoryAdapter;
  }

  return cachedAdapter;
}

export async function setActiveSession(email?: string): Promise<void> {
  const payload: StoredSession = {
    isLoggedIn: true,
    email,
    createdAt: new Date().toISOString(),
  };

  const storage = getStorageAdapter();
  await storage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
}

export async function hasActiveSession(): Promise<boolean> {
  const storage = getStorageAdapter();
  const raw = await storage.getItem(AUTH_SESSION_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    return !!parsed?.isLoggedIn;
  } catch {
    return false;
  }
}

export async function clearActiveSession(): Promise<void> {
  const storage = getStorageAdapter();
  await storage.removeItem(AUTH_SESSION_KEY);
}
