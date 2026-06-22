# OBIXCORE AI — FPV Copilot

> FPV Copilot ครบวงจร: Dashboard, My Drone Profiles, FPV Doctor AI, Blackbox Analyzer, Tuning Wizard, Problem Solver, Calculator และ Preset Library

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone หรือ unzip โปรเจกต์
cd obixcore

# 2. ติดตั้ง dependencies
npm install

# 3. รัน dev server
npm run dev

# เปิด http://localhost:3000 → จะ redirect ไป /dashboard อัตโนมัติ
```

**Prerequisites:** Node.js 18+ / npm 9+ (project pins `20.18.1` in `engines`)

---

## 🌐 Deploy ฟรี (Cloudflare Pages)

### วิธีที่ 1: GitHub + Cloudflare Pages (แนะนำ)

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/obixcore.git
git push -u origin main

# ไปที่ https://pages.cloudflare.com/
# Connect GitHub repo → Build settings:
#    Framework: Next.js
#    Build command: npm run build
#    Output directory: out
# Deploy → ได้ URL ฟรี เช่น obixcore.pages.dev
```

### วิธีที่ 2: GitHub Pages

```bash
npm install --save-dev gh-pages
# เพิ่มใน package.json scripts:
# "deploy": "next build && touch out/.nojekyll && gh-pages -d out -t true"
npm run deploy
```

### วิธีที่ 3: Vercel (ง่ายที่สุด)

```bash
npm install -g vercel
vercel
```

> **Note:** `next.config.mjs` sets `images.unoptimized: true` intentionally — this is a static-export deploy target (no Node image server). If you move to Vercel/Node hosting, you can remove that flag to enable on-demand image optimization.

---

## 🏗 Architecture (v0.2.0 — "AI FPV Copilot")

This release restructures OBIXCORE from a 4-tool static site into a scalable
product with persistent state and three new AI-adjacent modules, while
**preserving 100% of the original Wizard / Problem Solver / Calculator /
Preset Library behavior** — those four tools are functionally untouched.

### What's new

| Module | Route | What it does |
|---|---|---|
| **Dashboard** | `/dashboard` | Operational home — active drone at a glance, stats, full module grid. Root `/` redirects here. |
| **My Drone Profiles** | `/profiles`, `/profiles/new`, `/profiles/[id]` | Save drone specs (reuses the Wizard's `WizardInput` shape), cache tuning results, mark one profile "Active," jump straight into Doctor/Blackbox with that profile linked. Persisted in `localStorage` — no backend. |
| **FPV Doctor AI** | `/doctor` | Describe a symptom in free text → ranked, explainable matches against `data/problems.json` (keyword-overlap scoring, not a black box) + spec-aware warnings if a profile is linked. |
| **Blackbox Analyzer** | `/blackbox` | Upload a Betaflight Blackbox **CSV** export → per-axis (roll/pitch/yaw) noise and propwash analysis, fully client-side. `.bbl` binary support is architected (`lib/blackbox/parser.ts`'s `BlackboxParser` interface) but not yet implemented — see scope note in that file. |

### Folder structure

```
obixcore/
├── app/
│   ├── page.tsx                  ← redirects to /dashboard
│   ├── dashboard/                ← NEW: operational hub
│   ├── profiles/                 ← NEW: My Drone Profiles (list/new/[id])
│   ├── doctor/                   ← NEW: FPV Doctor AI
│   ├── blackbox/                 ← NEW: Blackbox Analyzer
│   ├── wizard/ problems/ calculator/ presets/   ← original 4 tools, behavior unchanged
│   ├── sitemap.ts / robots.ts    ← NEW: SEO
│   └── layout.tsx                ← next/font, metadataBase, skip-link
├── components/
│   ├── ui/                       ← shared primitives (Badge, CodeBlock, CopyButton, ToolCard, ValueDisplay)
│   ├── nav/                      ← data-driven Nav + nav-items.tsx (single source of truth)
│   ├── profiles/ doctor/ blackbox/   ← NEW: module-specific components
│   └── Badge.tsx etc. (root)     ← thin re-export shims to components/ui/* (back-compat)
├── lib/
│   ├── wizard.ts                 ← UNCHANGED — PID/filter calculation logic
│   ├── utils.ts                  ← UNCHANGED
│   ├── storage/profiles.ts       ← NEW: localStorage persistence for Drone Profiles
│   ├── doctor/diagnose.ts        ← NEW: rule-based symptom matcher
│   └── blackbox/parser.ts        ← NEW: pluggable log-parser architecture (CSV implemented)
├── data/
│   ├── presets.json              ← UNCHANGED
│   └── problems.json             ← UNCHANGED
└── types/index.ts                ← extended with DroneProfile, DoctorSession, BlackboxAnalysisResult etc.
```

### Why each route is a thin Server Component

Every `app/<route>/page.tsx` is a small Server Component that exports
`metadata` (title/description) and renders a co-located `*Client.tsx` file
containing the actual interactive UI. Next.js's App Router only allows
`metadata` exports from Server Components, but every page here needs client
interactivity (state, localStorage, forms) — so this split is required to
get per-route SEO metadata without breaking functionality. `Suspense`
boundaries wrap the few client components that call `useSearchParams()`
(`Doctor`, `Blackbox`, `Problems`), per Next.js App Router requirements.

### Persistence: why localStorage, not a database

OBIXCORE has no backend and deploys as a **static export** (Cloudflare
Pages / GitHub Pages). `localStorage` gives Drone Profiles and Blackbox log
history real persistence with zero new infrastructure. Every read/write goes
through `lib/storage/profiles.ts` and `lib/blackbox/storage.ts` — if this
ever moves to a real database, those two files are the only places that need
to change; no component imports `localStorage` directly.

---

## 📝 Content Workflow

### เพิ่ม Preset ใหม่

แก้ไขไฟล์ `data/presets.json` — เพิ่ม object ใหม่ตาม template นี้:

```json
{
  "id": "preset-5inch-freestyle-002",
  "name": "ชื่อ preset",
  "description": "คำอธิบาย",
  "type": "freestyle",
  "frameSize": "5inch",
  "batteryS": 4,
  "bfVersion": "4.4",
  "difficulty": "intermediate",
  "tags": ["5inch", "4s", "freestyle"],
  "pid": {
    "roll":  { "p": 47, "i": 52, "d": 32, "f": 120 },
    "pitch": { "p": 48, "i": 52, "d": 32, "f": 120 },
    "yaw":   { "p": 35, "i": 90, "d": 0 }
  },
  "rates": {
    "type": "actual",
    "roll":  { "rc_rate": 1.0, "rate": 0.70, "expo": 0.10 },
    "pitch": { "rc_rate": 1.0, "rate": 0.70, "expo": 0.10 },
    "yaw":   { "rc_rate": 1.0, "rate": 0.50, "expo": 0.10 }
  },
  "filters": {
    "gyroLpf1Hz": 200,
    "gyroLpf2Hz": 200,
    "dTermLpf1Hz": 100,
    "rpmFilter": true,
    "dynamicNotch": "MEDIUM"
  },
  "cliCommands": ["# ชื่อ preset — OBIXCORE", "set p_roll = 47", "...", "save"],
  "notes": "หมายเหตุพิเศษ (optional)"
}
```

### เพิ่มปัญหาใหม่ (used by both Problem Solver AND FPV Doctor AI)

แก้ไขไฟล์ `data/problems.json` — `lib/doctor/diagnose.ts` matches against this
same file, so a new problem entry automatically becomes diagnosable by FPV
Doctor with no extra wiring:

```json
{
  "id": "prob-ชื่อ-unique",
  "symptom": "อาการที่เจอ (ภาษาไทย)",
  "category": "flight",
  "severity": "medium",
  "description": "คำอธิบายเพิ่มเติม",
  "causes": ["สาเหตุ 1", "สาเหตุ 2"],
  "steps": [
    { "order": 1, "title": "ชื่อขั้นตอน", "description": "รายละเอียด", "action": "set p_roll = 40\nsave", "warning": "คำเตือน" }
  ],
  "relatedPresetIds": [],
  "tags": ["tag1", "tag2"]
}
```

### แก้ Tuning Wizard Logic

แก้ไขไฟล์ `lib/wizard.ts` (shared by Wizard, Profiles, and Doctor's spec-warnings):

- ปรับ base PID ตาม frame size → ฟังก์ชัน `calculateTuning()` บรรทัด ~10
- ปรับ style multipliers → ฟังก์ชันเดิม บรรทัด ~35
- ปรับ filter recommendations → บรรทัด ~60

### เพิ่มเส้นทาง Blackbox parser ใหม่ (เช่น .bbl binary)

1. Implement the `BlackboxParser` interface in `lib/blackbox/parser.ts`
2. Register it in `getParserFor()`
3. No UI changes needed — `BlackboxUploader`/`BlackboxClient` depend only on the interface

---

## 🔮 Roadmap

| Feature | Priority | ต้องการ |
|---|---|---|
| `.bbl` binary Blackbox parsing | High | Port/port-compatible decoder for Betaflight's binary log format |
| Trick Library | Medium | JSON data + new page |
| Parts Compatibility | Medium | JSON data + search |
| Cloud-synced Drone Profiles | Medium | Backend + auth (currently localStorage-only) |
| LLM-backed FPV Doctor | Medium | Swap `findMatches()` for an embedding/LLM call — `DoctorSession` contract is already shaped for this |
| Community Presets | Low | Backend + moderation |
| PWA / Install | Low | next-pwa |

---

## ⚠️ Disclaimer

ค่าทั้งหมดเป็นจุดเริ่มต้นโดยประมาณ ควร fine-tune ตามโดรนจริงและทดสอบในพื้นที่ปลอดภัยเสมอ
FPV Doctor AI ใช้ระบบจับคู่คำสำคัญ ไม่ใช่การวินิจฉัยทางวิศวกรรมที่แม่นยำ 100% — ใช้เป็นจุดเริ่มต้นในการสืบหาสาเหตุเท่านั้น
