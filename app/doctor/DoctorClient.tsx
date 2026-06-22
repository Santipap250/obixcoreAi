"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { runDiagnosis } from "@/lib/doctor/diagnose";
import { getProfile, listProfiles } from "@/lib/storage/profiles";
import type { DoctorSession, DroneProfile, Problem } from "@/types";
import DoctorFindingCard from "@/components/doctor/DoctorFindingCard";

const CATEGORY_OPTIONS: { value: Problem["category"] | "unknown"; label: string }[] = [
  { value: "unknown", label: "ไม่แน่ใจ" },
  { value: "flight", label: "การบิน" },
  { value: "video", label: "วิดีโอ/FPV" },
  { value: "power", label: "ระบบไฟ" },
  { value: "mechanical", label: "เครื่องกล" },
];

const EXAMPLE_PROMPTS = [
  "โดรนสั่นเมื่อ throttle drop",
  "วิดีโอมีเส้นรบกวน",
  "motor ร้อนผิดปกติหลังบิน",
  "โดรนหมุน yaw เองตอนบิน",
];

function DoctorPageInner() {
  const searchParams = useSearchParams();
  const linkedProfileId = searchParams.get("profileId");

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Problem["category"] | "unknown">("unknown");
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [linkedProfile, setLinkedProfile] = useState<DroneProfile | null>(null);
  const [profiles, setProfiles] = useState<DroneProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  useEffect(() => {
    setProfiles(listProfiles());
    if (linkedProfileId) {
      const p = getProfile(linkedProfileId);
      setLinkedProfile(p);
      setSelectedProfileId(p?.id ?? "");
    }
  }, [linkedProfileId]);

  const handleProfileSelect = (id: string) => {
    setSelectedProfileId(id);
    setLinkedProfile(id ? getProfile(id) : null);
  };

  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const result = runDiagnosis({ description, category }, linkedProfile);
    setSession(result);
    setTimeout(() => {
      document.getElementById("doctor-results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-pink-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">FPV Doctor AI</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          อธิบายอาการที่เจอด้วยคำพูดของคุณ — ระบบจะจับคู่กับฐานข้อมูลปัญหาและให้ระดับความเชื่อมั่น
        </p>
      </div>

      <form onSubmit={handleDiagnose} className="space-y-4">
        {/* Profile linking */}
        {profiles.length > 0 && (
          <div>
            <label htmlFor="doctor-profile" className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1.5 block">
              โดรนที่เกี่ยวข้อง <span className="normal-case text-text-faint">(ไม่บังคับ — เพิ่ม spec-aware warnings)</span>
            </label>
            <select
              id="doctor-profile"
              value={selectedProfileId}
              onChange={(e) => handleProfileSelect(e.target.value)}
              className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-pink-DEFAULT/60 transition-colors"
            >
              <option value="">ไม่เลือก</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Symptom input */}
        <div>
          <label htmlFor="doctor-description" className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1.5 block">
            อาการที่เจอ
          </label>
          <textarea
            id="doctor-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น โดรนสั่นตอน throttle drop หลัง freestyle..."
            className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-sarabun text-text focus:outline-none focus:border-pink-DEFAULT/60 transition-colors resize-none"
          />
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDescription(p)}
                className="hud-chip px-2.5 py-1 text-[11px] font-sarabun text-text-muted hover:text-pink-DEFAULT hover:border-pink-DEFAULT/40 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">หมวดหมู่ (ถ้าทราบ)</p>
          <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="หมวดหมู่ปัญหา">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={category === c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  category === c.value
                    ? "border-pink-DEFAULT bg-pink-muted text-pink-DEFAULT"
                    : "border-bg-border text-text-muted hover:bg-bg-elevated"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!description.trim()}
          className="w-full py-4 rounded-xl bg-pink-DEFAULT text-bg-DEFAULT font-orbitron font-bold text-sm tracking-widest hover:bg-pink-dim active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          🩺 วินิจฉัยอาการ
        </button>
      </form>

      {/* Results */}
      {session && (
        <div id="doctor-results" className="mt-8 space-y-5 animate-slide-up">
          <div className="h-px bg-bg-border" />

          {session.specWarnings.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
                  Spec Warnings — {linkedProfile?.name}
                </h2>
                <div className="flex-1 h-px bg-bg-border" />
              </div>
              <div className="space-y-2">
                {session.specWarnings.map((w, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-amber-muted border border-amber-DEFAULT/30">
                    <span className="text-amber-DEFAULT text-sm mt-0.5 shrink-0">⚠</span>
                    <p className="text-xs font-sarabun text-amber-DEFAULT leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
                ผลวินิจฉัย ({session.findings.length})
              </h2>
              <div className="flex-1 h-px bg-bg-border" />
            </div>

            {session.findings.length === 0 ? (
              <div className="hud-card rounded-2xl p-6 text-center">
                <p className="text-sm font-sarabun text-text-muted">
                  ไม่พบปัญหาที่ตรงกับคำอธิบาย ลองอธิบายให้ละเอียดขึ้น หรือดูฐานข้อมูลทั้งหมดที่{" "}
                  <Link href="/problems" className="text-pink-DEFAULT hover:underline">Problem Solver</Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {session.findings.map((f) => (
                  <DoctorFindingCard key={f.problemId} finding={f} />
                ))}
              </div>
            )}
          </section>

          <p className="text-center text-[11px] text-text-faint font-sarabun">
            FPV Doctor ใช้ระบบจับคู่คำสำคัญกับฐานข้อมูลปัญหา — ไม่ใช่การวินิจฉัยทางวิศวกรรมที่แม่นยำ 100%
          </p>
        </div>
      )}
    </div>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router (it
// triggers a client-side-only bailout during static rendering otherwise).
export default function DoctorClient() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-6 text-sm text-text-muted">Loading…</div>}>
      <DoctorPageInner />
    </Suspense>
  );
}
