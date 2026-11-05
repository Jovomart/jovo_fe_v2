import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://jovo.ng'),
  title: {
    default: "JOVO - Nigeria's #1 Campus Marketplace",
    template: '%s | JOVO',
  },
  description:
    "JOVO is Nigeria's premier campus e-commerce marketplace. Shop phones, electronics, fashion, groceries, services and more. Fast campus delivery, verified sellers, exclusive flash sales.",
  keywords: ['jovo', 'campus marketplace', 'nigeria ecommerce', 'student market'],
  authors: [{ name: 'JOVO Technologies' }],
  openGraph: {
    type: 'website',
    url: 'https://jovo.ng/',
    title: "JOVO - Nigeria's #1 Campus Marketplace",
    description: 'Shop phones, electronics, fashion & more. Fast campus delivery. Flash sales daily.',
    siteName: 'JOVO',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jovong',
    title: "JOVO - Nigeria's #1 Campus Marketplace",
  },
  themeColor: '#FBEFE3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
