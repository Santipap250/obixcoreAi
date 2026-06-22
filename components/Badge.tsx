// components/Badge.tsx
// Re-export shim. The implementation moved to components/ui/Badge.tsx as
// part of the components/ui/ reorganization (see components/ui/index.ts).
// This file exists purely so existing imports like
// `import Badge from "@/components/Badge"` keep working unchanged across
// the original wizard/problems/calculator/presets pages. New code should
// import from "@/components/ui" instead.
export { default } from "./ui/Badge";
