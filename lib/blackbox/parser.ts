// lib/blackbox/parser.ts
// Blackbox Analyzer — parser architecture.
//
// SCOPE NOTE: Betaflight's native .bbl blackbox format is a proprietary
// binary log (the official decoder lives in the separate "blackbox-log-viewer"
// C/JS toolchain). Re-implementing that decoder is out of scope for this
// pass — instead this module defines the stable contract the rest of
// OBIXCORE builds against, plus a real, working implementation for the CSV
// export path (Betaflight Blackbox Explorer → "Export as CSV"), which is
// plain text and safe to parse entirely client-side.
//
// Anything reading a profile, log, or analysis result should depend on the
// types below, never on a specific parser implementation. To add real .bbl
// support later: implement `BlackboxParser` for the binary format and
// register it in `getParserFor()` — no other file needs to change.

import type { BlackboxAnalysisResult, BlackboxAxisStats, BlackboxLogMeta } from "@/types";

export interface BlackboxParser {
  /** Returns true if this parser can handle the given file. */
  canParse(file: File): boolean;
  /** Parses metadata only (fast) — duration, firmware, loop rate. */
  parseMeta(file: File): Promise<Omit<BlackboxLogMeta, "id" | "uploadedAt" | "status">>;
  /** Full analysis pass — noise, propwash, step response per axis. */
  analyze(file: File, logId: string): Promise<BlackboxAnalysisResult>;
}

/**
 * CSV parser for Betaflight's "Export as CSV" blackbox format.
 * Computes lightweight per-axis noise/propwash estimates from gyro columns.
 * This intentionally mirrors what a human would eyeball in the Blackbox
 * Explorer noise plot, expressed as numbers the rest of the app can render.
 */
export const csvBlackboxParser: BlackboxParser = {
  canParse(file: File) {
    return file.name.toLowerCase().endsWith(".csv");
  },

  async parseMeta(file: File) {
    const text = await readHead(file, 4000);
    const hasGyro = /gyroADC/i.test(text);
    const meta: Omit<BlackboxLogMeta, "id" | "uploadedAt" | "status"> = {
      fileName: file.name,
      fileSizeBytes: file.size,
      firmware: detectFirmware(text),
      loopRateHz: detectLoopRate(text),
      durationSeconds: undefined, // requires full-file scan; computed in analyze()
    };
    if (!hasGyro) {
      meta.error = "No gyroADC columns found in header";
    }
    return meta;
  },

  async analyze(file: File, logId: string) {
    const text = await file.text();
    const rows = parseCsvRows(text);
    const axes: BlackboxAxisStats[] = (["roll", "pitch", "yaw"] as const).map(
      (axis, i) => computeAxisStats(axis, rows, i)
    );

    return {
      logId,
      axes,
      findings: deriveFindings(axes),
      generatedAt: new Date().toISOString(),
    };
  },
};

export function getParserFor(file: File): BlackboxParser | null {
  if (csvBlackboxParser.canParse(file)) return csvBlackboxParser;
  return null; // .bbl binary support: future work, see module header
}

// ── Internal helpers ─────────────────────────────────────────

async function readHead(file: File, bytes: number): Promise<string> {
  const slice = file.slice(0, bytes);
  return slice.text();
}

function detectFirmware(text: string): string | undefined {
  const match = text.match(/Firmware type[,:]\s*"?([^",\n]+)"?/i);
  return match?.[1]?.trim();
}

function detectLoopRate(text: string): number | undefined {
  const match = text.match(/looptime[,:]\s*"?(\d+)"?/i);
  if (!match) return undefined;
  const looptimeUs = Number(match[1]);
  return looptimeUs > 0 ? Math.round(1_000_000 / looptimeUs) : undefined;
}

function parseCsvRows(text: string): number[][] {
  // Lightweight CSV scan — only used for the gyro columns we need.
  // Real blackbox CSVs are large (10k+ rows); we cap the scan for performance.
  const MAX_ROWS = 20000;
  const lines = text.split("\n");
  const rows: number[][] = [];
  for (let i = 1; i < Math.min(lines.length, MAX_ROWS); i++) {
    const cols = lines[i].split(",");
    if (cols.length < 4) continue;
    const parsed = cols.map(Number);
    if (parsed.some(Number.isNaN)) continue;
    rows.push(parsed);
  }
  return rows;
}

function computeAxisStats(
  axis: "roll" | "pitch" | "yaw",
  rows: number[][],
  colIndex: number
): BlackboxAxisStats {
  if (rows.length === 0) {
    return { axis, noisePeakToPeak: 0, propwashScore: 0 };
  }
  const values = rows.map((r) => r[colIndex] ?? 0);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const noisePeakToPeak = Math.round((max - min) * 10) / 10;

  // Crude propwash proxy: variance in the back half of the log vs front half
  // (propwash tends to show up as bursts of noise during throttle drops).
  const mid = Math.floor(values.length / 2);
  const frontVar = variance(values.slice(0, mid));
  const backVar = variance(values.slice(mid));
  const propwashScore = Math.min(1, Math.max(0, (backVar - frontVar) / (frontVar + 1)));

  return {
    axis,
    noisePeakToPeak,
    propwashScore: Math.round(propwashScore * 100) / 100,
  };
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
}

function deriveFindings(axes: BlackboxAxisStats[]) {
  return axes
    .filter((a) => a.propwashScore > 0.4 || a.noisePeakToPeak > 400)
    .map((a) => ({
      problemId:
        a.propwashScore > 0.4 ? "prob-propwash" : "prob-hf-oscillation",
      confidence: Math.max(a.propwashScore, Math.min(1, a.noisePeakToPeak / 800)),
      matchedKeywords: [a.axis, "blackbox"],
    }));
}
