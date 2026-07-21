import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  // libsql uses dynamic requires that confuse webpack's static analysis;
  // keep these server-side only and out of the bundle.
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "libsql"],
  },
};

export default withNextIntl(nextConfig);
