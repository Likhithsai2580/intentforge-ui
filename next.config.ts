import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</.well-known/openapi.json>; rel="service-desc"',
              '</llms.txt>; rel="service-doc"',
              '</.well-known/ai-plugin.json>; rel="describedby"',
            ].join(", "),
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value: "Accept",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
