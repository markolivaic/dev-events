import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - dynamicIO is available in Next.js 16 but not yet in types
    dynamicIO: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // PostHog proxy rewrites to avoid ad blockers
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },

  // Required for PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
