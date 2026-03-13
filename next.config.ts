import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  cacheOnNavigation: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Image optimization for better LCP
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwhdvrhqohtayarwbtbg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Enable compression for smaller response sizes
  compress: true,
  
  // Performance optimizations
  poweredByHeader: false,

  // Silence Turbopack warning when @serwist/next injects webpack config
  turbopack: {},
  
  // Optimize package imports and configure server actions
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default withSerwist(nextConfig);
