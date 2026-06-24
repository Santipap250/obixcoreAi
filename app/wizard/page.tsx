// app/wizard/page.tsx
// Server Component wrapper. Next.js App Router only allows `metadata`
// exports from Server Components, but this page's actual UI is interactive
// (sliders, live calculation) and must stay a Client Component. The
// standard pattern — and what's applied consistently across every route in
// this app now — is to split: page.tsx stays a thin Server Component that
// owns the route's <title>/<meta>, and renders the real implementation
// from a co-located *Client.tsx file. WizardClient.tsx is byte-for-byte
// the original page logic, just renamed.
import type { Metadata } from "next";
import WizardClient from "./WizardClient";

export const metadata: Metadata = {
  title: "Tuning Wizard",
  description: "กรอกสเปกโดรน → ได้ค่า PID, Filter และ Rates พร้อม Betaflight CLI command ที่ copy ใช้ได้ทันที",
};

export default function WizardPage() {
  return <WizardClient />;
}
