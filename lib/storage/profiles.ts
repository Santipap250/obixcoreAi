// lib/storage/profiles.ts
// Client-side persistence for "My Drone Profiles".
//
// Why localStorage: OBIXCORE has no backend (it ships as a static Next.js
// site — see next.config.mjs / README deploy instructions for Cloudflare
// Pages & GitHub Pages). localStorage gives profiles real persistence across
// reloads with zero new infrastructure or dependencies. Every function here
// is guarded for SSR (Next.js renders this on the server first, where
// `window` does not exist) and for storage failures (Safari private mode,
// quota exceeded, etc.) so a profile-related crash can never take down a page.
//
// Swapping this for a real API later only requires changing this file —
// every component imports from here, never from `localStorage` directly.

import type { DroneProfile, DroneProfileDraft } from "@/types";

const STORAGE_KEY = "obixcore.profiles.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRaw(): DroneProfile[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DroneProfile[];
  } catch {
    // Corrupted JSON or storage unavailable — fail safe to empty list
    // rather than throwing and breaking the page.
    return [];
  }
}

function writeRaw(profiles: DroneProfile[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return true;
  } catch {
    return false;
  }
}

function generateId(): string {
  if (isBrowser() && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function listProfiles(): DroneProfile[] {
  return readRaw().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getProfile(id: string): DroneProfile | null {
  return readRaw().find((p) => p.id === id) ?? null;
}

export function getActiveProfile(): DroneProfile | null {
  return readRaw().find((p) => p.isActive) ?? null;
}

export function createProfile(draft: DroneProfileDraft): DroneProfile {
  const now = new Date().toISOString();
  const profile: DroneProfile = {
    ...draft,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  const all = readRaw();
  writeRaw([...all, profile]);
  return profile;
}

export function updateProfile(
  id: string,
  patch: Partial<DroneProfileDraft>
): DroneProfile | null {
  const all = readRaw();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: DroneProfile = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  writeRaw(all);
  return updated;
}

export function deleteProfile(id: string): boolean {
  const all = readRaw();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  return writeRaw(next);
}

export function setActiveProfile(id: string): void {
  const all = readRaw().map((p) => ({ ...p, isActive: p.id === id }));
  writeRaw(all);
}
