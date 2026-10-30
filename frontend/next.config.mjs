/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    const defaultBackend = process.env.VERCEL
      ? 'https://home-tutor-finder-ai.onrender.com/api'
      : 'http://localhost:8080/api';
    const backend = (process.env.BACKEND_API_URL || defaultBackend).replace(/\/+$/, '');
    return [{ source: '/api/:path*', destination: `${backend}/:path*` }];
  },
};
export default nextConfig;
