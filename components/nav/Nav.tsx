"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, MOBILE_NAV_ITEMS, ACCENT_BG, ACCENT_GLOW } from "./nav-items";

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop nav: now data-driven from NAV_ITEMS (8 routes) instead of
          a hardcoded array. Wrapped in overflow-x-auto so it scales past
          the original 4-item set without wrapping awkwardly on smaller
          desktop widths (e.g. 1024px laptops). */}
      <nav
        aria-label="หลัก (Primary navigation)"
        className="hidden md:flex fixed top-4 left-1/2 z-50 w-[min(1180px,calc(100%-1.5rem))] -translate-x-1/2 items-center justify-between rounded-2xl hud-card px-4 py-3"
      >
        <Link href="/dashboard" className="group flex items-center gap-3 shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-green-DEFAULT/60 bg-green-muted/40 transition-all group-hover:border-green-DEFAULT group-hover:shadow-[0_0_24px_rgba(0,232,122,0.22)]">
            <div className="absolute inset-0 rounded-xl bg-green-DEFAULT/10 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative text-xs font-orbitron font-black text-green-DEFAULT">OX</span>
          </div>
          <div className="hidden lg:block">
            <span className="block font-orbitron text-base font-bold tracking-[0.35em] text-text transition-colors group-hover:text-green-DEFAULT">
              OBIXCORE
            </span>
            <span className="block text-[10px] font-mono tracking-[0.28em] text-text-faint">
              AI FPV COPILOT
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-bg-border/80 bg-bg-surface/70 p-1 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-bg-elevated text-text shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
                    : "text-text-muted hover:bg-bg-elevated/80 hover:text-text"
                }`}
              >
                <span
                  className={`absolute inset-0 rounded-full opacity-0 transition-opacity ${
                    active ? "opacity-100" : "group-hover:opacity-100"
                  } ${ACCENT_BG[item.accent]}`}
                />
                <span className={`relative transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`}>
                  {item.icon(active)}
                </span>
                <span className="relative font-mono text-[13px] tracking-wide whitespace-nowrap">{item.label}</span>
                {active && (
                  <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hud-chip hidden lg:flex items-center gap-2 px-3 py-2 text-[11px] font-mono tracking-[0.22em] text-text-faint shrink-0">
          <span className="h-2 w-2 rounded-full bg-green-DEFAULT shadow-[0_0_16px_rgba(0,232,122,0.55)] animate-pulse-green" />
          v0.2.0
        </div>
      </nav>

      {/* Mobile nav: curated to MOBILE_NAV_LIMIT (5) items via
          MOBILE_NAV_ITEMS so the bottom bar stays usable on a phone even
          though the full route set has grown to 8. */}
      <nav
        aria-label="หลัก มือถือ (Primary navigation, mobile)"
        className="md:hidden fixed bottom-3 left-3 right-3 z-50 hud-card px-2 py-2"
      >
        <div className="flex items-stretch justify-around gap-1">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] transition-all ${
                  active ? "text-text" : "text-text-muted"
                }`}
              >
                <div className="relative">
                  <span
                    className={`absolute inset-0 rounded-full blur-xl transition-opacity ${
                      active ? "opacity-100 animate-glow-pulse" : "opacity-0"
                    } ${ACCENT_GLOW[item.accent]}`}
                  />
                  {item.icon(active)}
                </div>
                <span className="font-sarabun">{item.labelTh}</span>
                {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full color-strip" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
