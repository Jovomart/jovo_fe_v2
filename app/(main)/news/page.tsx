'use client'
import { useRouter } from 'next/navigation'
// src/pages/NewsPage.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import {
  FiSearch, FiX, FiClock, FiTrendingUp, FiGlobe, FiBookmark,
  FiShare2, FiChevronRight, FiPlay, FiEye, FiArrowRight,
  FiZap, FiMapPin, FiRadio, FiVideo,
} from "react-icons/fi";
import {
  FaFire, FaNewspaper, FaUniversity, FaFlag, FaGlobe,
  FaPlay, FaRegBookmark, FaBookmark,
} from "react-icons/fa";
import { MdVerified, MdTrendingUp } from "react-icons/md";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   NEWS DATA
───────────────────────────────────────────────────────────── */
const allNews = [
  // ── JOVO NEWS ──
  {
    id: 1, category: "jovo", tag: "Platform Update",
    title: "Jovo Marketplace Launches Express Delivery Across South-East Nigeria",
    excerpt: "Jovo has officially expanded its express same-day delivery network to cover major cities across South-East Nigeria, including Owerri, Enugu, and Onitsha, in a major logistics milestone.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    author: "Jovo Editorial", time: "2 hours ago", views: "12.4K", featured: true,
    readTime: "3 min read",
  },
  {
    id: 2, category: "jovo", tag: "Sellers",
    title: "Over 5,000 Vendors Now Active on Jovo - Platform Hits Record GMV",
    excerpt: "The Jovo marketplace celebrated a new milestone this week as its vendor count surpassed 5,000 active sellers, with gross merchandise value hitting an all-time high.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    author: "Jovo Business", time: "5 hours ago", views: "8.1K",
    readTime: "4 min read",
  },
  {
    id: 3, category: "jovo", tag: "Technology",
    title: "Jovo Introduces AI-Powered Product Recommendations for Shoppers",
    excerpt: "Using machine learning models trained on millions of purchase patterns, Jovo's new recommendation engine delivers hyper-personalised product suggestions in real-time.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    author: "Jovo Tech Team", time: "1 day ago", views: "6.2K",
    readTime: "5 min read",
  },
  {
    id: 4, category: "jovo", tag: "Flash Sales",
    title: "Jovo's Biggest Flash Sale Yet: ₦500M in Orders in Under 2 Hours",
    excerpt: "Jovo's annual mega flash sale event shattered all previous records, recording over half a billion naira in orders within the first two hours of going live.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    author: "Jovo Editorial", time: "2 days ago", views: "21.5K",
    readTime: "3 min read",
  },
  {
    id: 5, category: "jovo", tag: "Community",
    title: "Jovo Student Ambassador Programme Launches at FUTO, UNILAG & UNIBEN",
    excerpt: "Jovo has launched its campus ambassador programme at three major Nigerian universities, aiming to connect student entrepreneurs directly with the platform's seller ecosystem.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    author: "Jovo Community", time: "3 days ago", views: "4.7K",
    readTime: "3 min read",
  },

  // ── FUTO NEWS ──
  {
    id: 6, category: "futo", tag: "Academic",
    title: "FUTO Climbs 3 Places in Latest West Africa University Rankings",
    excerpt: "The Federal University of Technology, Owerri, has moved up three places in the 2025 West Africa University Rankings, now standing at position 14 on the continent for STEM education.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    author: "FUTO News Desk", time: "1 hour ago", views: "9.3K", featured: true,
    readTime: "4 min read",
  },
  {
    id: 7, category: "futo", tag: "Infrastructure",
    title: "New 500-Bed Hostel Complex Under Construction at FUTO Main Campus",
    excerpt: "The Federal University of Technology Owerri has broken ground on a state-of-the-art 500-bed hostel facility equipped with solar power, high-speed internet, and modern amenities.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    author: "FUTO PRO", time: "3 hours ago", views: "7.8K",
    readTime: "3 min read",
  },
  {
    id: 8, category: "futo", tag: "Research",
    title: "FUTO Engineering Students Win Pan-African Robotics Championship",
    excerpt: "A team of five undergraduate engineering students from FUTO has clinched first place at the Pan-African Robotics and Automation Championship held in Nairobi, Kenya.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    author: "FUTO Tech News", time: "6 hours ago", views: "15.2K",
    readTime: "5 min read",
  },
  {
    id: 9, category: "futo", tag: "Events",
    title: "FUTO SUG Week: Full Schedule of Events and Activities Released",
    excerpt: "The Student Union Government of FUTO has released the official schedule for the annual SUG Week, featuring cultural nights, tech expos, sports competitions, and a job fair.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    author: "FUTO Student Union", time: "8 hours ago", views: "11.4K",
    readTime: "2 min read",
  },
  {
    id: 10, category: "futo", tag: "Academics",
    title: "FUTO Introduces New Cybersecurity & Data Science Degree Programmes",
    excerpt: "Starting the 2025/2026 academic session, FUTO will offer two new undergraduate programmes: B.Sc Cybersecurity and B.Sc Data Science, in partnership with global tech firms.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    author: "FUTO Academic", time: "1 day ago", views: "13.7K",
    readTime: "4 min read",
  },

  // ── NATIONAL NEWS ──
  {
    id: 11, category: "national", tag: "Economy",
    title: "Nigeria's GDP Grows 3.8% in Q1 2025, Driven by Tech and Agriculture",
    excerpt: "Nigeria's National Bureau of Statistics has released Q1 2025 GDP figures showing a 3.8% growth rate, with the technology and agricultural sectors leading expansion across all regions.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    author: "NBS Report", time: "30 mins ago", views: "33.1K", featured: true,
    readTime: "6 min read", breaking: true,
  },
  {
    id: 12, category: "national", tag: "Technology",
    title: "FG Announces ₦50B Digital Infrastructure Fund for Nigerian States",
    excerpt: "The Federal Government has announced a ₦50 billion Digital Infrastructure Fund to be disbursed to all 36 states for broadband expansion, data centres, and ICT training centres.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    author: "NAN", time: "2 hours ago", views: "18.9K",
    readTime: "4 min read", breaking: true,
  },
  {
    id: 13, category: "national", tag: "Education",
    title: "ASUU and Federal Government Reach Agreement on New University Funding Model",
    excerpt: "After months of negotiations, the Academic Staff Union of Universities and the Federal Government have finalised a new university funding framework that includes salary revisions.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    author: "NAN", time: "4 hours ago", views: "22.4K",
    readTime: "5 min read",
  },
  {
    id: 14, category: "national", tag: "Sports",
    title: "Super Eagles Named in Top 10 African Teams for FIFA 2026 Qualifiers",
    excerpt: "Nigeria's Super Eagles have been ranked among the top 10 African nations in the latest FIFA rankings ahead of the 2026 World Cup qualifying rounds.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    author: "Sports Desk", time: "5 hours ago", views: "41.2K",
    readTime: "3 min read",
  },
  {
    id: 15, category: "national", tag: "Politics",
    title: "Senate Passes Landmark Data Protection Bill into Law",
    excerpt: "Nigeria's Senate has passed the comprehensive Data Protection and Digital Rights Bill, creating a framework for personal data privacy and digital rights for all citizens.",
    image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&q=80",
    author: "NAN Political", time: "7 hours ago", views: "14.8K",
    readTime: "4 min read",
  },

  // ── INTERNATIONAL NEWS ──
  {
    id: 16, category: "international", tag: "Technology",
    title: "Apple Unveils Vision Pro 2 with Neural Interface and 48-Hour Battery",
    excerpt: "Apple has officially announced the second generation Vision Pro spatial computing headset featuring a breakthrough neural interface system and a dramatically improved 48-hour battery life.",
    image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80",
    author: "Tech Global", time: "1 hour ago", views: "89.4K", featured: true,
    readTime: "5 min read",
  },
  {
    id: 17, category: "international", tag: "Climate",
    title: "150 Nations Sign Historic Climate Accord to Reach Net-Zero by 2040",
    excerpt: "In a landmark multilateral agreement, 150 nations at the Geneva Climate Summit have signed a binding accord committing to reach net-zero carbon emissions a full decade earlier than previously planned.",
    image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&q=80",
    author: "Reuters", time: "3 hours ago", views: "56.3K",
    readTime: "6 min read", breaking: true,
  },
  {
    id: 18, category: "international", tag: "AI",
    title: "OpenAI Launches GPT-5 with Real-Time Multimodal Reasoning Capabilities",
    excerpt: "OpenAI has released GPT-5, described as the most capable AI model ever deployed publicly, featuring real-time video understanding, multimodal reasoning, and advanced autonomous task completion.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    author: "The Verge", time: "5 hours ago", views: "120K",
    readTime: "7 min read",
  },
  {
    id: 19, category: "international", tag: "Finance",
    title: "Bitcoin Crosses $150,000 as Institutional Adoption Reaches All-Time High",
    excerpt: "Bitcoin surpassed the $150,000 mark for the first time in history as institutional investors, sovereign wealth funds, and major corporations continue accumulating the digital asset.",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
    author: "Bloomberg", time: "6 hours ago", views: "98.7K",
    readTime: "4 min read",
  },
  {
    id: 20, category: "international", tag: "Space",
    title: "SpaceX Starship Completes First Crewed Lunar Orbit Mission Successfully",
    excerpt: "SpaceX's Starship successfully completed its first crewed lunar orbit mission, with four astronauts spending 72 hours orbiting the Moon before returning safely to Earth.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
    author: "NASA / SpaceX", time: "8 hours ago", views: "213K",
    readTime: "5 min read",
  },
];

const videoNews = [
  {
    id: "v1",
    title: "Jovo Mega Flash Sale - Behind the Scenes",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
    duration: "4:32", views: "14.2K", category: "jovo",
  },
  {
    id: "v2",
    title: "FUTO Robotics Team: Road to the Championship",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    duration: "7:15", views: "9.8K", category: "futo",
  },
  {
    id: "v3",
    title: "Nigeria's Digital Economy: The Next Decade",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    duration: "12:44", views: "31.5K", category: "national",
  },
  {
    id: "v4",
    title: "SpaceX Starship Moon Mission: Full Highlights",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
    duration: "18:02", views: "87.3K", category: "international",
  },
];

const breakingTicker = [
  "🔴 BREAKING: Nigeria's Senate passes landmark Data Protection Bill",
  "⚡ JOVO: Express delivery now live across South-East Nigeria",
  "🏆 FUTO Students win Pan-African Robotics Championship",
  "🌍 150 Nations sign historic Climate Accord in Geneva",
  "📈 Bitcoin crosses $150,000 for the first time in history",
  "🚀 SpaceX Starship completes first crewed lunar orbit",
];

const CATEGORIES = [
  { key: "all",           label: "All News",     icon: <FaNewspaper size={14} />,  color: "#0E0E10" },
  { key: "jovo",          label: "Jovo News",    icon: <FaFire size={14} />,       color: "#FF6B00" },
  { key: "futo",          label: "FUTO News",    icon: <FaUniversity size={14} />, color: "#7C3AED" },
  { key: "national",      label: "National",     icon: <FaFlag size={14} />,       color: "#059669" },
  { key: "international", label: "International",icon: <FaGlobe size={14} />,      color: "#0EA5E9" },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────── */

// Breaking news ticker
const BreakingTicker = () => {
  const [pos, setPos] = useState(0);
  const items = [...breakingTicker, ...breakingTicker];

  useEffect(() => {
    const t = setInterval(() => setPos((p) => (p + 1) % breakingTicker.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-0 overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 bg-[#0E0E10] text-white text-xs font-semibold px-4 py-2.5 z-10">
        <FiRadio size={13} className="animate-pulse" />
        LIVE
      </div>
      <div className="flex-1 bg-gray-900 text-white px-4 py-2.5 overflow-hidden">
        <div
          key={pos}
          className="text-xs font-medium text-gray-100 truncate"
          style={{ animation: "slideInUp 0.4s ease" }}
        >
          {breakingTicker[pos]}
        </div>
      </div>
    </div>
  );
};

// Category accent color
const getCategoryColor = (cat) => {
  const map = { jovo: "#FF6B00", futo: "#7C3AED", national: "#059669", international: "#0EA5E9" };
  return map[cat] || "#0E0E10";
};

// Featured hero card
const HeroCard = ({ article, onBookmark, bookmarked }) => (
  <div
    className="relative rounded-3xl overflow-hidden cursor-pointer group"
    style={{ minHeight: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
  >
    <img src={article.image} alt={article.title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
    <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />

    {article.breaking && (
      <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-[#0E0E10] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full">
        <FiZap size={10} className="animate-pulse" /> BREAKING
      </div>
    )}

    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
          style={{ background: getCategoryColor(article.category) }}>
          {article.tag}
        </span>
      </div>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-3"
        style={{ fontFamily: "'Instrument Sans',sans-serif", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
        {article.title}
      </h2>
      <p className="text-white/70 text-sm line-clamp-2 mb-4 max-w-2xl">{article.excerpt}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/60 text-xs">
          <span className="flex items-center gap-1"><FiClock size={11} /> {article.time}</span>
          <span className="flex items-center gap-1"><FiEye size={11} /> {article.views}</span>
          <span>{article.readTime}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onBookmark(article.id); }}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition">
          {bookmarked ? <FaBookmark size={13} className="text-yellow-400" /> : <FaRegBookmark size={13} className="text-white" />}
        </button>
      </div>
    </div>
  </div>
);

// Standard news card
const NewsCard = ({ article, onBookmark, bookmarked, compact = false }) => (
  <div className={`group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex ${compact ? "flex-row gap-0" : "flex-col"}`}
    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
    <div className={`relative overflow-hidden shrink-0 ${compact ? "w-28 h-28" : "w-full"}`}
      style={compact ? {} : { aspectRatio: "16/9" }}>
      <img src={article.image} alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      {article.breaking && !compact && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#0E0E10] text-white text-[9px] font-semibold px-2 py-1 rounded-full">
          <FiZap size={8} /> BREAKING
        </div>
      )}
      {!compact && (
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-semibold uppercase px-2 py-1 rounded-full text-white"
            style={{ background: getCategoryColor(article.category) }}>
            {article.tag}
          </span>
        </div>
      )}
    </div>
    <div className={`flex flex-col gap-2 ${compact ? "p-3 justify-center" : "p-4"}`}>
      {compact && (
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: getCategoryColor(article.category) }}>
          {article.tag}
        </span>
      )}
      <h3 className={`font-semibold text-ink leading-snug group-hover:text-[#0E0E10] transition-colors ${compact ? "text-xs line-clamp-3" : "text-sm md:text-base line-clamp-2"}`}
        style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
        {article.title}
      </h3>
      {!compact && (
        <p className="text-xs text-ink/50 line-clamp-2">{article.excerpt}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3 text-[10px] text-ink/40">
          <span className="flex items-center gap-1"><FiClock size={9} /> {article.time}</span>
          {!compact && <span className="flex items-center gap-1"><FiEye size={9} /> {article.views}</span>}
        </div>
        {!compact && (
          <button onClick={(e) => { e.stopPropagation(); onBookmark(article.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity">
            {bookmarked ? <FaBookmark size={12} className="text-yellow-400" /> : <FaRegBookmark size={12} className="text-ink/40 hover:text-yellow-400" />}
          </button>
        )}
      </div>
    </div>
  </div>
);

// Video card
const VideoCard = ({ video }) => (
  <div className="group relative rounded-2xl overflow-hidden cursor-pointer"
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
    <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <img src={video.thumbnail} alt={video.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
          <FaPlay size={16} className="text-[#0E0E10] ml-1" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
        {video.duration}
      </div>
      <div className="absolute top-2 left-2">
        <span className="text-[9px] font-semibold uppercase px-2 py-1 rounded-full text-white"
          style={{ background: getCategoryColor(video.category) }}>
          {video.category}
        </span>
      </div>
    </div>
    <div className="p-3 bg-white">
      <p className="text-xs font-bold text-ink line-clamp-2 leading-snug group-hover:text-[#0E0E10] transition-colors">
        {video.title}
      </p>
      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-ink/40">
        <FiEye size={10} /> {video.views}
        <FiVideo size={10} /> Video
      </div>
    </div>
  </div>
);

// Section header
const SectionHeader = ({ icon, title, color, count, onViewAll }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${color}99, ${color})` }} />
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
        style={{ background: color }}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
          {title}
        </h2>
        {count && <p className="text-[10px] text-ink/40">{count} stories</p>}
      </div>
    </div>
    <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-bold transition-colors hover:gap-2"
      style={{ color }}>
      View all <FiArrowRight size={13} />
    </button>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const NewsPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchFocused, setSearchFocused]   = useState(false);
  const [bookmarks, setBookmarks]           = useState([]);
  const [showBookmarks, setShowBookmarks]   = useState(false);
  const searchRef = useRef(null);

  // Close search on outside click
  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleBookmark = (id) =>
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);

  // Search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allNews.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter by active category
  const filteredNews = useMemo(() => {
    if (showBookmarks) return allNews.filter((a) => bookmarks.includes(a.id));
    if (activeCategory === "all") return allNews;
    return allNews.filter((a) => a.category === activeCategory);
  }, [activeCategory, showBookmarks, bookmarks]);

  const byCategory = (cat) => allNews.filter((a) => a.category === cat);
  const featuredNews = allNews.filter((a) => a.featured);
  const breakingNews = allNews.filter((a) => a.breaking);

  const isSearching = searchQuery.trim().length > 0;
  const displayNews = isSearching ? searchResults : filteredNews;

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .news-card-enter { animation: fadeIn 0.3s ease; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ══════════ MASTHEAD ══════════ */}
        <div className="bg-white border-b border-ink/10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">

            {/* Top bar */}
            <div className="flex items-center justify-between py-3 border-b border-ink/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: "linear-gradient(135deg,#0E0E10,#FF6B00)" }}>J</div>
                <div>
                  <span className="text-sm font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                    Jovo<span className="text-[#0E0E10]">News</span>
                  </span>
                  <span className="hidden md:inline text-[10px] text-ink/40 ml-2">Your campus & world in one feed</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowBookmarks(!showBookmarks); setActiveCategory("all"); }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${showBookmarks ? "bg-yellow-50 text-yellow-600" : "text-ink/50 hover:text-ink"}`}>
                  <FaBookmark size={11} />
                  <span className="hidden sm:inline">Saved ({bookmarks.length})</span>
                </button>
                <div className="text-[10px] text-ink/40 hidden md:block">
                  {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>

            {/* Breaking ticker */}
            <div className="py-0">
              <BreakingTicker />
            </div>
          </div>
        </div>

        {/* ══════════ SEARCH + CATEGORY NAV ══════════ */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-ink/10"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

              {/* Search */}
              <div className="relative flex-1 max-w-sm" ref={searchRef}>
                <div className={`flex items-center gap-2 rounded-2xl border transition-all duration-200 px-3 py-2.5 ${
                  searchFocused ? "border-[#0E0E10] shadow-[0_0_0_3px_rgba(180,34,37,0.1)] bg-white" : "border-ink/10 bg-sand"
                }`}>
                  <FiSearch size={15} className={searchFocused ? "text-[#0E0E10]" : "text-ink/40"} />
                  <input
                    type="text"
                    placeholder="Search news, topics, categories..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 text-ink/70"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-ink/40 hover:text-ink transition">
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {/* Search dropdown */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-ink/10 overflow-hidden z-50"
                    style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
                    {searchResults.length > 0 ? (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold px-4 pt-3 pb-1">
                          {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
                        </p>
                        {searchResults.slice(0, 5).map((a) => (
                          <div key={a.id} onMouseDown={() => { setSearchQuery(""); setSearchFocused(false); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-ink/5 cursor-pointer transition-colors">
                            <img src={a.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-ink line-clamp-2">{a.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold uppercase" style={{ color: getCategoryColor(a.category) }}>{a.tag}</span>
                                <span className="text-[9px] text-ink/40">{a.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <FiSearch size={24} className="text-ink/25 mx-auto mb-2" />
                        <p className="text-sm font-bold text-ink/50">No results for "{searchQuery}"</p>
                        <p className="text-xs text-ink/40 mt-1">Try different keywords</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 flex-nowrap scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {CATEGORIES.map(({ key, label, icon, color }) => (
                  <button
                    key={key}
                    onClick={() => { setActiveCategory(key); setShowBookmarks(false); setSearchQuery(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      activeCategory === key && !showBookmarks
                        ? "text-white shadow-soft"
                        : "bg-sand text-ink/60 hover:bg-ink/10"
                    }`}
                    style={activeCategory === key && !showBookmarks ? { background: color } : {}}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10">

          {/* ══════════ SEARCH RESULTS ══════════ */}
          {isSearching ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full bg-[#0E0E10]" />
                <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                  Search results for "{searchQuery}"
                </h2>
                <span className="text-sm text-ink/40">({searchResults.length} found)</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((a) => (
                    <div key={a.id} className="news-card-enter">
                      <NewsCard article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiSearch size={48} className="text-ink/25 mx-auto mb-4" />
                  <p className="text-lg font-bold text-ink/50">No results found</p>
                  <p className="text-sm text-ink/40 mt-1">Try searching for different keywords</p>
                </div>
              )}
            </div>

          ) : showBookmarks ? (
            // ══════════ BOOKMARKS ══════════
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full bg-yellow-400" />
                <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                  Saved Articles
                </h2>
                <span className="text-sm text-ink/40">({bookmarks.length})</span>
              </div>
              {bookmarks.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allNews.filter((a) => bookmarks.includes(a.id)).map((a) => (
                    <NewsCard key={a.id} article={a} onBookmark={toggleBookmark} bookmarked={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FaRegBookmark size={48} className="text-ink/25 mx-auto mb-4" />
                  <p className="text-lg font-bold text-ink/50">No saved articles yet</p>
                  <p className="text-sm text-ink/40 mt-1">Bookmark articles to read them later</p>
                </div>
              )}
            </div>

          ) : activeCategory !== "all" ? (
            // ══════════ SINGLE CATEGORY VIEW ══════════
            <div>
              {(() => {
                const cat = CATEGORIES.find((c) => c.key === activeCategory);
                const articles = byCategory(activeCategory);
                const featured = articles.find((a) => a.featured);
                const rest = articles.filter((a) => !a.featured);
                return (
                  <>
                    <SectionHeader
                      icon={cat.icon} title={cat.label} color={cat.color}
                      count={articles.length} onViewAll={() => {}} />
                    {featured && (
                      <div className="mb-6">
                        <HeroCard article={featured} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(featured.id)} />
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {rest.map((a) => (
                        <div key={a.id} className="news-card-enter">
                          <NewsCard article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} />
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

          ) : (
            // ══════════ ALL NEWS - FULL LAYOUT ══════════
            <>
              {/* ── HERO: Top Featured ── */}
              <div>
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Main hero */}
                  <div className="lg:col-span-2">
                    <HeroCard article={featuredNews[0]} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(featuredNews[0]?.id)} />
                  </div>
                  {/* Side featured stack */}
                  <div className="flex flex-col gap-4">
                    {featuredNews.slice(1, 4).map((a) => (
                      <NewsCard key={a.id} article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} compact />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── BREAKING NEWS STRIP ── */}
              {breakingNews.length > 0 && (
                <div className="bg-white rounded-3xl p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-[#0E0E10] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      <FiZap size={11} className="animate-pulse" /> BREAKING
                    </div>
                    <div className="h-px flex-1 bg-sand" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {breakingNews.map((a) => (
                      <NewsCard key={a.id} article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} compact />
                    ))}
                  </div>
                </div>
              )}

              {/* ── JOVO NEWS ── */}
              <div>
                <SectionHeader icon={<FaFire size={14} />} title="Jovo News" color="#FF6B00"
                  count={byCategory("jovo").length} onViewAll={() => setActiveCategory("jovo")} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {byCategory("jovo").slice(0, 4).map((a) => (
                    <NewsCard key={a.id} article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} />
                  ))}
                </div>
              </div>

              {/* ── VIDEO NEWS ── */}
              <div className="bg-gray-900 rounded-3xl p-6 md:p-8" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-[#0E0E10]" />
                    <div className="w-9 h-9 rounded-2xl bg-[#0E0E10] flex items-center justify-center">
                      <FiVideo size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>Video News</h2>
                      <p className="text-[10px] text-ink/40">Watch the latest stories</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-ink/40 hover:text-white transition flex items-center gap-1">
                    See all <FiArrowRight size={13} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {videoNews.map((v) => <VideoCard key={v.id} video={v} />)}
                </div>
              </div>

              {/* ── FUTO + NATIONAL SIDE BY SIDE ── */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* FUTO */}
                <div>
                  <SectionHeader icon={<FaUniversity size={14} />} title="FUTO News" color="#7C3AED"
                    count={byCategory("futo").length} onViewAll={() => setActiveCategory("futo")} />
                  <div className="space-y-3">
                    {byCategory("futo").slice(0, 4).map((a, i) => (
                      <NewsCard key={a.id} article={a} onBookmark={toggleBookmark}
                        bookmarked={bookmarks.includes(a.id)} compact={i > 0} />
                    ))}
                  </div>
                </div>
                {/* National */}
                <div>
                  <SectionHeader icon={<FaFlag size={14} />} title="National News" color="#059669"
                    count={byCategory("national").length} onViewAll={() => setActiveCategory("national")} />
                  <div className="space-y-3">
                    {byCategory("national").slice(0, 4).map((a, i) => (
                      <NewsCard key={a.id} article={a} onBookmark={toggleBookmark}
                        bookmarked={bookmarks.includes(a.id)} compact={i > 0} />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── INTERNATIONAL NEWS ── */}
              <div>
                <SectionHeader icon={<FaGlobe size={14} />} title="International News" color="#0EA5E9"
                  count={byCategory("international").length} onViewAll={() => setActiveCategory("international")} />
                <div className="grid lg:grid-cols-5 gap-4">
                  {/* Wide featured card */}
                  <div className="lg:col-span-2">
                    {byCategory("international").slice(0, 1).map((a) => (
                      <HeroCard key={a.id} article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} />
                    ))}
                  </div>
                  {/* 3 smaller cards */}
                  <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
                    {byCategory("international").slice(1, 4).map((a) => (
                      <NewsCard key={a.id} article={a} onBookmark={toggleBookmark} bookmarked={bookmarks.includes(a.id)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* ── TRENDING SIDEBAR ROW ── */}
              <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(#0E0E10,#FF6B00)" }} />
                  <div className="w-8 h-8 rounded-2xl bg-linear-to-br from-[#0E0E10] to-[#FF6B00] flex items-center justify-center">
                    <MdTrendingUp size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                    Trending Now
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {allNews.sort((a, b) => parseFloat(b.views) - parseFloat(a.views)).slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex flex-col gap-2 group cursor-pointer">
                      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                        <img src={a.image} alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-3xl font-semibold text-white/30"
                          style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-ink line-clamp-2 group-hover:text-[#0E0E10] transition-colors"
                        style={{ fontFamily: "'Instrument Sans',sans-serif" }}>
                        {a.title}
                      </p>
                      <span className="text-[10px] text-ink/40 flex items-center gap-1">
                        <FiEye size={9} /> {a.views}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewsPage;