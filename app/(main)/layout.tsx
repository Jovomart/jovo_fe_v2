"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import PageLoader from "@/components/ui/PageLoader";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isSellerDashboard = pathname?.startsWith("/seller/dashboard");
  const isSellerOrders = pathname?.startsWith("/seller/orders");
  const isSellerWallet = pathname?.startsWith("/seller/wallet");
  const isSellerPromote = pathname?.startsWith("/seller/promote");
  const isSellerSettings = pathname?.startsWith("/seller/settings");
  const isSellerProducts = pathname?.startsWith("/seller/products");
  const isSellerAddProduct = pathname?.startsWith("/seller/add-product");
  const isSellerEditProduct = pathname?.startsWith("/seller/edit-product");
  const isSellerProfile = pathname?.startsWith("/seller/profile");
  const isSellerDeliveries = pathname?.startsWith("/seller/deliveries");
  const isServiceDashboard = pathname?.startsWith("/services/dashboard");
  const isSellerAnalytics = pathname?.startsWith("/seller/analytics");
  const isNewsSection = pathname?.startsWith("/news");
  const isHomePage = pathname === "/";
  const isAPIPage =
    pathname?.startsWith("/shop") ||
    pathname?.startsWith("/product") ||
    pathname?.startsWith("/cart") ||
    pathname?.startsWith("/wishlist") ||
    pathname?.startsWith("/order") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/settings");

  const shouldHideNavbar =
    isSellerDashboard || isServiceDashboard || isSellerDeliveries || isSellerPromote || isSellerSettings
    || isSellerOrders || isSellerProducts || isNewsSection || isSellerWallet || isHomePage || isSellerProfile || isSellerAddProduct || isSellerEditProduct || isSellerAnalytics;
  const shouldHideBottomNav = isSellerDashboard || isHomePage;
  const shouldShowLoader = isAPIPage || isHomePage;

  return (
    <>
      <ScrollToTop />
      {shouldShowLoader && <PageLoader />}
      {!shouldHideNavbar && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!shouldHideBottomNav && <BottomNav />}
    </>
  );
}
