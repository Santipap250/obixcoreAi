// types/index.ts — OBIXCORE Data Models

export interface Preset {
  id: string;
  name: string;
  description: string;
  type: "race" | "freestyle" | "cinematic" | "beginner";
  frameSize: "2inch" | "3inch" | "5inch" | "7inch";
  batteryS: 2 | 3 | 4 | 5 | 6;
  bfVersion: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  pid: {
    roll: { p: number; i: number; d: number; f: number };
    pitch: { p: number; i: number; d: number; f: number };
    yaw: { p: number; i: number; d: number };
  };
  rates: {
    type: "actual" | "betaflight" | "kiss";
    roll: { rc_rate: number; rate: number; expo: number };
    pitch: { rc_rate: number; rate: number; expo: number };
    yaw: { rc_rate: number; rate: number; expo: number };
  };
  filters: {
    gyroLpf1Hz: number;
    gyroLpf2Hz: number;
    dTermLpf1Hz: number;
    rpmFilter: boolean;
    dynamicNotch: "OFF" | "LOW" | "MEDIUM" | "HIGH";
  };
  cliCommands: string[];
  notes: string;
}

export interface Problem {
  id: string;
  symptom: string;
  category: "flight" | "video" | "power" | "mechanical";
  severity: "low" | "medium" | "high";
  description: string;
  causes: string[];
  steps: ProblemStep[];
  relatedPresetIds: string[];
  tags: string[];
}

export interface ProblemStep {
  order: number;
  title: string;
  description: string;
  action?: string;
  warning?: string;
}

export interface WizardInput {
  frameSize: number; // mm diagonal
  motorKV: number;
  batteryS: number;
  propSize: number; // e.g. 51 = 5.1 inch
  weight: number; // grams AUW
  style: "race" | "freestyle" | "cinematic";
}

export interface WizardResult {
  pid: {
    roll: { p: number; i: number; d: number; f: number };
    pitch: { p: number; i: number; d: number; f: number };
    yaw: { p: number; i: number; d: number };
  };
  filters: {
    gyroLpf1Hz: number;
    gyroLpf2Hz: number;
    dTermLpf1Hz: number;
    rpmFilter: boolean;
    dynamicNotch: string;
    dTermLpfType: string;
  };
  rates: {
    roll: { rc_rate: number; rate: number; expo: number };
    pitch: { rc_rate: number; rate: number; expo: number };
    yaw: { rc_rate: number; rate: number; expo: number };
  };
  cliCommands: string[];
  warnings: string[];
  tips: string[];
  /** 0–100 confidence score based on how typical the input combination is */
  confidence: number;
}

export interface CalculatorResult {
  estimatedThrust: number; // grams per motor
  thrustToWeight: number;
  estimatedFlightTime: number; // minutes
  estimatedCurrentDraw: number; // amps
  batteryRating: "sufficient" | "marginal" | "insufficient";
  warnings: string[];
}

// ─── My Drone Profiles ──────────────────────────────────────
// A saved "aircraft" record. Wraps WizardInput so any profile can be
// pushed straight into the Tuning Wizard, FPV Doctor, or Blackbox Analyzer
// without re-typing specs. Stored client-side (see lib/storage/profiles.ts).
export interface DroneProfile {
  id: string;
  name: string;
  /** Optional free-text nickname shown in the UI, e.g. "Race Quad #2" */
  notes?: string;
  spec: WizardInput;
  /** Last wizard result generated for this profile, cached for quick recall */
  lastTuning?: WizardResult;
  /** ISO 8601 timestamps */
  createdAt: string;
  updatedAt: string;
  /** Optional link to a Preset this profile was based on */
  basedOnPresetId?: string;
  /** Free-form tags for filtering, e.g. ["6S", "long-range"] */
  tags: string[];
  /** Marks the profile currently active across Doctor/Blackbox tools */
  isActive?: boolean;
}

export type DroneProfileDraft = Omit<DroneProfile, "id" | "createdAt" | "updatedAt">;

// ─── FPV Doctor AI ───────────────────────────────────────────
// Rule-based diagnostic session. "AI" here means a structured expert-system
// pass over symptoms + optional profile context — see lib/doctor/diagnose.ts.
// Architected so a future LLM-backed endpoint can replace the rule engine
// without changing this contract.
export interface DoctorSymptomInput {
  /** Free-text description of what's happening */
  description: string;
  /** Optional structured category to narrow the search space */
  category?: Problem["category"] | "unknown";
  /** Optional linked profile for spec-aware diagnosis */
  profileId?: string;
}

export interface DoctorFinding {
  problemId: string;
  /** 0-1 confidence score from the matching engine */
  confidence: number;
  matchedKeywords: string[];
}

export interface DoctorSession {
  id: string;
  input: DoctorSymptomInput;
  findings: DoctorFinding[];
  /** Additional spec-aware warnings, e.g. from calculateTuning() on the linked profile */
  specWarnings: string[];
  createdAt: string;
}

// ─── Blackbox Analyzer ───────────────────────────────────────
// Architecture-level types for ingesting Betaflight blackbox logs (.bbl/.csv).
// Parsing itself is a future module (lib/blackbox/parser.ts is currently a
// stub); these types define the contract the UI is built against today.
export type BlackboxLogStatus = "idle" | "uploading" | "parsing" | "ready" | "error";

export interface BlackboxLogMeta {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  /** Detected firmware target / FC, populated once parsed */
  firmware?: string;
  durationSeconds?: number;
  loopRateHz?: number;
  status: BlackboxLogStatus;
  /** Linked profile, if the user attaches a log to a saved drone */
  profileId?: string;
  error?: string;
}

export interface BlackboxAxisStats {
  axis: "roll" | "pitch" | "yaw";
  /** Peak-to-peak gyro noise, deg/s */
  noisePeakToPeak: number;
  /** Estimated propwash severity 0-1 */
  propwashScore: number;
  /** Step response overshoot percentage, if computed */
  stepResponseOvershootPct?: number;
}

export interface BlackboxAnalysisResult {
  logId: string;
  axes: BlackboxAxisStats[];
  /** High-level human-readable findings, same shape as Doctor findings
   *  so both tools can render through shared UI components. */
  findings: DoctorFinding[];
  generatedAt: string;
}
