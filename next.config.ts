import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 is the default; 90 keeps the text in project screenshots crisp.
    qualities: [75, 90],
  },
};

export default nextConfig;
