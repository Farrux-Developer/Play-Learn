/**
 * IndexedDB durable progress store (`idb`, ~1.2 KB gz) with:
 * - Automatic one-time migration from legacy localStorage 'oyna_organ_workshop_v1'
 * - Safe fallback when IndexedDB is unavailable (private mode or SSR)
 * - Persistent storage nudge helper via navigator.storage.persist()
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { migrateProgress } from './migrations';
import { createDefaultProgressV2, type ProgressV2 } from './schema';

const DB_NAME = 'oyna_organ_db';
const DB_VERSION = 1;
const STORE_NAME = 'progress';
const CURRENT_KEY = 'current';
const LEGACY_LOCAL_KEY = 'oyna_organ_workshop_v1';

interface OynaDb extends DBSchema {
  progress: {
    key: string;
    value: ProgressV2;
  };
}

let dbPromise: Promise<IDBPDatabase<OynaDb>> | null = null;
let memoryFallback: ProgressV2 | null = null;

function getDb(): Promise<IDBPDatabase<OynaDb>> | null {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<OynaDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadProgressV2(nowMs = Date.now()): Promise<ProgressV2> {
  const db = getDb();
  if (db) {
    try {
      const existing = await (await db).get(STORE_NAME, CURRENT_KEY);
      if (existing) {
        return migrateProgress(existing, nowMs);
      }
    } catch {
      // Fall through to legacy localStorage or default
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const legacyRaw = window.localStorage.getItem(LEGACY_LOCAL_KEY);
      if (legacyRaw) {
        const migrated = migrateProgress(JSON.parse(legacyRaw), nowMs);
        await saveProgressV2(migrated);
        return migrated;
      }
    } catch {
      // Ignore private browsing / malformed JSON
    }
  }

  return memoryFallback ?? createDefaultProgressV2(nowMs);
}

export async function saveProgressV2(progress: ProgressV2): Promise<void> {
  memoryFallback = progress;
  const db = getDb();
  if (db) {
    try {
      await (await db).put(STORE_NAME, progress, CURRENT_KEY);
    } catch {
      // Ignore quota / private mode errors
    }
  }
}

export async function clearProgressV2(nowMs = Date.now()): Promise<ProgressV2> {
  const fresh = createDefaultProgressV2(nowMs);
  await saveProgressV2(fresh);
  return fresh;
}

export async function requestPersistentStorage(): Promise<{
  supported: boolean;
  persisted: boolean;
}> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.storage ||
    typeof navigator.storage.persist !== 'function'
  ) {
    return { supported: false, persisted: false };
  }
  try {
    const already =
      typeof navigator.storage.persisted === 'function'
        ? await navigator.storage.persisted()
        : false;
    if (already) return { supported: true, persisted: true };
    const granted = await navigator.storage.persist();
    return { supported: true, persisted: granted };
  } catch {
    return { supported: true, persisted: false };
  }
}
