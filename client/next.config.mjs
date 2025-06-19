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
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    staleTimes: {
      dynamic: 0, // default is 30
      static: 180,
    },
    serverActions: { bodySizeLimit: "20mb" },
  },
  async rewrites() {
    return [
      {
        source: "/api/ai/:path*",
        destination: "https://api.clynt.io/api/ai/:path*",
      },
    ];
  },
};

export default nextConfig;
