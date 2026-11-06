import type { Metadata, Viewport } from "next";
import { Playfair_Display, Sora, JetBrains_Mono } from 'next/font/google'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Suspense } from "react";

config.autoAddCss = false

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://jovomart.store'),
  title: {
    default: "JOVO — Nigeria's #1 Campus Marketplace | Buy, Sell & Discover",
    template: "%s | JOVO",
  },
  description:
    "JOVO is Nigeria's premier campus e-commerce marketplace. Shop phones, electronics, fashion, groceries, services and more. Fast campus delivery, verified sellers, exclusive flash sales.",
  keywords: ['jovo', 'campus marketplace', 'nigeria ecommerce', 'student market'],
  authors: [{ name: 'JOVO Technologies' }],
  icons: {
    icon: '/images/Jovo_official_logo.png',
    apple: '/images/Jovo_official_logo.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://jovomart.store/',
    title: "JOVO - Nigeria's #1 Campus Marketplace",
    description: 'Shop phones, electronics, fashion & more. Fast campus delivery. Flash sales daily.',
    siteName: 'JOVO',
    locale: 'en_NG',
  },
  twitter: {
    card: "summary_large_image",
    site: "@jovong",
    title: "JOVO — Nigeria's #1 Campus Marketplace",
    description: "Shop phones, electronics, fashion & more. Fast campus delivery. Flash sales daily.",
  },
  alternates: { canonical: 'https://jovomart.store/' },
};

export const viewport: Viewport = {
  themeColor: "#B42225",
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#B42225] rounded-full animate-spin" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sora.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://jovomart.store/#organization',
                  name: 'JOVO',
                  url: 'https://jovomart.store',
                  logo: 'https://jovomart.store/images/Jovo_official_logo.png',
                  description: "Nigeria's premier campus e-commerce marketplace",
                  sameAs: [
                    'https://twitter.com/jovong',
                    'https://instagram.com/jovong',
                    'https://facebook.com/jovong',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://jovomart.store/#website',
                  url: 'https://jovomart.store',
                  name: 'JOVO',
                  publisher: { '@id': 'https://jovomart.store/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://jovomart.store/shop?search={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'WebPage',
                  '@id': 'https://jovomart.store/#webpage',
                  url: 'https://jovomart.store',
                  name: "JOVO — Nigeria's #1 Campus Marketplace",
                  isPartOf: { '@id': 'https://jovomart.store/#website' },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-body bg-white text-gray-900 overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}