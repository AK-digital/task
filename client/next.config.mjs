/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 0, // default is 30
      static: 180,
    },
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
