// app/profiles/[profileId]/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the rationale on the Server/Client split pattern used across this app.
//
// Note: metadata here is intentionally generic (not per-profile) since
// profile data lives in localStorage, which is invisible to the server at
// request time — there is no server-side data source to generate a dynamic
// title like "Race Quad #1 · OBIXCORE AI" from. If profiles ever move to a
// real backend, this is the file to upgrade to generateMetadata().
import type { Metadata } from "next";
import ProfileDetailClient from "./ProfileDetailClient";

export const metadata: Metadata = {
  title: "Drone Profile",
  description: "ดูและแก้ไขสเปกโดรน พร้อมค่าจูนล่าสุดและทางลัดไปยัง FPV Doctor และ Blackbox Analyzer",
};

export default function ProfileDetailPage() {
  return <ProfileDetailClient />;
}
