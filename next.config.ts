import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lampung.kemenag.go.id",
        pathname: "/storage/berita/**",
      },
    ],
  },
};

export default nextConfig;
