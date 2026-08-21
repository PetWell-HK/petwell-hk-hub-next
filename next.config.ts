import type { NextConfig } from "next";

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
        source: "/restaurant",
        destination: "/restaurants",
        permanent: true,
      },
      {
        source: "/namtag",
        destination: "/nametag",
        permanent: true,
      },
      {
        source: "/fang-zou-shi-gou-pai",
        destination: "/nametag",
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
      {
        source: "/%E9%98%B2%E8%B5%B0%E5%A4%B1%E7%8B%97%E7%89%8C",
        destination: "/nametag",
        permanent: true,
      },
      {
        source: "/防走失狗牌",
        destination: "/nametag",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Fallback if a Lovable asset is missing from public/__l5e (run scripts/vendor-l5e-assets.mjs).
    // Price-review Lambda CORS only allows petwellhk.com + Vite :8080 — proxy for Next local/preview.
    const priceReviewApi =
      process.env.NEXT_PUBLIC_PRICE_REVIEW_API_URL ||
      process.env.VITE_PRICE_REVIEW_API_URL ||
      "https://kpslufqd7xryrrbi57srhr7zlm0wfezq.lambda-url.ap-southeast-1.on.aws";
    const priceReviewBase = priceReviewApi.replace(/\/$/, "");

    return [
      {
        source: "/__l5e/:path*",
        destination: "https://petwellhk.com/__l5e/:path*",
      },
      {
        source: "/api/price-review/:path*",
        destination: `${priceReviewBase}/:path*`,
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
