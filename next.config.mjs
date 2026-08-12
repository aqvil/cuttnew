import { fileURLToPath } from 'node:url'

/*
 * Pin the project root.
 *
 * Next infers a "workspace root" by walking up from the working directory
 * looking for a lockfile. When that inference lands above the project, module
 * resolution starts from the wrong directory and the project's own
 * node_modules is never consulted — which showed up as
 * `Can't resolve 'tailwindcss' in '/var/www'` on the Ubuntu box, where the app
 * lives in /var/www/cuttnew and resolution was starting at /var/www.
 *
 * Anchoring both the bundler root and the file-tracing root to this file's
 * directory makes resolution independent of what sits above the project.
 */
const projectRoot = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,

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
