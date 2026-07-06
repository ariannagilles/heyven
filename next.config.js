const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["@dicebear/converter"] = path.join(
      __dirname,
      "lib/dicebear-converter-stub.js",
    );
    return config;
  },
  async redirects() {
    return [
      { source: "/spaces", destination: "/spazi", permanent: true },
      { source: "/spaces/:slug", destination: "/spazi/:slug", permanent: true },
    ];
  },
};

module.exports = nextConfig;
