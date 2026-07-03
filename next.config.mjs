/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: []
  },
  poweredByHeader: false
};

export default nextConfig;
