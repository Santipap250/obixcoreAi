// lib/doctor/diagnose.ts
// FPV Doctor AI — diagnostic engine.
//
// Today this is a transparent rule-based matcher over the existing
// data/problems.json knowledge base, plus spec-aware warnings reused from
// lib/wizard.ts (calculateTuning). It is deliberately framed as an "AI
// Copilot" workflow — symptom in, ranked findings + next steps out — so the
// matching engine in `findMatches()` can be swapped for a real LLM/embedding
// call later without touching the UI or the DoctorSession/DoctorFinding
// contract in types/index.ts.
//
// No network calls happen here. Everything runs client-side and instantly.

import problemsData from "@/data/problems.json";
import { calculateTuning } from "@/lib/wizard";
import type {
  Problem,
  DoctorFinding,
  DoctorSession,
  DoctorSymptomInput,
  DroneProfile,
} from "@/types";

const problems = problemsData as Problem[];

// Thai + English stopwords stripped before matching so short connector
// words don't dilute the keyword overlap score.
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "and", "or", "to", "of", "my", "it", "in",
  "on", "at", "i", "ผม", "ฉัน", "ที่", "ของ", "และ", "หรือ", "เป็น", "มัน",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,./\\()[\]{}!?"'#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function buildSearchableText(p: Problem): string {
  return [p.symptom, p.description, ...p.causes, ...p.tags, p.category].join(" ");
}

/**
 * Ranks every known Problem against the user's free-text symptom description
 * using token overlap. Returns findings sorted by confidence, highest first.
 * This is intentionally simple and explainable — every match can be traced
 * back to the exact keywords that triggered it (see matchedKeywords).
 */
export function findMatches(
  input: DoctorSymptomInput,
  limit = 5
): DoctorFinding[] {
  const queryTokens = new Set(tokenize(input.description));
  if (queryTokens.size === 0) return [];

  const candidates = input.category && input.category !== "unknown"
    ? problems.filter((p) => p.category === input.category)
    : problems;

  const scored: DoctorFinding[] = candidates.map((p) => {
    const docTokens = new Set(tokenize(buildSearchableText(p)));
    const matched = Array.from(queryTokens).filter(
  (t) => docTokens.has(t)
);
    const confidence = matched.length / Math.max(queryTokens.size, 1);
    return {
      problemId: p.id,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords: matched,
    };
  });

  return scored
    .filter((f) => f.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

/**
 * If a DroneProfile is linked to the session, re-run calculateTuning() on
 * its spec to surface any spec-level warnings (e.g. high KV + high cell
 * count) alongside the symptom-matched findings. This is what makes the
 * Doctor "spec-aware" rather than a static FAQ search.
 */
export function getSpecWarnings(profile: DroneProfile | null): string[] {
  if (!profile) return [];
  try {
    const result = calculateTuning(profile.spec);
    return result.warnings;
  } catch {
    return [];
  }
}

export function runDiagnosis(
  input: DoctorSymptomInput,
  linkedProfile: DroneProfile | null
): DoctorSession {
  return {
    id: `dx-${Date.now()}`,
    input,
    findings: findMatches(input),
    specWarnings: getSpecWarnings(linkedProfile),
    createdAt: new Date().toISOString(),
  };
}

export function getProblemById(id: string): Problem | undefined {
  return problems.find((p) => p.id === id);
}
