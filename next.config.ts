import type { NextConfig } from 'next';
import withPWAInit from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';
const repoName = 'studio'; // Your GitHub repo name

const withPWA = withPWAInit({
  dest: 'public',
  disable: isDev, // Disable PWA in development
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  output: 'export', // Required for GitHub Pages (static export)
  basePath: isDev ? '' : `/${repoName}`, // GitHub Pages needs this
  assetPrefix: isDev ? '' : `/${repoName}`, // Also needed for static assets

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default withPWA(nextConfig);
