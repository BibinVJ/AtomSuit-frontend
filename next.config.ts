import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Note: static export disabled to support API routes
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Image optimization settings
  images: {
    unoptimized: true,
  },
  
  // Allow tenant subdomains in development
  allowedDevOrigins: [
    '*.atomsuit.test',
    'atomsuit.test',
    'company.atomsuit.test', // Specific tenant for testing
  ],
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
