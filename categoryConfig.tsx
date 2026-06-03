// categoryConfig.tsx
// Maps category names/slugs to a consistent color theme + unique icon.

import {
  FiShoppingBag,
  FiSmartphone,
  FiHeart,
  FiMonitor,
  FiTv,
  FiPlay,
  FiHome,
  FiCoffee,
  FiPackage,
  FiWind,
  FiDroplet,
  FiTruck,
  FiBriefcase,
  FiCamera,
  FiHeadphones,
  FiWatch,
  FiSun,
  FiBook,
  FiMusic,
  FiPrinter,
  FiTool,
  FiZap,
  FiGift,
  FiBox,
  FiAward,
  FiActivity,
  FiFeather,
  FiUmbrella,
  FiLayers,
  FiCpu,
  FiServer,
  FiTablet,
} from "react-icons/fi";
import {
  MdOutlineLocalGroceryStore,
  MdOutlineSportsBasketball,
  MdOutlineKitchen,
  MdOutlinePets,
  MdOutlineChildCare,
  MdOutlineAutoAwesome,
  MdOutlineToys,
  MdOutlineDirectionsCar,
  MdOutlineHandyman,
} from "react-icons/md";
import { ReactNode } from "react";

export interface CategoryTheme {
  gradient: string;        // CSS gradient for header/hero
  accentColor: string;     // Hex for badges, prices, discount tags
  glowColor: string;       // Radial glow color
  iconColor: string;       // Tailwind text class for icon
  bgColor: string;         // Page background color
  badgeBg: string;         // Hex for discount badge background
  icon: ReactNode;         // Unique icon for the category
}

const themes: Record<string, CategoryTheme> = {
  // ── Appliances ───────────────────────────────────────────────────────────
  appliances: {
    gradient: "linear-gradient(135deg,#7c2d00 0%,#c2410c 50%,#ff8c00 100%)",
    accentColor: "#FF8C00",
    glowColor: "#FFD700",
    iconColor: "text-orange-200",
    bgColor: "#F5F6F7",
    badgeBg: "#FF8C00",
    icon: <MdOutlineKitchen size={18} style={{ color: "#fed7aa" }} />,
  },

  // ── Fashion / Clothing ───────────────────────────────────────────────────
  fashion: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
    icon: <FiShoppingBag size={18} style={{ color: "#e9d5ff" }} />,
  },
  clothing: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
    icon: <FiShoppingBag size={18} style={{ color: "#e9d5ff" }} />,
  },
  shoes: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
    icon: <FiFeather size={18} style={{ color: "#e9d5ff" }} />,
  },
  accessories: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
    icon: <FiWatch size={18} style={{ color: "#e9d5ff" }} />,
  },
  watches: {
    gradient: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#60a5fa 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-200",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
    icon: <FiWatch size={18} style={{ color: "#bfdbfe" }} />,
  },
  bags: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
    icon: <FiPackage size={18} style={{ color: "#e9d5ff" }} />,
  },

  // ── Beauty / Cosmetics ───────────────────────────────────────────────────
  beauty: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
    icon: <FiHeart size={18} style={{ color: "#f9a8d4" }} />,
  },
  cosmetics: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
    icon: <MdOutlineAutoAwesome size={18} style={{ color: "#f9a8d4" }} />,
  },
  skincare: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
    icon: <FiSun size={18} style={{ color: "#f9a8d4" }} />,
  },
  "health-beauty": {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
    icon: <FiActivity size={18} style={{ color: "#f9a8d4" }} />,
  },
  health: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
    icon: <FiActivity size={18} style={{ color: "#f9a8d4" }} />,
  },

  // ── Phones / Mobile ──────────────────────────────────────────────────────
  phones: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
    icon: <FiSmartphone size={18} style={{ color: "#67e8f9" }} />,
  },
  mobile: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
    icon: <FiSmartphone size={18} style={{ color: "#67e8f9" }} />,
  },
  smartphones: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
    icon: <FiSmartphone size={18} style={{ color: "#67e8f9" }} />,
  },
  tablets: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
    icon: <FiTablet size={18} style={{ color: "#67e8f9" }} />,
  },

  // ── Gaming ───────────────────────────────────────────────────────────────
  gaming: {
    gradient: "linear-gradient(135deg,#000000 0%,#020d05 35%,#052e16 65%,#14532d 100%)",
    accentColor: "#16a34a",
    glowColor: "#4ade80",
    iconColor: "text-green-400",
    bgColor: "#F5F6F7",
    badgeBg: "#16a34a",
    icon: <FiPlay size={18} style={{ color: "#4ade80" }} />,
  },
  games: {
    gradient: "linear-gradient(135deg,#000000 0%,#020d05 35%,#052e16 65%,#14532d 100%)",
    accentColor: "#16a34a",
    glowColor: "#4ade80",
    iconColor: "text-green-400",
    bgColor: "#F5F6F7",
    badgeBg: "#16a34a",
    icon: <FiPlay size={18} style={{ color: "#4ade80" }} />,
  },

  // ── TV & Audio ───────────────────────────────────────────────────────────
  "tv-audio": {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
    icon: <FiTv size={18} style={{ color: "#fde047" }} />,
  },
  tv: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
    icon: <FiTv size={18} style={{ color: "#fde047" }} />,
  },
  audio: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
    icon: <FiHeadphones size={18} style={{ color: "#fde047" }} />,
  },
  electronics: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
    icon: <FiZap size={18} style={{ color: "#fde047" }} />,
  },
  cameras: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
    icon: <FiCamera size={18} style={{ color: "#fde047" }} />,
  },

  // ── Home / Furniture ─────────────────────────────────────────────────────
  home: {
    gradient: "linear-gradient(135deg,#0c0700 0%,#1c1003 35%,#3d2006 65%,#92400e 100%)",
    accentColor: "#92400e",
    glowColor: "#fbbf24",
    iconColor: "text-amber-300",
    bgColor: "#FFFBF0",
    badgeBg: "#b45309",
    icon: <FiHome size={18} style={{ color: "#fcd34d" }} />,
  },
  furniture: {
    gradient: "linear-gradient(135deg,#0c0700 0%,#1c1003 35%,#3d2006 65%,#92400e 100%)",
    accentColor: "#92400e",
    glowColor: "#fbbf24",
    iconColor: "text-amber-300",
    bgColor: "#FFFBF0",
    badgeBg: "#b45309",
    icon: <FiLayers size={18} style={{ color: "#fcd34d" }} />,
  },
  decor: {
    gradient: "linear-gradient(135deg,#0c0700 0%,#1c1003 35%,#3d2006 65%,#92400e 100%)",
    accentColor: "#92400e",
    glowColor: "#fbbf24",
    iconColor: "text-amber-300",
    bgColor: "#FFFBF0",
    badgeBg: "#b45309",
    icon: <MdOutlineAutoAwesome size={18} style={{ color: "#fcd34d" }} />,
  },
  accommodation: {
    gradient: "linear-gradient(135deg,#d97706 0%,#b45309 50%,#92400e 100%)",
    accentColor: "#d97706",
    glowColor: "#fbbf24",
    iconColor: "text-amber-200",
    bgColor: "#FFFBF0",
    badgeBg: "#d97706",
    icon: <FiHome size={18} style={{ color: "#fde68a" }} />,
  },
  accommodations: {
    gradient: "linear-gradient(135deg,#d97706 0%,#b45309 50%,#92400e 100%)",
    accentColor: "#d97706",
    glowColor: "#fbbf24",
    iconColor: "text-amber-200",
    bgColor: "#FFFBF0",
    badgeBg: "#d97706",
    icon: <FiHome size={18} style={{ color: "#fde68a" }} />,
  },

  // ── Computing / Laptops ──────────────────────────────────────────────────
  computing: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
    icon: <FiMonitor size={18} style={{ color: "#93c5fd" }} />,
  },
  laptops: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
    icon: <FiMonitor size={18} style={{ color: "#93c5fd" }} />,
  },
  computers: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
    icon: <FiCpu size={18} style={{ color: "#93c5fd" }} />,
  },
  printers: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
    icon: <FiPrinter size={18} style={{ color: "#93c5fd" }} />,
  },
  networking: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
    icon: <FiServer size={18} style={{ color: "#93c5fd" }} />,
  },

  // ── Food / Drinks / Groceries ────────────────────────────────────────────
  food: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <MdOutlineLocalGroceryStore size={18} style={{ color: "#86efac" }} />,
  },
  drinks: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <FiCoffee size={18} style={{ color: "#86efac" }} />,
  },
  beverages: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <FiCoffee size={18} style={{ color: "#86efac" }} />,
  },
  groceries: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <MdOutlineLocalGroceryStore size={18} style={{ color: "#86efac" }} />,
  },
  perishables: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <FiPackage size={18} style={{ color: "#86efac" }} />,
  },
  perishable: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <FiPackage size={18} style={{ color: "#86efac" }} />,
  },

  // ── Personal Care / Cleaning ─────────────────────────────────────────────
  "personal-care": {
    gradient: "linear-gradient(135deg,#831843 0%,#be185d 50%,#ec4899 100%)",
    accentColor: "#ec4899",
    glowColor: "#f9a8d4",
    iconColor: "text-pink-200",
    bgColor: "#FDF2F8",
    badgeBg: "#be185d",
    icon: <FiWind size={18} style={{ color: "#fbcfe8" }} />,
  },
  "personal care": {
    gradient: "linear-gradient(135deg,#831843 0%,#be185d 50%,#ec4899 100%)",
    accentColor: "#ec4899",
    glowColor: "#f9a8d4",
    iconColor: "text-pink-200",
    bgColor: "#FDF2F8",
    badgeBg: "#be185d",
    icon: <FiWind size={18} style={{ color: "#fbcfe8" }} />,
  },
  "cleaning-hygiene": {
    gradient: "linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#60a5fa 100%)",
    accentColor: "#2563eb",
    glowColor: "#93c5fd",
    iconColor: "text-blue-200",
    bgColor: "#EFF6FF",
    badgeBg: "#2563eb",
    icon: <FiDroplet size={18} style={{ color: "#bfdbfe" }} />,
  },
  cleaning: {
    gradient: "linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#60a5fa 100%)",
    accentColor: "#2563eb",
    glowColor: "#93c5fd",
    iconColor: "text-blue-200",
    bgColor: "#EFF6FF",
    badgeBg: "#2563eb",
    icon: <FiDroplet size={18} style={{ color: "#bfdbfe" }} />,
  },
  hygiene: {
    gradient: "linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#60a5fa 100%)",
    accentColor: "#2563eb",
    glowColor: "#93c5fd",
    iconColor: "text-blue-200",
    bgColor: "#EFF6FF",
    badgeBg: "#2563eb",
    icon: <FiDroplet size={18} style={{ color: "#bfdbfe" }} />,
  },

  // ── Services ─────────────────────────────────────────────────────────────
  services: {
    gradient: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 50%,#6366f1 100%)",
    accentColor: "#6366f1",
    glowColor: "#a5b4fc",
    iconColor: "text-indigo-200",
    bgColor: "#F5F3FF",
    badgeBg: "#4f46e5",
    icon: <FiBriefcase size={18} style={{ color: "#c7d2fe" }} />,
  },

  // ── Logistics ────────────────────────────────────────────────────────────
  logistics: {
    gradient: "linear-gradient(135deg,#164e63 0%,#0e7490 50%,#06b6d4 100%)",
    accentColor: "#06b6d4",
    glowColor: "#67e8f9",
    iconColor: "text-cyan-200",
    bgColor: "#ECFEFF",
    badgeBg: "#0891b2",
    icon: <FiTruck size={18} style={{ color: "#a5f3fc" }} />,
  },
  delivery: {
    gradient: "linear-gradient(135deg,#164e63 0%,#0e7490 50%,#06b6d4 100%)",
    accentColor: "#06b6d4",
    glowColor: "#67e8f9",
    iconColor: "text-cyan-200",
    bgColor: "#ECFEFF",
    badgeBg: "#0891b2",
    icon: <FiTruck size={18} style={{ color: "#a5f3fc" }} />,
  },

  // ── Sports / Outdoors ────────────────────────────────────────────────────
  sports: {
    gradient: "linear-gradient(135deg,#052e16 0%,#14532d 50%,#16a34a 100%)",
    accentColor: "#15803d",
    glowColor: "#4ade80",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <MdOutlineSportsBasketball size={18} style={{ color: "#86efac" }} />,
  },
  outdoors: {
    gradient: "linear-gradient(135deg,#052e16 0%,#14532d 50%,#16a34a 100%)",
    accentColor: "#15803d",
    glowColor: "#4ade80",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
    icon: <FiUmbrella size={18} style={{ color: "#86efac" }} />,
  },

  // ── Automotive ───────────────────────────────────────────────────────────
  automotive: {
    gradient: "linear-gradient(135deg,#1c1917 0%,#44403c 50%,#78716c 100%)",
    accentColor: "#78716c",
    glowColor: "#d6d3d1",
    iconColor: "text-stone-300",
    bgColor: "#FAFAF9",
    badgeBg: "#57534e",
    icon: <MdOutlineDirectionsCar size={18} style={{ color: "#d6d3d1" }} />,
  },
  tools: {
    gradient: "linear-gradient(135deg,#1c1917 0%,#44403c 50%,#78716c 100%)",
    accentColor: "#78716c",
    glowColor: "#d6d3d1",
    iconColor: "text-stone-300",
    bgColor: "#FAFAF9",
    badgeBg: "#57534e",
    icon: <FiTool size={18} style={{ color: "#d6d3d1" }} />,
  },
  hardware: {
    gradient: "linear-gradient(135deg,#1c1917 0%,#44403c 50%,#78716c 100%)",
    accentColor: "#78716c",
    glowColor: "#d6d3d1",
    iconColor: "text-stone-300",
    bgColor: "#FAFAF9",
    badgeBg: "#57534e",
    icon: <MdOutlineHandyman size={18} style={{ color: "#d6d3d1" }} />,
  },

  // ── Books / Education ────────────────────────────────────────────────────
  books: {
    gradient: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#60a5fa 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#93c5fd",
    iconColor: "text-blue-200",
    bgColor: "#EFF6FF",
    badgeBg: "#1d4ed8",
    icon: <FiBook size={18} style={{ color: "#bfdbfe" }} />,
  },
  education: {
    gradient: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#60a5fa 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#93c5fd",
    iconColor: "text-blue-200",
    bgColor: "#EFF6FF",
    badgeBg: "#1d4ed8",
    icon: <FiBook size={18} style={{ color: "#bfdbfe" }} />,
  },

  // ── Toys / Kids ──────────────────────────────────────────────────────────
  toys: {
    gradient: "linear-gradient(135deg,#7e1d1d 0%,#b91c1c 50%,#f87171 100%)",
    accentColor: "#ef4444",
    glowColor: "#fca5a5",
    iconColor: "text-red-200",
    bgColor: "#FFF5F5",
    badgeBg: "#dc2626",
    icon: <MdOutlineToys size={18} style={{ color: "#fecaca" }} />,
  },
  kids: {
    gradient: "linear-gradient(135deg,#7e1d1d 0%,#b91c1c 50%,#f87171 100%)",
    accentColor: "#ef4444",
    glowColor: "#fca5a5",
    iconColor: "text-red-200",
    bgColor: "#FFF5F5",
    badgeBg: "#dc2626",
    icon: <MdOutlineChildCare size={18} style={{ color: "#fecaca" }} />,
  },
  babies: {
    gradient: "linear-gradient(135deg,#7e1d1d 0%,#b91c1c 50%,#f87171 100%)",
    accentColor: "#ef4444",
    glowColor: "#fca5a5",
    iconColor: "text-red-200",
    bgColor: "#FFF5F5",
    badgeBg: "#dc2626",
    icon: <MdOutlineChildCare size={18} style={{ color: "#fecaca" }} />,
  },

  // ── Pets ────────────────────────────────────────────────────────────────
  pets: {
    gradient: "linear-gradient(135deg,#78350f 0%,#b45309 50%,#f59e0b 100%)",
    accentColor: "#d97706",
    glowColor: "#fcd34d",
    iconColor: "text-yellow-200",
    bgColor: "#FFFBEB",
    badgeBg: "#b45309",
    icon: <MdOutlinePets size={18} style={{ color: "#fef08a" }} />,
  },

  // ── Music ────────────────────────────────────────────────────────────────
  music: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
    icon: <FiMusic size={18} style={{ color: "#f9a8d4" }} />,
  },

  // ── Gifts ────────────────────────────────────────────────────────────────
  gifts: {
    gradient: "linear-gradient(135deg,#7c2d00 0%,#c2410c 50%,#ff8c00 100%)",
    accentColor: "#FF8C00",
    glowColor: "#FFD700",
    iconColor: "text-orange-200",
    bgColor: "#FFF7ED",
    badgeBg: "#ea580c",
    icon: <FiGift size={18} style={{ color: "#fed7aa" }} />,
  },

  // ── General / Others ─────────────────────────────────────────────────────
  others: {
    gradient: "linear-gradient(135deg,#1f2937 0%,#374151 50%,#6b7280 100%)",
    accentColor: "#6b7280",
    glowColor: "#d1d5db",
    iconColor: "text-gray-300",
    bgColor: "#F9FAFB",
    badgeBg: "#4b5563",
    icon: <FiBox size={18} style={{ color: "#d1d5db" }} />,
  },
  general: {
    gradient: "linear-gradient(135deg,#1f2937 0%,#374151 50%,#6b7280 100%)",
    accentColor: "#6b7280",
    glowColor: "#d1d5db",
    iconColor: "text-gray-300",
    bgColor: "#F9FAFB",
    badgeBg: "#4b5563",
    icon: <FiBox size={18} style={{ color: "#d1d5db" }} />,
  },
  awards: {
    gradient: "linear-gradient(135deg,#78350f 0%,#b45309 50%,#f59e0b 100%)",
    accentColor: "#d97706",
    glowColor: "#fcd34d",
    iconColor: "text-yellow-200",
    bgColor: "#FFFBEB",
    badgeBg: "#b45309",
    icon: <FiAward size={18} style={{ color: "#fef08a" }} />,
  },
};

// ── Default theme (orange/yellow) ─────────────────────────────────────────────
const defaultTheme: CategoryTheme = {
  gradient: "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
  accentColor: "#e67e22",
  glowColor: "#FFD700",
  iconColor: "text-yellow-300",
  bgColor: "#F5F6F7",
  badgeBg: "#FF8C00",
  icon: <FiBox size={18} style={{ color: "#fde047" }} />,
};

/**
 * Returns a theme for the given category name or slug.
 * Matching is case-insensitive and checks for keyword inclusion.
 */
export function getCategoryTheme(nameOrSlug: string): CategoryTheme {
  const key = nameOrSlug.toLowerCase().trim().replace(/\s+/g, "-");

  // Exact match first (handles "personal-care" etc.)
  if (themes[key]) return themes[key];

  // Also try with spaces replaced back
  const keySpaced = nameOrSlug.toLowerCase().trim();
  if (themes[keySpaced]) return themes[keySpaced];

  // Keyword inclusion match
  for (const [themeKey, theme] of Object.entries(themes)) {
    if (key.includes(themeKey) || themeKey.includes(key)) return theme;
    if (keySpaced.includes(themeKey) || themeKey.includes(keySpaced)) return theme;
  }

  return defaultTheme;
}