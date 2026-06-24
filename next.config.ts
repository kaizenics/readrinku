import type { NextConfig } from "next";

import { getSourceImageRemotePatterns } from "./lib/data/sources/source-config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSourceImageRemotePatterns(),
  },
};

export default nextConfig;
