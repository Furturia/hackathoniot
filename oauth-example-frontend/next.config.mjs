/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output:"export",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
