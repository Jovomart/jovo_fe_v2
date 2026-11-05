import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import TickerBar from '@/components/ui/TickerBar'
import Footer from '@/components/layout/Footer'
import FlashSales from '@/components/layout/FlashSales'
import TopSellers from '@/components/layout/TopSellers'
import SponsoredProducts from '@/components/layout/SponsoredProducts'
import LimitedStockDeals from '@/components/layout/LimitedStockDeals'
import AccommodationDeals from '@/components/layout/AccommodationDeals'
import AppliancesDeals from '@/components/layout/AppliancesDeal'
import Tv_Audio_Deals from '@/components/layout/TvAudioDeals'
import SuppliesSection from '@/components/layout/SuppliesSection'
import PhoneDeals from '@/components/layout/PhoneDeals'
import BeautyAndCosmeticsDeals from '@/components/layout/BeautyDeals'
import FashionDeals from '@/components/layout/FashionDeals'
import GamingDeals from '@/components/layout/GamingDeals'
import HomeDeals from '@/components/layout/HomeDeals'
import ElectronicDeals from '@/components/layout/ElectronicDeals'
import DrinkDeals from '@/components/layout/DrinkDeals'
import ComputingDeals from '@/components/layout/ComputingDeals'
import ServicesSection from '@/components/layout/Service'

export const metadata = {
  title: 'All deals',
  description:
    'Every JOVO deal rail in one place - flash sales, phones, computing, fashion, beauty, groceries and campus services.',
}

export default function DealsPage() {
  return (
    <>
      <TickerBar />
      <main className="bg-cream pb-4">
        {/* Page head */}
        <section className="relative overflow-hidden bg-cream pt-10 sm:pt-14">
          <div className="paper pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-24 -top-16 h-[300px] w-[300px] rounded-full bg-sky/40 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[10.5px] font-medium text-ink/60 ring-1 ring-ink/[.05] backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint-deep" aria-hidden="true" />
              Everything on sale right now
            </span>
            <h1 className="mt-4 text-balance font-display text-[34px] font-medium leading-[1.04] tracking-[-0.035em] text-ink sm:text-[48px]">
              All the deals,
              <br className="hidden sm:block" /> one page.
            </h1>
            <p className="mt-3 max-w-[480px] text-[13px] leading-[1.75] text-ink/55">
              Flash sales, category rails and sponsored picks - refreshed as sellers update their
              stores.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[12.5px] font-semibold text-white shadow-pill transition-all duration-200 hover:bg-ink/85 active:scale-[.98]"
              >
                Browse the shop
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/flash-sales"
                className="inline-flex items-center rounded-full bg-sky px-5 py-3 text-[12.5px] font-semibold text-ink ring-1 ring-ink/[.06] transition-colors duration-200 hover:bg-sky-deep"
              >
                Flash sales
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1240px] px-4 sm:px-0">
          <FlashSales />
        </div>

        <AccommodationDeals />
        <ServicesSection />
        <TopSellers />
        <SponsoredProducts />
        <LimitedStockDeals />
        <AppliancesDeals />
        <Tv_Audio_Deals />
        <SuppliesSection />
        <PhoneDeals />
        <BeautyAndCosmeticsDeals />
        <FashionDeals />
        <GamingDeals />
        <HomeDeals />
        <ElectronicDeals />
        <DrinkDeals />
        <ComputingDeals />
      </main>
      <Footer />
    </>
  )
}
