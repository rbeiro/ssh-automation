/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return (config.resolve.fallback = {
      sshcrypto: false,
    });
  },
};

module.exports = nextConfig;
