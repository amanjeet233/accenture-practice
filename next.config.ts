import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
  async redirects() {
    return [
      {
        source: "/companies/accenture",
        destination: "/home/accenture",
        permanent: false,
      },
      {
        source: "/frontend",
        destination: "/home/accenture?tab=FRONTEND",
        permanent: false,
      },
      {
        source: "/questions",
        destination: "/home/accenture?tab=CODING",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
