"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  setActiveProfile,
} from "@/lib/storage/profiles";
import { calculateTuning } from "@/lib/wizard";
import type { DroneProfile, DroneProfileDraft } from "@/types";
import ProfileForm from "@/components/profiles/ProfileForm";
import { ValueDisplay, CodeBlock } from "@/components/ui";

export default function ProfileDetailClient() {
  const params = useParams<{ profileId: string }>();
  const router = useRouter();
  const profileId = params.profileId;

  const [profile, setProfile] = useState<DroneProfile | null | undefined>(undefined);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    setProfile(getProfile(profileId));
  }, [profileId]);

  // Loading state (undefined = not yet checked, browser-only hydration)
  if (profile === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="h-48 rounded-2xl bg-bg-surface border border-bg-border animate-pulse" aria-busy="true" aria-label="กำลังโหลด" />
      </div>
    );
  }

  // Not found
  if (profile === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-sm font-sarabun text-text-muted">ไม่พบโปรไฟล์นี้ อาจถูกลบไปแล้ว</p>
        <Link href="/profiles" className="mt-3 inline-block text-xs font-mono text-cyan-DEFAULT hover:underline">
          กลับไปหน้า My Drone Profiles
        </Link>
      </div>
    );
  }

  const handleUpdate = (draft: DroneProfileDraft) => {
    const updated = updateProfile(profile.id, draft);
    if (updated) {
      setProfile(updated);
      setMode("view");
    }
  };

  const handleDelete = () => {
    deleteProfile(profile.id);
    router.push("/profiles");
  };

  const handleRecalculate = () => {
    const result = calculateTuning(profile.spec);
    const updated = updateProfile(profile.id, { lastTuning: result });
    if (updated) setProfile(updated);
  };

  const handleSetActive = () => {
    setActiveProfile(profile.id);
    setProfile({ ...profile, isActive: true });
  };

  if (mode === "edit") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-cyan-DEFAULT rounded-full" />
            <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">แก้ไขโดรน</h1>
          </div>
        </div>
        <ProfileForm
          initial={profile}
          submitLabel="บันทึกการแก้ไข"
          onSubmit={handleUpdate}
          onCancel={() => setMode("view")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="font-orbitron font-bold text-lg text-text tracking-wide truncate">{profile.name}</h1>
            {profile.isActive && (
              <span className="hud-chip px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-DEFAULT bg-cyan-muted/60">
                Active
              </span>
            )}
          </div>
          {profile.notes && <p className="text-sm text-text-muted font-sarabun">{profile.notes}</p>}
        </div>
        <button
          onClick={() => setMode("edit")}
          className="shrink-0 rounded-xl border border-bg-border px-3 py-2 text-xs font-mono text-text-muted hover:bg-bg-elevated transition-all"
        >
          แก้ไข
        </button>
      </div>

      {/* Spec summary */}
      <div className="hud-card rounded-2xl p-4 mb-5">
        <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-3">สเปก</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <ValueDisplay label="Frame" value={profile.spec.frameSize} unit="mm" color="cyan" size="sm" />
          <ValueDisplay label="Motor" value={profile.spec.motorKV} unit="KV" color="cyan" size="sm" />
          <ValueDisplay label="Battery" value={profile.spec.batteryS} unit="S" color="cyan" size="sm" />
          <ValueDisplay label="Prop" value={(profile.spec.propSize / 10).toFixed(1)} unit='"' color="cyan" size="sm" />
          <ValueDisplay label="AUW" value={profile.spec.weight} unit="g" color="cyan" size="sm" />
        </div>
        {profile.tags.length > 0 && (
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {profile.tags.map((tag) => (
              <span key={tag} className="hud-chip px-2 py-0.5 text-[10px] font-mono text-text-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions to other modules, profile pre-linked */}
      <div className="grid grid-cols-2 gap-2 mb-5 sm:grid-cols-3">
        {!profile.isActive && (
          <button
            onClick={handleSetActive}
            className="col-span-2 sm:col-span-3 py-2.5 rounded-xl border border-cyan-DEFAULT/30 text-cyan-DEFAULT text-xs font-mono hover:bg-cyan-muted/30 transition-all active:scale-[0.98]"
          >
            ตั้งเป็นโดรน Active
          </button>
        )}
        <Link
          href={`/doctor?profileId=${profile.id}`}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-pink-DEFAULT/30 text-pink-DEFAULT text-xs font-mono hover:bg-pink-muted/30 transition-all"
        >
          FPV Doctor
        </Link>
        <Link
          href={`/blackbox?profileId=${profile.id}`}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-purple-DEFAULT/30 text-purple-DEFAULT text-xs font-mono hover:bg-purple-muted/30 transition-all"
        >
          Blackbox
        </Link>
        <button
          onClick={handleRecalculate}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-green-DEFAULT/30 text-green-DEFAULT text-xs font-mono hover:bg-green-muted/30 transition-all"
        >
          คำนวณค่าจูนใหม่
        </button>
      </div>

      {/* Cached tuning result */}
      {profile.lastTuning ? (
        <section className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">ค่าจูนล่าสุด</h2>
            <div className="flex-1 h-px bg-bg-border" />
          </div>
          <CodeBlock lines={profile.lastTuning.cliCommands} title={`${profile.name}.txt`} maxHeight="280px" />
        </section>
      ) : (
        <div className="hud-card rounded-2xl p-4 mb-5 text-center">
          <p className="text-xs font-sarabun text-text-muted">
            ยังไม่มีค่าจูนที่คำนวณไว้ — กด &quot;คำนวณค่าจูนใหม่&quot; ด้านบน
          </p>
        </div>
      )}

      {/* Danger zone */}
      <div className="pt-2 border-t border-bg-border">
        <button
          onClick={handleDelete}
          className="text-xs font-mono text-text-faint hover:text-red-DEFAULT transition-colors"
        >
          ลบโปรไฟล์นี้
        </button>
      </div>
    </div>
  );
}
