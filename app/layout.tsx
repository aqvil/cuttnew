import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Display face: carries every headline and control label. Chosen for its
// condensed, high-contrast grotesk character — the poster weight a system
// sans can't reach — self-hosted rather than left to a platform default.
const display = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Cuttly — Short links, QR codes and click analytics',
    template: '%s · Cuttly',
  },
  description:
    'Shorten links, generate QR codes and see exactly who clicks — with clean, honest analytics.',
  openGraph: {
    type: 'website',
    siteName: 'Cuttly',
    title: 'Cuttly — Short links, QR codes and click analytics',
    description:
      'Shorten links, generate QR codes and see exactly who clicks — with clean, honest analytics.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches the light/dark canvas so mobile browser chrome doesn't flash.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3ecdd' },
    { media: '(prefers-color-scheme: dark)', color: '#171310' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/*
            Mounted once at the root. It was previously absent entirely, so
            every toast.success()/toast.error() in the app rendered nothing —
            copy confirmations, save confirmations and error messages all
            silently did nothing.
          */}
          <Toaster position="bottom-right" closeButton richColors={false} />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
