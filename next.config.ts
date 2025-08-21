import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/wallet",
        destination: "/",
        permanent: true,
      }
    ]
  },
};

export default nextConfig;
