import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/skills/robots.txt',
        destination: '/robots.txt',
        permanent: true,
      },
      {
        source: '/skills/llms.txt',
        destination: '/llms.txt',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
