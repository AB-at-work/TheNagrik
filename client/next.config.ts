import type { NextConfig } from 'next';

const r2Host = (() => {
  try {
    return new URL(process.env.R2_PUBLIC_URL ?? 'https://media.thenagrik.org').hostname;
  } catch {
    return 'media.thenagrik.org';
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@thenagrik/shared'],
  poweredByHeader: false,
  // Native/Node-only packages used by the in-process API route handlers. Keeping
  // them external prevents Next from trying to bundle their binaries.
  serverExternalPackages: ['sharp', 'pg', '@aws-sdk/client-s3', 'pino', 'pino-pretty'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: r2Host },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https:;" },
        ],
      },
    ];
  },
};

export default nextConfig;
