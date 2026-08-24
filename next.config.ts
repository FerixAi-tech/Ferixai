import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ferixai.com" }],
        destination: "https://www.ferixai.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
