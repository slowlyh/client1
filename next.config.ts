import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for deployment (Vercel, Netlify, Docker, etc.)
  output: "standalone",

  // Optimize images for better performance
  images: {
    domains: ['firebasestorage.googleapis.com'],
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

  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during builds for faster deployments
    // Consider enabling in production for code quality
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },

  // Webpack configuration (for advanced use cases)
  webpack: (config, { isServer }) => {
    // Handle Firebase Admin SDK in server-side only
    if (!isServer) {
      // Exclude Firebase Admin from client bundle
      config.externals = {
        ...(config.externals || {}),
        'firebase-admin': 'firebase-admin',
      };
    }

    return config;
  },
};

export default nextConfig;
