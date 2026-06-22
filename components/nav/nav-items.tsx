// components/nav/nav-items.tsx
// Single source of truth for primary navigation. Both the desktop pill-nav
// and the mobile bottom-bar in Nav.tsx render from this list, instead of
// each maintaining its own hardcoded array (which is what the original
// Nav.tsx did, and what made adding new routes error-prone). Sitemap.ts and
// any future breadcrumb component can also import from here.
//
// `mobilePriority` controls which items appear in the mobile bottom-bar.
// Mobile screens can't fit 8+ icons in one row, so only items with
// mobilePriority <= MOBILE_NAV_LIMIT show there; everything else is still
// reachable via the desktop nav and the Dashboard's module grid.

import type { ReactNode } from "react";

export type NavAccent = "green" | "amber" | "blue" | "purple" | "pink" | "cyan";

export interface NavItem {
  href: string;
  label: string;
  labelTh: string;
  accent: NavAccent;
  /** Lower = higher priority for the mobile bottom bar (1 = always shown) */
  mobilePriority: number;
  icon: (active: boolean) => ReactNode;
}

const iconProps = (active: boolean) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: active ? 2 : 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    labelTh: "หน้าหลัก",
    accent: "green",
    mobilePriority: 1,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/profiles",
    label: "Profiles",
    labelTh: "โดรนของฉัน",
    accent: "cyan",
    mobilePriority: 2,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z" />
      </svg>
    ),
  },
  {
    href: "/doctor",
    label: "Doctor",
    labelTh: "FPV Doctor",
    accent: "pink",
    mobilePriority: 3,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 8v6M9 11h6" />
      </svg>
    ),
  },
  {
    href: "/blackbox",
    label: "Blackbox",
    labelTh: "Blackbox",
    accent: "purple",
    mobilePriority: 4,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    href: "/wizard",
    label: "Wizard",
    labelTh: "Wizard",
    accent: "green",
    mobilePriority: 5,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    href: "/problems",
    label: "Problems",
    labelTh: "แก้ปัญหา",
    accent: "amber",
    mobilePriority: 6,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: "/calculator",
    label: "Calc",
    labelTh: "คำนวณ",
    accent: "blue",
    mobilePriority: 7,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="12" y2="14" />
        <line x1="8" y1="18" x2="10" y2="18" />
      </svg>
    ),
  },
  {
    href: "/presets",
    label: "Presets",
    labelTh: "Preset",
    accent: "purple",
    mobilePriority: 8,
    icon: (active) => (
      <svg {...iconProps(active)}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

/** Max items shown in the mobile bottom bar before it gets cramped. */
export const MOBILE_NAV_LIMIT = 5;

export const MOBILE_NAV_ITEMS = [...NAV_ITEMS]
  .sort((a, b) => a.mobilePriority - b.mobilePriority)
  .slice(0, MOBILE_NAV_LIMIT);

export const ACCENT_BG: Record<NavAccent, string> = {
  green: "bg-green-muted/25",
  amber: "bg-amber-muted/25",
  blue: "bg-blue-muted/25",
  purple: "bg-purple-muted/25",
  pink: "bg-pink-muted/25",
  cyan: "bg-cyan-muted/25",
};

export const ACCENT_GLOW: Record<NavAccent, string> = {
  green: "bg-green-DEFAULT/15",
  amber: "bg-amber-DEFAULT/15",
  blue: "bg-blue-DEFAULT/15",
  purple: "bg-purple-DEFAULT/15",
  pink: "bg-pink-DEFAULT/15",
  cyan: "bg-cyan-DEFAULT/15",
};
