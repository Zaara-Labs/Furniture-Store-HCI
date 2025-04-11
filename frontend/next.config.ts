import { join } from 'path';
import { copyFileSync, mkdirSync } from 'fs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
        port: "",
        pathname: "/v1/storage/buckets/**/files/**/view",
      },
    ],
  },

  // Configure webpack to handle Partytown
  webpack: (config, { isServer }) => {
    // Copy Partytown library files to public directory during build
    if (!isServer) {
      const partytownPath = join(
        process.cwd(),
        'node_modules',
        '@builder.io',
        'partytown',
        'lib'
      );

      const partytownDistPath = join(
        process.cwd(),
        'public',
        '~partytown'
      );

      try {
        // Create Partytown directory if it doesn't exist
        mkdirSync(partytownDistPath, { recursive: true });

        // Copy the Partytown files
        copyFileSync(
          join(partytownPath, 'partytown.js'),
          join(partytownDistPath, 'partytown.js')
        );

        copyFileSync(
          join(partytownPath, 'partytown-sw.js'),
          join(partytownDistPath, 'partytown-sw.js')
        );

        copyFileSync(
          join(partytownPath, 'partytown-worker.js'),
          join(partytownDistPath, 'partytown-worker.js')
        );

        copyFileSync(
          join(partytownPath, 'partytown-atomics.js'),
          join(partytownDistPath, 'partytown-atomics.js')
        );

        // For debug mode
        copyFileSync(
          join(partytownPath, 'debug', 'partytown-debug.js'),
          join(partytownDistPath, 'partytown-debug.js')
        );

        copyFileSync(
          join(partytownPath, 'debug', 'partytown-sandbox-sw.js'),
          join(partytownDistPath, 'partytown-sandbox-sw.js')
        );

        console.log('✅ Partytown files copied successfully');
      } catch (error) {
        console.error('❌ Error copying Partytown files:', error);
      }
    }

    return config;
  },
};

export default nextConfig;
