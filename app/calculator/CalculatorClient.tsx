"use client";
import { useState } from "react";
import { estimateCurrentDraw, calculateFlightTime } from "@/lib/wizard";
import ValueDisplay from "@/components/ValueDisplay";

type CalcMode = "flighttime" | "twr" | "props";

const MODES: { value: CalcMode; label: string; labelTh: string; color: string }[] = [
  { value: "flighttime", label: "Flight Time", labelTh: "เวลาบิน",        color: "blue" },
  { value: "twr",        label: "Thrust/Weight", labelTh: "อัตราแรงขับ",  color: "green" },
  { value: "props",      label: "Prop Matcher", labelTh: "จับคู่ Prop",   color: "cyan" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest">{children}</p>
      <div className="flex-1 h-px bg-bg-border" />
    </div>
  );
}

function NumberInput({ label, sublabel, value, min, max, step = 1, unit, onChange }: {
  label: string; sublabel?: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{label}</p>
        {sublabel && <span className="text-[10px] text-text-faint font-sarabun">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-blue-DEFAULT/60 transition-colors"
        />
        {unit && <span className="text-xs font-mono text-text-muted w-12 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Flight Time Calculator ───────────────────────────────
function FlightTimeCalc() {
  const [batteryMah, setBatteryMah] = useState(1500);
  const [batteryS, setBatteryS] = useState(4);
  const [motorKV, setMotorKV] = useState(2306);
  const [motorCount, setMotorCount] = useState(4);
  const [propSize, setPropSize] = useState(51);

  const currentA = estimateCurrentDraw(motorKV, batteryS, motorCount, propSize);
  const flightMin = calculateFlightTime(batteryMah, batteryS, currentA);
  const wh = (batteryMah / 1000) * (batteryS * 3.7);

  const ratingColor: "green" | "amber" | "red" =
    flightMin >= 5 ? "green" : flightMin >= 3 ? "amber" : "red";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Battery" sublabel="ความจุ" value={batteryMah} min={300} max={6000} step={50} unit="mAh" onChange={setBatteryMah} />
        <NumberInput label="Cells" sublabel="จำนวน Cell" value={batteryS} min={2} max={6} step={1} unit="S" onChange={setBatteryS} />
        <NumberInput label="Motor KV" sublabel="KV rating" value={motorKV} min={1000} max={4000} step={50} unit="KV" onChange={setMotorKV} />
        <NumberInput label="Motors" sublabel="จำนวนมอเตอร์" value={motorCount} min={1} max={8} step={1} unit="pcs" onChange={setMotorCount} />
      </div>
      <NumberInput label="Prop Size" sublabel="ขนาด prop (x10)" value={propSize} min={20} max={75} step={1} unit={'×0.1"'} onChange={setPropSize} />

      <SectionLabel>ผลลัพธ์โดยประมาณ</SectionLabel>

      <div className="grid grid-cols-3 gap-2">
        <ValueDisplay label="Flight" value={flightMin.toFixed(1)} unit="min" color={ratingColor} size="md" />
        <ValueDisplay label="Current" value={currentA.toFixed(1)} unit="A" color="blue" size="md" />
        <ValueDisplay label="Wh" value={wh.toFixed(1)} unit="Wh" color="cyan" size="md" />
      </div>

      <div className="p-3 rounded-xl bg-bg-elevated border border-bg-border">
        <div className="flex justify-between text-xs font-mono mb-2">
          <span className="text-text-faint">เวลาบินโดยประมาณ (~80% capacity)</span>
          <span className={`font-semibold ${ratingColor === "green" ? "text-green-DEFAULT" : ratingColor === "amber" ? "text-amber-DEFAULT" : "text-red-DEFAULT"}`}>
            {flightMin >= 5 ? "✓ ดี" : flightMin >= 3 ? "~ พอใช้" : "✗ สั้น"}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${ratingColor === "green" ? "bg-green-DEFAULT" : ratingColor === "amber" ? "bg-amber-DEFAULT" : "bg-red-DEFAULT"}`}
            style={{ width: `${Math.min(100, (flightMin / 10) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-text-faint font-sarabun mt-2">
          * ประมาณการจาก average throttle ~65% — เวลาบินจริงขึ้นอยู่กับสไตล์การบิน
        </p>
      </div>
    </div>
  );
}

// ─── Thrust-to-Weight Calculator ────────────────────────
function TWRCalc() {
  const [thrustPerMotor, setThrustPerMotor] = useState(850);
  const [motorCount, setMotorCount] = useState(4);
  const [auw, setAuw] = useState(320);

  const totalThrust = thrustPerMotor * motorCount;
  const twr = totalThrust / auw;
  const twrColor: "green" | "amber" | "red" =
    twr >= 8 ? "green" : twr >= 4 ? "amber" : "red";
  const twrLabel =
    twr >= 10 ? "⚡ Race-ready" : twr >= 7 ? "✓ Freestyle" : twr >= 4 ? "~ OK" : "✗ น้ำหนักมากเกิน";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Thrust/Motor" sublabel="แรงขับต่อมอเตอร์" value={thrustPerMotor} min={100} max={3000} step={50} unit="g" onChange={setThrustPerMotor} />
        <NumberInput label="Motors" sublabel="จำนวนมอเตอร์" value={motorCount} min={1} max={8} step={1} unit="pcs" onChange={setMotorCount} />
      </div>
      <NumberInput label="AUW" sublabel="น้ำหนักรวมพร้อมแบต" value={auw} min={50} max={2000} step={10} unit="g" onChange={setAuw} />

      <SectionLabel>ผลลัพธ์</SectionLabel>

      <div className="grid grid-cols-3 gap-2">
        <ValueDisplay label="Total" value={totalThrust} unit="g" color="green" size="md" />
        <ValueDisplay label="TWR" value={twr.toFixed(1)} unit="×" color={twrColor} size="md" />
        <ValueDisplay label="AUW" value={auw} unit="g" color="cyan" size="md" />
      </div>

      <div className="p-4 rounded-xl border border-bg-border bg-bg-elevated text-center">
        <p className={`text-lg font-orbitron font-bold ${twrColor === "green" ? "text-green-DEFAULT" : twrColor === "amber" ? "text-amber-DEFAULT" : "text-red-DEFAULT"}`}>
          {twrLabel}
        </p>
        <p className="text-xs text-text-muted font-sarabun mt-1">
          Thrust-to-Weight Ratio = {twr.toFixed(2)}:1
        </p>
      </div>

      {/* Reference table */}
      <div className="p-3 rounded-xl bg-bg-surface border border-bg-border">
        <p className="text-[10px] font-mono text-text-faint uppercase tracking-wider mb-2">อ้างอิง TWR</p>
        {[
          { range: "2:1 – 4:1", label: "บินเบา / Cinematic", color: "text-blue-DEFAULT" },
          { range: "4:1 – 7:1", label: "Freestyle ทั่วไป",  color: "text-purple-DEFAULT" },
          { range: "7:1 – 10:1", label: "Freestyle / Race",  color: "text-amber-DEFAULT" },
          { range: "10:1+", label: "Race / Aggressive",      color: "text-green-DEFAULT" },
        ].map((row) => (
          <div key={row.range} className="flex items-center justify-between py-1 border-b border-bg-border/50 last:border-0">
            <span className={`text-xs font-mono ${row.color}`}>{row.range}</span>
            <span className="text-xs font-sarabun text-text-muted">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Prop Matcher ─────────────────────────────────────────
function PropMatcherCalc() {
  const [frameSize, setFrameSize] = useState(220);
  const [motorKV, setMotorKV] = useState(2306);
  const [batteryS, setBatteryS] = useState(4);

  // Simple prop suggestion logic
  const voltage = batteryS * 3.7;
  const rpm = motorKV * voltage;

  type PropRec = { size: string; pitch: string; notes: string };
  
  let suggestions: PropRec[] = [];

  if (frameSize <= 100) {
    suggestions = [
      { size: "2.5\"", pitch: "2-blade", notes: "เบา ประหยัดพลังงาน" },
      { size: "3\"",   pitch: "3-blade", notes: "thrust ดีขึ้น แต่หนักขึ้น" },
    ];
  } else if (frameSize <= 160) {
    suggestions = [
      { size: "3\"",   pitch: "3-blade", notes: "มาตรฐาน 3 inch" },
      { size: "3.5\"", pitch: "2-blade", notes: "flight time ดีกว่า" },
    ];
  } else if (frameSize <= 240) {
    if (batteryS <= 4) {
      suggestions = [
        { size: "5.1\"", pitch: "3-blade HQ5.1", notes: "freestyle ยอดนิยม" },
        { size: "5.1\"", pitch: "2-blade",        notes: "flight time ดีกว่า" },
        { size: "4.8\"", pitch: "3-blade",        notes: "lighter thrust" },
      ];
    } else {
      suggestions = [
        { size: "5.1\"", pitch: "3-blade",        notes: "6S มาตรฐาน" },
        { size: "4.5\"", pitch: "3-blade",        notes: "ลด current draw" },
      ];
    }
  } else {
    suggestions = [
      { size: "7\"",  pitch: "3-blade", notes: "7 inch มาตรฐาน" },
      { size: "6.5\"", pitch: "2-blade", notes: "efficiency สูงกว่า" },
    ];
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Frame Size" sublabel="มม." value={frameSize} min={65} max={360} step={5} unit="mm" onChange={setFrameSize} />
        <NumberInput label="Motor KV" sublabel="KV rating" value={motorKV} min={1000} max={4000} step={50} unit="KV" onChange={setMotorKV} />
      </div>
      <NumberInput label="Battery" sublabel="จำนวน Cell" value={batteryS} min={2} max={6} step={1} unit="S" onChange={setBatteryS} />

      <SectionLabel>Props แนะนำ</SectionLabel>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <ValueDisplay label="Est. RPM" value={Math.round(rpm / 1000) + "k"} color="green" />
        <ValueDisplay label="Voltage" value={voltage.toFixed(1)} unit="V" color="amber" />
      </div>

      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${i === 0 ? "border-green-DEFAULT/30 bg-green-muted/10" : "border-bg-border bg-bg-surface"}`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-lg border border-bg-border bg-bg-elevated flex items-center justify-center">
              <span className="text-xs font-mono text-text-muted">{i + 1}</span>
            </div>
            <div>
              <p className="text-sm font-orbitron font-semibold text-text">{s.size} {s.pitch}</p>
              <p className="text-[11px] font-sarabun text-text-muted mt-0.5">{s.notes}</p>
            </div>
            {i === 0 && <span className="ml-auto text-[10px] font-mono text-green-DEFAULT bg-green-muted px-2 py-0.5 rounded border border-green-DEFAULT/30">แนะนำ</span>}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-text-faint font-sarabun text-center">
        * คำแนะนำโดยประมาณ ขึ้นอยู่กับสไตล์การบินและ motor ที่ใช้จริง
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function CalculatorClient() {
  const [mode, setMode] = useState<CalcMode>("flighttime");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-blue-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">Calculator</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          คำนวณ flight time, thrust/weight ratio, และ prop matching
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-6 p-1 bg-bg-elevated rounded-xl border border-bg-border">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`flex-1 py-2.5 px-1 rounded-lg text-xs transition-all ${
              mode === m.value
                ? "bg-blue-muted border border-blue-DEFAULT/40 text-blue-DEFAULT font-semibold"
                : "text-text-muted hover:text-text font-mono"
            }`}
          >
            <span className="block font-orbitron text-[11px]">{m.label}</span>
            <span className="block font-sarabun text-[10px] mt-0.5 opacity-70">{m.labelTh}</span>
          </button>
        ))}
      </div>

      {/* Calculator content */}
      <div className="animate-fade-in">
        {mode === "flighttime" && <FlightTimeCalc />}
        {mode === "twr"        && <TWRCalc />}
        {mode === "props"      && <PropMatcherCalc />}
      </div>
    </div>
  );
}
