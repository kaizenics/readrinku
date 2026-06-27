import type { NextConfig } from "next";

import { getSourceImageRemotePatterns } from "./lib/data/sources/source-config";

const nextConfig: NextConfig = {
  // Transpile the workspace package, which ships raw TypeScript source.
  transpilePackages: ["@rinku/core"],
  images: {
    remotePatterns: getSourceImageRemotePatterns(),
  },
};

export default nextConfig;
