import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure .env.local is loaded from this project, not a parent workspace
  turbopack: { root: path.resolve(process.cwd()) },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "sprout-tech.firebasestorage.app", pathname: "/**" },
    ],
  },
};

export default nextConfig;
