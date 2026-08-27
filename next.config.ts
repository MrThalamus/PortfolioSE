import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      // Vercel Blob storage (used for photo uploads from /admin/photography)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Placeholder seed images — safe to remove once real photos are uploaded
      { protocol: "https", hostname: "images.unsplash.com" },
      // Broad fallback so admin-entered image URLs from any host still render.
      // This is a single-admin personal site — the trade-off favors flexibility
      // over restricting the optimizer to a fixed host allowlist.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
