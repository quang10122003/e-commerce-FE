import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn2.cellphones.com.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cellphones.com.vn",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
