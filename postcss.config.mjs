import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Pin the directory Tailwind resolves from.
 *
 * Tailwind's PostCSS plugin infers a base directory from the build tool, and
 * on this machine that inference lands on the *parent* of the project (a git
 * repository sits above it). Two things then break: `@import "tailwindcss"`
 * resolves against a directory with no node_modules — `Can't resolve
 * 'tailwindcss' in 'D:\Work'` — and automatic source detection tries to crawl
 * every sibling project, which exhausts the heap and kills the dev server
 * before a single stylesheet compiles.
 *
 * `next.config.mjs` pins the bundler root for the same reason; this is the
 * PostCSS half of it.
 *
 * Note: derive the directory with `path.dirname`, not `new URL('.', …)` — the
 * bundler that pre-processes this config reads the latter's '.' as a bare
 * module specifier and fails to load the config at all.
 */
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': { base: projectRoot },
  },
}

export default config
