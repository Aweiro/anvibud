/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
