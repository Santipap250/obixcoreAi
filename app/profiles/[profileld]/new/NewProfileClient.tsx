"use client";
import { useRouter } from "next/navigation";
import { createProfile, listProfiles, setActiveProfile } from "@/lib/storage/profiles";
import type { DroneProfileDraft } from "@/types";
import ProfileForm from "@/components/profiles/ProfileForm";

export default function NewProfileClient() {
  const router = useRouter();

  const handleSubmit = (draft: DroneProfileDraft) => {
    const isFirstProfile = listProfiles().length === 0;
    const created = createProfile(draft);
    // The first profile a person ever creates is set active automatically —
    // otherwise Doctor/Blackbox spec-aware features would have nothing to
    // link to until the user manually flips a toggle they don't know exists.
    if (isFirstProfile) setActiveProfile(created.id);
    router.push(`/profiles/${created.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-cyan-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">เพิ่มโดรนใหม่</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          กรอกสเปกโดรน — ใช้รูปแบบเดียวกับ Tuning Wizard เพื่อเรียกใช้ซ้ำได้ทุกที่
        </p>
      </div>

      <ProfileForm
        submitLabel="บันทึกโดรน"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/profiles")}
      />
    </div>
  );
}
