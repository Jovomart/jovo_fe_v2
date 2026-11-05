import TickerBar from '@/components/ui/TickerBar'
import Footer from '@/components/layout/Footer'
import LandingHero from '@/components/landing/Hero'
import TrustStrip from '@/components/landing/TrustStrip'
import HowItWorks from '@/components/landing/HowItWorks'
import FlashDeals from '@/components/landing/FlashDeals'
import FeaturedProducts from '@/components/landing/FeaturedProducts'
import CategoriesRail from '@/components/landing/CategoriesRail'
import SellerBanner from '@/components/landing/SellerBanner'
import Testimonials from '@/components/landing/Testimonials'
import ServicesGrid from '@/components/landing/ServicesGrid'
import AppPromo from '@/components/landing/AppPromo'

export default function Home() {
  return (
    <>
      <TickerBar />
      <a
        href="#main-content"
        className="absolute -top-28 left-4 z-[9999] rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-[top] focus:top-4"
      >
        Skip to main content
      </a>
      <main id="main-content">
        <LandingHero />
        <TrustStrip />
        <HowItWorks />
        <FlashDeals />
        <FeaturedProducts />
        <CategoriesRail />
        <SellerBanner />
        <Testimonials />
        <ServicesGrid />
        <AppPromo />
      </main>
      <Footer />
    </>
  )
}
