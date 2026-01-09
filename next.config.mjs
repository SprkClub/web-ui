/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/placeholder/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { webpack, isServer }) => {
    // Ignore test-only dependencies
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(tap|tape|why-is-node-running)$/,
      })
    );

    // Ignore test files in node_modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore test files in node_modules
          if (
            context.includes("node_modules") &&
            /\.(test|spec)\.(js|mjs|ts|tsx)$/.test(resource)
          ) {
            return true;
          }
          // Ignore test directories
          if (context.includes("/test/") || context.includes("/tests/")) {
            return true;
          }
          return false;
        },
      })
    );

    // Set fallback for test dependencies
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      tap: false,
      tape: false,
      "why-is-node-running": false,
    };

    return config;
  },
};

export default nextConfig;
