import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { META_CONFIG } from '@/lib/constants'
import { ToastProvider } from '@/hooks/useToast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: META_CONFIG.title,
  description: META_CONFIG.description,
  metadataBase: new URL(META_CONFIG.canonical),
  alternates: {
    canonical: META_CONFIG.canonical,
  },
  openGraph: {
    type: 'website',
    url: META_CONFIG.canonical,
    title: META_CONFIG.title,
    description: META_CONFIG.description,
    images: [{ url: META_CONFIG.ogImage }],
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: META_CONFIG.title,
    description: META_CONFIG.description,
    images: [META_CONFIG.ogImage],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${cormorantGaramond.variable}`}
    >
      <body className="min-h-screen bg-nova-black text-nova-white antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
