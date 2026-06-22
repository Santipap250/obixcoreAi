import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0c10",
          surface: "#0f1318",
          elevated: "#141a22",
          border: "#1e2a38",
        },
        green: {
          DEFAULT: "#00e87a",
          dim: "#00a855",
          muted: "#003d22",
        },
        amber: {
          DEFAULT: "#ffbb00",
          dim: "#cc9500",
          muted: "#3d2d00",
        },
        blue: {
          DEFAULT: "#00aaff",
          dim: "#0077cc",
          muted: "#002a40",
        },
        cyan: {
          DEFAULT: "#00d8ff",
          dim: "#009dbf",
          muted: "#002d38",
        },
        purple: {
          DEFAULT: "#b060ff",
          dim: "#7a3fbf",
          muted: "#2a1040",
        },
        red: {
          DEFAULT: "#ff4060",
          dim: "#cc2040",
          muted: "#400010",
        },
        orange: {
          DEFAULT: "#ff8a3d",
          dim: "#cc6e2f",
          muted: "#3d1d00",
        },
        pink: {
          DEFAULT: "#ff5fb7",
          dim: "#cc4790",
          muted: "#3b1030",
        },
        text: {
          DEFAULT: "#e0e8f0",
          muted: "#6b7a90",
          faint: "#3a4555",
        },
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        sarabun: ["var(--font-sarabun)", "sans-serif"],
      },
      animation: {
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        scan: "scan 3s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "float-slower": "floatSlower 14s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,232,122,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(0,232,122,0.15)" },
        },
        scan: {
          "0%": { backgroundPosition: "0 -100%" },
          "100%": { backgroundPosition: "0 100%" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -14px, 0) scale(1.03)" },
        },
        floatSlower: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, 12px, 0) scale(0.98)" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,232,122,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,122,0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
