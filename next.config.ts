import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma must not be bundled into Server Actions / RSC — avoids runtime DB errors on Vercel.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
