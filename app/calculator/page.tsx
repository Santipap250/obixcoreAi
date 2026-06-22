// app/calculator/page.tsx
// Server Component wrapper exporting route metadata — see app/wizard/page.tsx
// for the full rationale. CalculatorClient.tsx is the original page logic
// unchanged, just renamed.
import type { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Calculator",
  description: "คำนวณ thrust-to-weight ratio, flight time โดยประมาณ และจับคู่ prop กับสเปกโดรนของคุณ",
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
