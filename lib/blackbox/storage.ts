// lib/blackbox/storage.ts
// Persists Blackbox log *metadata* (not the raw file — files stay in-memory
// for the session only, to avoid bloating localStorage with multi-MB logs).
// Mirrors the pattern used in lib/storage/profiles.ts for consistency.

import type { BlackboxLogMeta } from "@/types";

const STORAGE_KEY = "obixcore.blackbox-logs.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRaw(): BlackboxLogMeta[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BlackboxLogMeta[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(logs: BlackboxLogMeta[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return true;
  } catch {
    return false;
  }
}

export function listLogMeta(): BlackboxLogMeta[] {
  return readRaw().sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function saveLogMeta(meta: BlackboxLogMeta): void {
  const all = readRaw();
  const index = all.findIndex((m) => m.id === meta.id);
  if (index === -1) {
    writeRaw([...all, meta]);
  } else {
    all[index] = meta;
    writeRaw(all);
  }
}

export function deleteLogMeta(id: string): void {
  writeRaw(readRaw().filter((m) => m.id !== id));
}
