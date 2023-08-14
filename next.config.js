/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      sshcrypto: false,
    };

    return config;
  },
};

module.exports = nextConfig;
