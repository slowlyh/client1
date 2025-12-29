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

  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {},

  // Webpack configuration to prevent Node.js modules in client bundle
  webpack: (config, { isServer }) => {
    // Prevent Node.js modules from being bundled in client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http2: false,
      };
    }

    return config;
  },
};

export default nextConfig;
