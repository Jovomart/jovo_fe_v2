'use client'
// src/components/BottomNavbar.jsx
// Home | News | [Cart FAB] | Guide | Help

import { usePathname, useRouter } from "next/navigation"
import { FiHome, FiBookOpen, FiHelpCircle, FiRadio, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

const NAV_ITEMS_RIGHT = [
  { label: "Guide", icon: FiBookOpen, path: "/campus-guide" },
  { label: "Help", icon: FiHelpCircle, path: "/help" },
];

// ─── Nav Item ─────────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, path, active, onClick, badge }: { 
  icon: any; 
  label: string; 
  path: string; 
  active: boolean; 
  onClick: () => void; 
  badge?: string | number;
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
  >
    <div className="relative">
      <Icon
        size={22}
        className={`transition-all duration-200 ${active ? "text-[#0E0E10]" : "text-ink/50"}`}
      />
      {badge && (
        <span className="absolute -top-2 -right-2.5 bg-[#0E0E10] text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-4 text-center leading-none">
          {badge}
        </span>
      )}
    </div>

    <span
      className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${active ? "text-[#0E0E10]" : "text-ink/50"}`}
    >
      {label}
    </span>

    {/* Active indicator */}
    {active && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute -top-1 w-6 h-0.5 bg-gradient-to-r from-[#0E0E10] to-[#B42225] rounded-full"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 24 }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
);

// ─── Custom Cart Icon ────────────────────────────────────────────────
const CartIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shopping cart body */}
    <rect x="4" y="9" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8" fill="none" />
    
    {/* Cart handle */}
    <path d="M8 9V6C8 3.5 9.5 2 12 2H16C18.5 2 20 3.5 20 6V9" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    
    {/* Wheels */}
    <circle cx="9" cy="23" r="2" fill="white" />
    <circle cx="19" cy="23" r="2" fill="white" />
    
    {/* Items inside */}
    <line x1="11" y1="13" x2="11" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="12" x2="14" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="17" y1="13" x2="17" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── Main ─────────────────────────────────────────────────────────────────
export default function BottomNavbar() {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const pathname = usePathname()
  const { sellerMode } = useContext(AuthContext);
  const isActive = (p: string) => pathname === p;

  const NAV_ITEMS_LEFT = [
    {
      label: "Home",
      icon: FiHome,
      path: sellerMode ? "/seller/dashboard" : "/",
    },
    { label: "News", icon: FiRadio, path: "/news" },
  ];

  const hiddenPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
  ];
  if (hiddenPaths.includes(pathname) || sellerMode) return null;

  // Don't show on auth pages
  if (pathname?.startsWith('/seller') && pathname !== '/seller/dashboard') return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full md:hidden z-50">
        {/* Main nav container */}
        <div className="relative bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Subtle top border */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          
          {/* Nav row */}
          <div className="relative flex items-center justify-between px-4 py-2">
            {/* Left: Home + News */}
            <div className="flex flex-1 justify-around max-w-[45%]">
              {NAV_ITEMS_LEFT.map(({ label, icon, path }) => (
                <NavItem
                  key={path}
                  icon={icon}
                  label={label}
                  path={path}
                  active={isActive(path)}
                  onClick={() => navigate(path)}
                />
              ))}
            </div>

            {/* Center space for FAB */}
            <div className="w-16 relative">
              {/* FAB Container - positions the button relative to this center space */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-14">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30,
                  }}
                  onClick={() => router.push("/cart")}
                  aria-label="Shopping Cart"
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lift origin-center"
                  style={{
                    background: "linear-gradient(135deg, #0E0E10 0%, #B42225 45%, #B42225 100%)",
                    boxShadow: "0 4px 15px rgba(180,34,37,0.4), 0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                  
                  {/* Inner glow */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(255,140,0,0.3) 0%, transparent 70%)",
                    }}
                  />
                  
                  <CartIcon />
                </motion.button>
                
                {/* Small label below FAB */}
                <div className="absolute left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-wider text-[#0E0E10] whitespace-nowrap mt-1">
                  CART
                </div>
              </div>
            </div>

            {/* Right: Guide + Help */}
            <div className="flex flex-1 justify-around max-w-[45%]">
              {NAV_ITEMS_RIGHT.map(({ label, icon, path }) => (
                <NavItem
                  key={path}
                  icon={icon}
                  label={label}
                  path={path}
                  active={isActive(path)}
                  onClick={() => navigate(path)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding spacer to prevent content from hiding under nav */}
      <div className="h-[72px] md:hidden" />
    </>
  );
}