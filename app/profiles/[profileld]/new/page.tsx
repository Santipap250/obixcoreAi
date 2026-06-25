// app/profiles/new/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the rationale on the Server/Client split pattern used across this app.
import type { Metadata } from "next";
import NewProfileClient from "./NewProfileClient";

export const metadata: Metadata = {
  title: "เพิ่มโดรนใหม่",
  description: "เพิ่มโปรไฟล์โดรนลำใหม่พร้อมสเปกเต็มรูปแบบ",
};

export default function NewProfilePage() {
  return <NewProfileClient />;
}
