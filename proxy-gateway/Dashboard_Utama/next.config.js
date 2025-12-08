/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Allow HMR websocket from parent server
    allowedDevOrigins: ['http://localhost:3001'],
    // Configure Turbopack root to avoid lockfile detection issues
    turbopack: {
        root: __dirname,
    },
    // Fix WebSocket HMR issues
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
    // Disable automatic HMR to avoid conflicts
    experimental: {
        forceSwcTransforms: true,
    },
};

module.exports = nextConfig;
