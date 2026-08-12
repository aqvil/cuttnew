/** @type {import('next').NextConfig} */
const nextConfig = {
  // `ignoreBuildErrors` was on, which meant type errors shipped silently.
  // The project now typechecks clean, so failures should break the build.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.100.39'],
  // `pg` is a Node driver; keep it out of any bundle that could reach the edge.
  serverExternalPackages: ['pg'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        // Redirects must never be cached by an intermediary — a cached
        // redirect would strand visitors on a stale destination.
        source: '/l/:code*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ]
  },
}

export default nextConfig
