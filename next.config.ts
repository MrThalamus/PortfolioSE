import type { NextConfig } from "next";
import { IMAGE_HOST_PATTERNS } from "./lib/imageHosts";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: IMAGE_HOST_PATTERNS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
