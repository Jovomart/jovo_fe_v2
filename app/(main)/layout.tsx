import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import PageLoader from '@/components/ui/PageLoader'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <PageLoader />
      <Navbar />
      <main className="min-h-screen bg-white">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
