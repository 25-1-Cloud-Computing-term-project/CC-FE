import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://172.21.20.140:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
