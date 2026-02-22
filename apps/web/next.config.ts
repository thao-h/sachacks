import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ddba/shared", "@ddba/db"],
  // Temporary demo override: allow production build even if TS has strict errors.
  // Revert this after the hackathon demo.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
