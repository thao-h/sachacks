import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ddba/shared", "@ddba/db"],
};

export default nextConfig;
