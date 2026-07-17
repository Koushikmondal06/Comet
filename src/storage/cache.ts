import { readJsonFile, writeJsonFile, getConfigDir } from "../utils/files";
import * as path from "path";

const CACHE_FILE = "cache.json";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  key: string;
  value: unknown;
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

function getCachePath(): string {
  return path.join(getConfigDir(), CACHE_FILE);
}

function loadCache(): CacheStore {
  return readJsonFile<CacheStore>(getCachePath()) || {};
}

function saveCache(cache: CacheStore): void {
  writeJsonFile(getCachePath(), cache);
}

export function cacheGet<T>(key: string): T | null {
  const cache = loadCache();
  const entry = cache[key];

  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key];
    saveCache(cache);
    return null;
  }

  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T): void {
  const cache = loadCache();
  cache[key] = {
    key,
    value,
    timestamp: Date.now(),
  };
  saveCache(cache);
}

export function cacheDelete(key: string): void {
  const cache = loadCache();
  delete cache[key];
  saveCache(cache);
}

export function cacheClear(): void {
  writeJsonFile(getCachePath(), {});
}

export function cacheHas(key: string): boolean {
  return cacheGet(key) !== null;
}
