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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Link",
            value: '</.well-known/agent-skills/index.json>; rel="agent-skills", </.well-known/api-catalog>; rel="api-catalog", </.well-known/mcp/server-card.json>; rel="mcp-server-card"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
