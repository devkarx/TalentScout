/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongoose", "pdf-parse", "@pinecone-database/pinecone"],
  turbopack: {},

  webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      })
    }
    return config;
  },
};

export default nextConfig;