/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

// import { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "example.com",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//   },
//   // Add other Next.js config options if needed
// };

// export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     domains: [
//       "discoverholidaysbd.com",
//       "ozvxzsjtzdrrwejjiomf.supabase.co",
//       "i.pravatar.cc",
//       "example.com",
//       "res.cloudinary.com",
//       "img.examplecdn.com",
//     ],
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   // Add other Next.js config options if needed
// };

// export default nextConfig;
