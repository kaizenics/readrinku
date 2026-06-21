import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploads.mangadex.org",
        pathname: "/covers/**",
      },
      {
        protocol: "https",
        hostname: "**.mangadex.network",
        pathname: "/data-saver/**",
      },
      {
        protocol: "https",
        hostname: "**.mangadex.network",
        pathname: "/data/**",
      },
      {
        protocol: "https",
        hostname: "mangadex.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
