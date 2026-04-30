'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import PageLoader from '@/components/ui/PageLoader'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide the main site Navbar and BottomNav on all seller pages.
  // The seller dashboard has its own internal navbar and sidebar.
  const isSellerPage = pathname?.startsWith('/seller')

  return (
    <>
      <ScrollToTop />
      <PageLoader />
      {!isSellerPage && <Navbar />}
      <main className="min-h-screen bg-white">
        {children}
      </main>
      {!isSellerPage && <BottomNav />}
    </>
  )
}