import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  allowedDevOrigins: ["192.168.1.44"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hlajzegnsxuukdsxhkop.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
