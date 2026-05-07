'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import PageLoader from '@/components/ui/PageLoader'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if on seller dashboard
  const isSellerDashboard = pathname?.startsWith('/seller/dashboard')
  
  // Check if on service provider dashboard
  const isServiceDashboard = pathname?.startsWith('/services/dashboard')
  
  // Check if on news section
  const isNewsSection = pathname?.startsWith('/news')

  // Hide navbar on seller dashboard, service dashboard, AND news section
  const shouldHideNavbar = isSellerDashboard || isServiceDashboard || isNewsSection
  
  // Hide bottom nav ONLY on seller dashboard
  const shouldHideBottomNav = isSellerDashboard

  return (
    <>
      <ScrollToTop />
      <PageLoader />
      {!shouldHideNavbar && <Navbar />}
      <main className="min-h-screen bg-white">
        {children}
      </main>
      {!shouldHideBottomNav && <BottomNav />}
    </>
  )
}