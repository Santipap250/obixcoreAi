/** @type {import('next').NextConfig} */
const nextConfig = {
  // Intentional, not an oversight: this repo deploys as a static export
  // (see README — Cloudflare Pages / GitHub Pages targets), which has no
  // running Node server to perform on-demand image optimization. If a
  // future deploy target moves to Vercel/Node hosting, flip this to false
  // (or remove it) to re-enable next/image's resize + WebP/AVIF pipeline.
  images: {
    unoptimized: true,
  },
  // Surfaces unsafe lifecycle usage and double-invokes effects in dev to
  // catch side-effect bugs early — no effect on production output.
  reactStrictMode: true,
  // Gzip/Brotli response compression. No-op under static export hosting
  // (the CDN handles compression) but correct and free if this ever runs
  // behind `next start` instead.
  compress: true,
};

export default nextConfig;
