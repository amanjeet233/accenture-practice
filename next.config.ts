import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@monaco-editor/react"],
  },
  compress: true,
  poweredByHeader: false,
  // Performance optimizations
  swcMinify: true,
  // Enable static generation
  output: "standalone",
  // Cache static assets
  generateEtags: true,
};

export default nextConfig;
