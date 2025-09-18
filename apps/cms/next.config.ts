import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "cms.apolloview.app",
      ],
    },
  },
};

export default nextConfig;
