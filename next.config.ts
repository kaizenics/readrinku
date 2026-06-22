import type { NextConfig } from "next";

import { getSourceImageRemotePatterns } from "./lib/data/sources/source-config";

const nextConfig: NextConfig = {
  images: {
    domains: ["readermc.org", "cdn.demoniclibs.com"],
    remotePatterns: getSourceImageRemotePatterns(),
  },
};

export default nextConfig;
