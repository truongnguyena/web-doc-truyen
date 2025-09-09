import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["vi"],
    defaultLocale: "vi",
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { 
        loader: 'worker-loader',
        options: { 
          filename: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      },
    });

    // Fix cho worker-loader với webpack 5
    config.output.publicPath = '/_next/';

    return config;
  },
};

export default nextConfig;
