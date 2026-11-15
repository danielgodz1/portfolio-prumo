/** @type {import('next').NextConfig} */
const canonicalHost = (process.env.NEXT_PUBLIC_CANONICAL_HOST || "").trim();

export default {
  reactStrictMode: true,
  transpilePackages: ["three"],
  async redirects() {
    if (!canonicalHost || canonicalHost.includes("localhost")) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "portfolio-prumo.vercel.app" }],
        destination: `https://${canonicalHost}/:path*`,
        permanent: true,
      },
    ];
  },
};
