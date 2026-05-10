'use client'
import HeroSection from "@/components/home/HeroSection";
import FlashSales from "@/components/layout/FlashSales";
import TopSellers from "@/components/layout/TopSellers";
import SponsoredProducts from "@/components/layout/SponsoredProducts";
import LimitedStockDeals from "@/components/layout/LimitedStockDeals";
import AccommodationDeals from "@/components/layout/AccommodationDeals";
import AppliancesDeals from "@/components/layout/AppliancesDeal";
import Tv_Audio_Deals from "@/components/layout/TvAudioDeals";
import SuppliesSection from "@/components/layout/SuppliesSection";
import PhoneDeals from "@/components/layout/PhoneDeals";
import BeautyAndCosmeticsDeals from "@/components/layout/BeautyDeals";
import FashionDeals from "@/components/layout/FashionDeals";
import GamingDeals from "@/components/layout/GamingDeals";
import HomeDeals from "@/components/layout/HomeDeals";
import ElectronicDeals from "@/components/layout/ElectronicDeals";
import DrinkDeals from "@/components/layout/DrinkDeals";
import ComputingDeals from "@/components/layout/ComputingDeals";
import ServicesSection from "@/components/layout/Service";
import Footer from "@/components/layout/Footer";

const Shop = () => {
  return (
    <div className="bg-[#F5F6F7]">
      <HeroSection />
      <FlashSales />
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
      <Footer />
    </div>
  );
};

export default Shop;