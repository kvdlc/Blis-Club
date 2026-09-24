import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/arqui",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
