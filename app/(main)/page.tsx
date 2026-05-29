"use client";
import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";
import BackToTop from "@/components/ui/BackToTop";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TrustSection from "@/components/sections/TrustSection";
import FlashSalesSection from "@/components/sections/FlashSalesSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import FeaturedProductsSection from "@/components/sections/FeaturedProductsSection";
import SellerBanner from "@/components/sections/SellerBanner";
import ServicesSection from "@/components/sections/ServicesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import AppSection from "@/components/sections/AppSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

export default function Home() {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/shop";
    }
  }, [loading, user]);

  if (!loading && user) return null;

  return (
    <>
      <PageLoader />
      <AnnouncementBar />
      <Header />
      <main id="main-content">
        <HeroSection />
        <TrustSection />
        <FlashSalesSection />
        <CategoriesSection />
        <FeaturedProductsSection />
        <SellerBanner />
        <ServicesSection />
        <TestimonialsSection />
        <AppSection />
        <NewsletterSection />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}