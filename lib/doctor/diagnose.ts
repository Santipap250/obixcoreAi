// lib/doctor/diagnose.ts — FPV Doctor AI diagnostic engine
//
// Matching engine: hybrid keyword overlap + category boost + severity weight.
// Designed so the DoctorFinding contract is stable if we later swap in an
// LLM backend — the UI and types don't need to change.
//
// No network calls. Everything runs client-side, instantly.

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

// Thai + English stopwords stripped before token matching
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "and", "or", "to", "of", "my", "it", "in",
  "on", "at", "i", "be", "with", "for", "do", "have", "this", "that",
  "ผม", "ฉัน", "ที่", "ของ", "และ", "หรือ", "เป็น", "มัน", "ใน", "มี",
  "ไม่", "แล้ว", "ได้", "จาก", "กับ", "ก็", "จะ",
]);

// Severity → confidence boost. High-severity problems surface above noise
// when confidence is close — matches how an expert would triage.
const SEVERITY_BOOST: Record<Problem["severity"], number> = {
  high:   0.08,
  medium: 0.04,
  low:    0.00,
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,./\\()\[\]{}!?"'#\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function buildSearchableText(p: Problem): string {
  return [p.symptom, p.description, ...p.causes, ...p.tags, p.category].join(" ");
}

/**
 * Ranks all Problems against the user's symptom description.
 * Scoring: token overlap (Jaccard-like) + severity boost + category match bonus.
 * All matches are traceable to exact keywords for explainability.
 */
export function findMatches(
  input: DoctorSymptomInput,
  limit = 6
): DoctorFinding[] {
  const queryTokens = new Set(tokenize(input.description));
  if (queryTokens.size === 0) return [];

  const hasCategory = input.category && input.category !== "unknown";
  const candidates = hasCategory
    ? problems.filter((p) => p.category === input.category)
    : problems;

  const scored: DoctorFinding[] = candidates.map((p) => {
    const docTokens = new Set(tokenize(buildSearchableText(p)));
    const matched = Array.from(queryTokens).filter((t) => docTokens.has(t));

    // Jaccard similarity: intersection / union
    const union = new Set([...queryTokens, ...docTokens]);
    const rawScore = matched.length / Math.max(union.size, 1);

    // Boost by severity so high-impact issues rank above marginal matches
    const severityAdjusted = rawScore + SEVERITY_BOOST[p.severity];

    // If query mentions category-like words that match this problem's category
    const categoryBoost = queryTokens.has(p.category) ? 0.05 : 0;

    const confidence = Math.min(
      Math.round((severityAdjusted + categoryBoost) * 100) / 100,
      1
    );

    return {
      problemId: p.id,
      confidence,
      matchedKeywords: matched,
    };
  });

  return scored
    .filter((f) => f.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

/**
 * Re-runs calculateTuning() on the linked profile's spec to surface
 * spec-level warnings (e.g. high-KV + high-S combo risks) alongside
 * the symptom-matched findings. This is the "spec-aware" layer.
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
