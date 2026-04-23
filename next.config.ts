import type { NextConfig } from "next";

// Strict CSP for the public marketing site. No Sanity origins here.
const siteCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Relaxed CSP for the embedded Sanity Studio at /studio.
// - 'unsafe-eval' is required by Studio's client-side schema compiler.
// - *.sanity.io / *.api.sanity.io / *.apicdn.sanity.io cover the auth,
//   listener, CDN, and API endpoints.
// - core.sanity-cdn.com hosts Studio runtime assets.
// - wss://*.api.sanity.io is the realtime listener socket.
const studioCsp = [
  "default-src 'self' https://*.sanity.io https://core.sanity-cdn.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity-cdn.com https://*.sanity.io",
  "style-src 'self' 'unsafe-inline' https://*.sanity.io",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io",
  "font-src 'self' data: https://*.sanity.io",
  "connect-src 'self' https://*.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io wss://*.api.sanity.io https://core.sanity-cdn.com",
  "frame-src 'self' https://core.sanity-cdn.com https://*.sanity.io",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Global security headers applied to every route.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        // Strict framing + CSP for everything EXCEPT /studio.
        source: "/((?!studio).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: siteCsp },
        ],
      },
      {
        // Studio needs same-origin iframes and a permissive CSP.
        source: "/studio/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: studioCsp },
        ],
      },
    ];
  },
};

export default nextConfig;
