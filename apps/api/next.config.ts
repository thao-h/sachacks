import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ddba/backend-core", "@ddba/contracts", "@ddba/db"],
};

export default nextConfig;
