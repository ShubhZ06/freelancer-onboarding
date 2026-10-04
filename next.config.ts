import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use native bindings or Node.js-only APIs that cannot be
  // bundled by the Edge runtime. Marking them external tells Next.js / Vercel
  // to require() them at runtime from node_modules instead of inlining them.
  serverExternalPackages: ["mongodb", "bcryptjs", "twilio"],
};

export default nextConfig;
