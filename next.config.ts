import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for deployment (Vercel, Netlify, Docker, etc.)
  output: "standalone",

  // Server external packages - prevents bundling of server-only packages
  serverExternalPackages: ['firebase-admin', 'grpc', '@grpc/grpc-js'],

  // Optimize images for better performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
  },

  // TypeScript configuration
  typescript: {
    // Allow ignoring build errors for development
    // Remove this in production for better type safety
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },

  // Disable React strict mode (can enable if all components are compatible)
  reactStrictMode: false,
};

export default nextConfig;
