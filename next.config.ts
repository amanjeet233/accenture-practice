import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@monaco-editor/react"],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
