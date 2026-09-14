import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg-boss", "playwright", "playwright-core", "pg"],
};

export default nextConfig;
