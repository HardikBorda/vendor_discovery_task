/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // These native/optional modules must not be bundled by webpack
      config.externals.push("better-sqlite3", "pg", "pg-native");
    }
    return config;
  },
};

export default nextConfig;
