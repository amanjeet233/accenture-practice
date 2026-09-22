import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@monaco-editor/react"],
  },
  compress: true,
  poweredByHeader: false,
  // Performance optimizations
  // Enable static generation
  output: "standalone",
  // Cache static assets
  generateEtags: true,
};

export default nextConfig;
