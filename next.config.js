/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ["fi", "en", "se"],
    defaultLocale: "fi",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      }
    ]
  }
};

module.exports = nextConfig;
