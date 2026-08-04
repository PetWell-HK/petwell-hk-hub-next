import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "petwellhk.com" },
      { protocol: "https", hostname: "**.petwellhk.com" },
    ],
  },
  turbopack: {
    resolveAlias: {
      "react-router-dom": "./src/shims/react-router-dom.tsx",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-router-dom": path.resolve(__dirname, "src/shims/react-router-dom.tsx"),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/chong-wu-you-shan-can-ting",
        destination: "/restaurants",
        permanent: true,
      },
      {
        source: "/dai-gou-shi-fan-hong-kong",
        destination: "/restaurants",
        permanent: true,
      },
      {
        source: "/merchant",
        destination: "/other-services",
        permanent: true,
      },
      {
        source: "/blog/pet-friendly-shopping-malls-hk-2025",
        destination: "/rainy-day-pet-friendly-indoor-hong-kong",
        permanent: true,
      },
      {
        source: "/food-score",
        destination: "/nutrition",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
