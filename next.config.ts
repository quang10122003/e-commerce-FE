import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // cho phép mọi domain
    ],
    formats: ['image/avif', 'image/webp'], // format tối ưu nhất
    minimumCacheTTL: 60 * 60 * 24 * 7,    // cache 7 ngày
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256],     // thumbnail sizes
  },
}

export default nextConfig
