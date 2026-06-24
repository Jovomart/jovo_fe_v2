import HeroSection from "@/components/home/HeroSection";
import FlashSales from "@/components/layout/FlashSales";
import TopSellers from "@/components/layout/TopSellers";
import SponsoredProducts from "@/components/layout/SponsoredProducts";
import LimitedStockDeals from "@/components/layout/LimitedStockDeals";
import AccommodationDeals from "@/components/layout/AccommodationDeals";
import SuppliesSection from "@/components/layout/SuppliesSection";
import ServicesSection from "@/components/layout/Service";
import ShopCategories from "@/components/layout/ShopCategories";
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

      {/*
        ShopCategories fetches GET /api/v1/marketspace/shop-homepage and renders
        one carousel per category returned by the backend. Color-coding is
        automatic based on category name/slug.
      */}
      <ShopCategories limitPerCategory={4} />

      <SuppliesSection />
      <Footer />
    </div>
  );
};

export default Shop;