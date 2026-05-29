// categoryConfig.ts
// Maps category names/slugs to a consistent color theme.
// Orange/yellow is the default (like AppliancesDeals).

export interface CategoryTheme {
  gradient: string;         // CSS gradient for header/hero
  accentColor: string;      // Hex for badges, prices, discount tags
  glowColor: string;        // Radial glow color
  iconColor: string;        // Tailwind text class for icon
  bgColor: string;          // Page background color
  badgeBg: string;          // Hex for discount badge background
}

const themes: Record<string, CategoryTheme> = {
  // ── Fashion / Clothing ───────────────────────────────────────────────
  fashion: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
  },
  clothing: {
    gradient: "linear-gradient(135deg,#3b0764 0%,#4B004F 50%,#7e22ce 100%)",
    accentColor: "#7e22ce",
    glowColor: "#d946ef",
    iconColor: "text-purple-200",
    bgColor: "#F5F6F7",
    badgeBg: "#7e22ce",
  },

  // ── Beauty / Cosmetics ───────────────────────────────────────────────
  beauty: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
  },
  cosmetics: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
  },
  skincare: {
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0728 40%,#831843 70%,#db2777 100%)",
    accentColor: "#db2777",
    glowColor: "#f472b6",
    iconColor: "text-pink-300",
    bgColor: "#FDF6F9",
    badgeBg: "#be185d",
  },

  // ── Phones / Mobile ──────────────────────────────────────────────────
  phones: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
  },
  mobile: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
  },
  smartphones: {
    gradient: "linear-gradient(135deg,#00B4D8 0%,#0077B6 50%,#023E8A 100%)",
    accentColor: "#0077B6",
    glowColor: "#00f2fe",
    iconColor: "text-cyan-300",
    bgColor: "#F8FAFC",
    badgeBg: "#0077B6",
  },

  // ── Gaming ──────────────────────────────────────────────────────────
  gaming: {
    gradient: "linear-gradient(135deg,#000000 0%,#020d05 35%,#052e16 65%,#14532d 100%)",
    accentColor: "#16a34a",
    glowColor: "#4ade80",
    iconColor: "text-green-400",
    bgColor: "#F5F6F7",
    badgeBg: "#16a34a",
  },
  games: {
    gradient: "linear-gradient(135deg,#000000 0%,#020d05 35%,#052e16 65%,#14532d 100%)",
    accentColor: "#16a34a",
    glowColor: "#4ade80",
    iconColor: "text-green-400",
    bgColor: "#F5F6F7",
    badgeBg: "#16a34a",
  },

  // ── TV & Audio ──────────────────────────────────────────────────────
  "tv-audio": {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
  },
  tv: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
  },
  audio: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
  },
  electronics: {
    gradient: "linear-gradient(135deg,#8B0000 0%,#B42225 50%,#cd5c5c 100%)",
    accentColor: "#B42225",
    glowColor: "#FF6347",
    iconColor: "text-yellow-300",
    bgColor: "#F5F6F7",
    badgeBg: "#B42225",
  },

  // ── Home / Furniture ─────────────────────────────────────────────────
  home: {
    gradient: "linear-gradient(135deg,#0c0700 0%,#1c1003 35%,#3d2006 65%,#92400e 100%)",
    accentColor: "#92400e",
    glowColor: "#fbbf24",
    iconColor: "text-amber-300",
    bgColor: "#FFFBF0",
    badgeBg: "#b45309",
  },
  furniture: {
    gradient: "linear-gradient(135deg,#0c0700 0%,#1c1003 35%,#3d2006 65%,#92400e 100%)",
    accentColor: "#92400e",
    glowColor: "#fbbf24",
    iconColor: "text-amber-300",
    bgColor: "#FFFBF0",
    badgeBg: "#b45309",
  },

  // ── Computing / Laptops ──────────────────────────────────────────────
  computing: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
  },
  laptops: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
  },
  computers: {
    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)",
    accentColor: "#1d4ed8",
    glowColor: "#60a5fa",
    iconColor: "text-blue-300",
    bgColor: "#F8FAFC",
    badgeBg: "#1d4ed8",
  },

  // ── Food / Drinks ────────────────────────────────────────────────────
  food: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
  },
  drinks: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
  },
  beverages: {
    gradient: "linear-gradient(135deg,#14532d 0%,#166534 50%,#22c55e 100%)",
    accentColor: "#16a34a",
    glowColor: "#86efac",
    iconColor: "text-green-300",
    bgColor: "#F0FDF4",
    badgeBg: "#15803d",
  },
};

// Default theme (orange/yellow like AppliancesDeals)
const defaultTheme: CategoryTheme = {
  gradient: "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
  accentColor: "#e67e22",
  glowColor: "#FFD700",
  iconColor: "text-yellow-300",
  bgColor: "#F5F6F7",
  badgeBg: "#FF8C00",
};

/**
 * Returns a theme for the given category name or slug.
 * Matching is case-insensitive and checks for keyword inclusion.
 */
export function getCategoryTheme(nameOrSlug: string): CategoryTheme {
  const key = nameOrSlug.toLowerCase().trim();

  // Exact match first
  if (themes[key]) return themes[key];

  // Keyword inclusion match (e.g. "Men & Women Fashion" → fashion)
  for (const [themeKey, theme] of Object.entries(themes)) {
    if (key.includes(themeKey) || themeKey.includes(key)) {
      return theme;
    }
  }

  return defaultTheme;
}