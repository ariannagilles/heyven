/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/spaces", destination: "/spazi", permanent: true },
      { source: "/spaces/:slug", destination: "/spazi/:slug", permanent: true },
    ];
  },
};

module.exports = nextConfig;
