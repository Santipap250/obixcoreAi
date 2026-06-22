// app/profiles/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the rationale on the Server/Client split pattern used across this app.
import type { Metadata } from "next";
import ProfilesClient from "./ProfilesClient";

export const metadata: Metadata = {
  title: "My Drone Profiles",
  description: "บันทึกสเปกโดรนแต่ละลำของคุณ พร้อมค่าจูนล่าสุด เรียกใช้ซ้ำได้ใน Wizard, FPV Doctor และ Blackbox Analyzer",
};

export default function ProfilesPage() {
  return <ProfilesClient />;
}
