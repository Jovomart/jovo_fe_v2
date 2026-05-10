'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import PageLoader from '@/components/ui/PageLoader'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isSellerDashboard = pathname?.startsWith('/seller/dashboard')
  const isServiceDashboard = pathname?.startsWith('/services/dashboard')
  const isNewsSection = pathname?.startsWith('/news')
  const isHomePage = pathname === '/'

  const shouldHideNavbar = isSellerDashboard || isServiceDashboard || isNewsSection || isHomePage
  const shouldHideBottomNav = isSellerDashboard || isHomePage

  return (
    <>
      <ScrollToTop />
      {!shouldHideNavbar && <PageLoader />}
      {!shouldHideNavbar && <Navbar />}
      <main className="min-h-screen">
        {children}
      </main>
      {!shouldHideBottomNav && <BottomNav />}
    </>
  )
}