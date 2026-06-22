"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listProfiles, deleteProfile, setActiveProfile } from "@/lib/storage/profiles";
import type { DroneProfile } from "@/types";
import ProfileCard from "@/components/profiles/ProfileCard";

export default function ProfilesClient() {
  const [profiles, setProfiles] = useState<DroneProfile[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DroneProfile | null>(null);

  useEffect(() => {
    setProfiles(listProfiles());
    setHydrated(true);
  }, []);

  const refresh = () => setProfiles(listProfiles());

  const handleSetActive = (id: string) => {
    setActiveProfile(id);
    refresh();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteProfile(pendingDelete.id);
    setPendingDelete(null);
    refresh();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-cyan-DEFAULT rounded-full" />
            <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">My Drone Profiles</h1>
          </div>
          <p className="text-sm text-text-muted font-sarabun ml-3.5">
            บันทึกสเปกโดรนแต่ละลำ เรียกใช้ซ้ำได้ใน Wizard, Doctor และ Blackbox
          </p>
        </div>
        <Link
          href="/profiles/new"
          className="shrink-0 flex items-center gap-1.5 rounded-xl border border-cyan-DEFAULT/40 bg-cyan-muted/40 px-3 py-2.5 text-xs font-mono text-cyan-DEFAULT hover:bg-cyan-muted/70 transition-all active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          เพิ่มโดรน
        </Link>
      </div>

      {!hydrated ? (
        <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดโปรไฟล์">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-bg-surface border border-bg-border animate-pulse" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="hud-card rounded-2xl p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-DEFAULT/30 bg-cyan-muted/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-DEFAULT">
              <path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z"/>
            </svg>
          </div>
          <p className="text-sm font-sarabun text-text font-medium">ยังไม่มีโดรนที่บันทึกไว้</p>
          <p className="mt-1 text-xs font-sarabun text-text-muted">
            เพิ่มโปรไฟล์โดรนลำแรกของคุณเพื่อเริ่มใช้งานฟีเจอร์ทั้งหมด
          </p>
          <Link
            href="/profiles/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-cyan-DEFAULT px-4 py-2.5 text-xs font-orbitron font-bold text-bg-DEFAULT hover:bg-cyan-dim transition-all"
          >
            + เพิ่มโดรนลำแรก
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              onSetActive={handleSetActive}
              onDelete={() => setPendingDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation — simple inline dialog, no extra dependency */}
      {pendingDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-3 md:items-center"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="hud-card w-full max-w-sm rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="font-orbitron text-sm font-semibold text-text">
              ลบโปรไฟล์นี้?
            </h2>
            <p className="mt-2 text-xs font-sarabun text-text-muted leading-relaxed">
              &quot;{pendingDelete.name}&quot; จะถูกลบถาวร การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 rounded-lg border border-bg-border text-text-muted text-xs font-mono hover:bg-bg-elevated transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-DEFAULT text-bg-DEFAULT text-xs font-mono font-semibold hover:bg-red-dim transition-all"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
