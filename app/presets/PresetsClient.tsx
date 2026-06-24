"use client";
import { useState } from "react";
import presetsData from "@/data/presets.json";
import type { Preset } from "@/types";
import Badge from "@/components/Badge";
import CodeBlock from "@/components/CodeBlock";
import ValueDisplay from "@/components/ValueDisplay";

const presets = presetsData as Preset[];

const FRAME_FILTERS = ["all", "2inch", "3inch", "5inch", "7inch"] as const;
const STYLE_FILTERS = ["all", "freestyle", "race", "cinematic", "beginner"] as const;
const DIFF_FILTERS  = ["all", "beginner", "intermediate", "advanced"] as const;

const STYLE_CONFIG: Record<string, { label: string; color: string }> = {
  race:      { label: "Race",      color: "text-red-DEFAULT    border-red-DEFAULT/40    bg-red-muted"    },
  freestyle: { label: "Freestyle", color: "text-purple-DEFAULT border-purple-DEFAULT/40 bg-purple-muted" },
  cinematic: { label: "Cinematic", color: "text-blue-DEFAULT   border-blue-DEFAULT/40   bg-blue-muted"   },
  beginner:  { label: "Beginner",  color: "text-green-DEFAULT  border-green-DEFAULT/40  bg-green-muted"  },
};

const DIFF_CONFIG: Record<string, { label: string; color: string }> = {
  beginner:     { label: "มือใหม่",   color: "text-green-DEFAULT"  },
  intermediate: { label: "กลาง",     color: "text-amber-DEFAULT"  },
  advanced:     { label: "เก่า",     color: "text-red-DEFAULT"    },
};

export default function PresetsClient() {
  const [frameFilter, setFrameFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [diffFilter,  setDiffFilter]  = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = presets.filter((p) => {
    if (frameFilter !== "all" && p.frameSize !== frameFilter) return false;
    if (styleFilter !== "all" && p.type     !== styleFilter) return false;
    if (diffFilter  !== "all" && p.difficulty !== diffFilter) return false;
    return true;
  });

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-5 bg-purple-DEFAULT rounded-full" />
          <h1 className="font-orbitron font-bold text-lg text-text tracking-wide">Preset Library</h1>
        </div>
        <p className="text-sm text-text-muted font-sarabun ml-3.5">
          ค่า PID + Rates + Filters ที่ผ่านการทดสอบ — กด copy แล้ววางใน Betaflight CLI
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-5 p-4 rounded-xl bg-bg-surface border border-bg-border">
        <div>
          <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">Frame Size</p>
          <div className="flex gap-1.5 flex-wrap">
            {FRAME_FILTERS.map((f) => (
              <button key={f} onClick={() => setFrameFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  frameFilter === f ? "border-purple-DEFAULT bg-purple-muted text-purple-DEFAULT" : "border-bg-border text-text-muted hover:bg-bg-elevated"
                }`}>
                {f === "all" ? "ทั้งหมด" : f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">Style</p>
          <div className="flex gap-1.5 flex-wrap">
            {STYLE_FILTERS.map((f) => (
              <button key={f} onClick={() => setStyleFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  styleFilter === f
                    ? f === "all" ? "border-purple-DEFAULT bg-purple-muted text-purple-DEFAULT"
                      : STYLE_CONFIG[f]?.color || "border-purple-DEFAULT bg-purple-muted text-purple-DEFAULT"
                    : "border-bg-border text-text-muted hover:bg-bg-elevated"
                }`}>
                {f === "all" ? "ทั้งหมด" : STYLE_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">ระดับ</p>
          <div className="flex gap-1.5 flex-wrap">
            {DIFF_FILTERS.map((f) => (
              <button key={f} onClick={() => setDiffFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  diffFilter === f ? "border-purple-DEFAULT bg-purple-muted text-purple-DEFAULT" : "border-bg-border text-text-muted hover:bg-bg-elevated"
                }`}>
                {f === "all" ? "ทั้งหมด" : DIFF_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-mono text-text-faint mb-3">
        แสดง <span className="text-purple-DEFAULT">{filtered.length}</span> preset จาก {presets.length}
      </p>

      {/* Preset cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-faint font-sarabun text-sm">ไม่พบ preset ที่ตรงกับเงื่อนไข</p>
          <button onClick={() => { setFrameFilter("all"); setStyleFilter("all"); setDiffFilter("all"); }}
            className="mt-3 text-xs font-mono text-purple-DEFAULT hover:underline">
            ล้าง filter ทั้งหมด
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((preset) => {
            const isOpen = expanded === preset.id;
            const styleConf = STYLE_CONFIG[preset.type];
            const diffConf  = DIFF_CONFIG[preset.difficulty];

            return (
              <div key={preset.id} className={`rounded-xl border overflow-hidden transition-all ${isOpen ? "border-purple-DEFAULT/40" : "border-bg-border"}`}>
                {/* Card header */}
                <button onClick={() => toggle(preset.id)} className="w-full text-left p-4 bg-bg-surface hover:bg-bg-elevated transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-orbitron font-semibold text-sm text-text">{preset.name}</p>
                      <p className="text-xs text-text-muted font-sarabun mt-1 leading-relaxed">{preset.description}</p>
                    </div>
                    <svg className={`w-4 h-4 text-text-faint flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  <div className="flex gap-1.5 mt-3 flex-wrap items-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${styleConf?.color}`}>
                      {styleConf?.label || preset.type}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-bg-border bg-bg-elevated text-text-muted">
                      {preset.frameSize}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-bg-border bg-bg-elevated text-text-muted">
                      {preset.batteryS}S
                    </span>
                    <span className={`text-[10px] font-mono ml-auto ${diffConf?.color}`}>
                      {diffConf?.label}
                    </span>
                    <span className="text-[10px] font-mono text-text-faint">BF {preset.bfVersion}</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-bg-border bg-bg-DEFAULT animate-fade-in">
                    <div className="p-4 space-y-5">

                      {/* PID quick view */}
                      <div>
                        <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">PID</p>
                        <div className="space-y-2">
                          {(["roll", "pitch", "yaw"] as const).map((axis) => {
                            const pid = preset.pid[axis];
                            const color = axis === "roll" ? "green" : axis === "pitch" ? "cyan" : "amber";
                            return (
                              <div key={axis} className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-text-faint uppercase w-10">{axis}</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {[
                                    { k: "P", v: pid.p },
                                    { k: "I", v: pid.i },
                                    { k: "D", v: pid.d },
                                    ...("f" in pid ? [{ k: "F", v: (pid as any).f }] : []),
                                  ].map((item) => (
                                    <span key={item.k} className={`text-[11px] font-mono bg-bg-elevated border border-bg-border rounded px-2 py-0.5 ${color === "green" ? "text-green-DEFAULT" : color === "cyan" ? "text-cyan-DEFAULT" : "text-amber-DEFAULT"}`}>
                                      {item.k}: {item.v}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filter summary */}
                      <div>
                        <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">Filters</p>
                        <div className="flex gap-2 flex-wrap text-[11px] font-mono">
                          <span className="px-2 py-1 rounded bg-bg-elevated border border-bg-border text-blue-DEFAULT">Gyro: {preset.filters.gyroLpf1Hz}Hz</span>
                          <span className="px-2 py-1 rounded bg-bg-elevated border border-bg-border text-cyan-DEFAULT">D-Term: {preset.filters.dTermLpf1Hz}Hz</span>
                          <span className="px-2 py-1 rounded bg-bg-elevated border border-bg-border text-purple-DEFAULT">Notch: {preset.filters.dynamicNotch}</span>
                          <span className={`px-2 py-1 rounded border ${preset.filters.rpmFilter ? "bg-green-muted border-green-DEFAULT/30 text-green-DEFAULT" : "bg-bg-elevated border-bg-border text-text-muted"}`}>
                            RPM: {preset.filters.rpmFilter ? "ON" : "OFF"}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {preset.notes && (
                        <div className="p-3 rounded-xl bg-blue-muted/20 border border-blue-DEFAULT/20">
                          <p className="text-[10px] font-mono text-blue-DEFAULT uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-xs font-sarabun text-text leading-relaxed">{preset.notes}</p>
                        </div>
                      )}

                      {/* CLI */}
                      <div>
                        <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
                          Betaflight CLI — Copy ทั้งหมดแล้ววาง
                        </p>
                        <CodeBlock lines={preset.cliCommands} title={`${preset.id}.txt`} maxHeight="280px" />
                      </div>

                      {/* Tags */}
                      <div className="flex gap-1 flex-wrap">
                        {preset.tags.map((tag) => (
                          <Badge key={tag} variant="outline">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-8 p-4 rounded-xl bg-bg-surface border border-bg-border text-center">
        <p className="text-xs font-sarabun text-text-muted">
          อยากส่ง preset ของคุณ? กำลังเปิดระบบ community submission ใน Phase 2
        </p>
      </div>
    </div>
  );
}
