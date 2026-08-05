import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*/',

      },
    ];
  },
  allowedDevOrigins: ['192.168.1.41', 'localhost', '127.0.0.1'],
};

export default nextConfig;
