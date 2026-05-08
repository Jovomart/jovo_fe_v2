'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  FiBox, FiSmartphone, FiHeart, FiTv, FiShoppingBag, FiMonitor, FiPlay, FiGrid,
  FiArrowRight, FiVolume2, FiVolumeX, FiChevronLeft, FiChevronRight, FiX,
  FiCoffee, FiPackage, FiWind, FiDroplet, FiTruck, FiHome, FiBriefcase,
} from "react-icons/fi";
import { MdOutlineLocalOffer, MdFlashOn } from "react-icons/md";

interface Category {
  name: string;
  icon: JSX.Element;
  image: string;
  path: string;
  color: string;
}

interface Slide {
  id: number;
  video: string;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  ctaPath: string;
  accent: string;
}

const categories: Category[] = [
  { name: "Appliances", icon: <FiBox size={15} />, image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=1000&auto=format&fit=crop&q=60", path: "/appliances-deals", color: "#FF8C00" },
  { name: "Phones & Tablets", icon: <FiSmartphone size={15} />, image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=600&auto=format&fit=crop&q=60", path: "/phone-deals", color: "#3B82F6" },
  { name: "Health & Beauty", icon: <FiHeart size={15} />, image: "https://plus.unsplash.com/premium_photo-1679134540232-c6e66ceee11c?w=600", path: "/beauty-deals", color: "#EC4899" },
  { name: "Electronics", icon: <FiTv size={15} />, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60", path: "/electronic-deals", color: "#8B5CF6" },
  { name: "Fashion", icon: <FiShoppingBag size={15} />, image: "https://images.unsplash.com/photo-1751522937993-46b83342398b?w=600&auto=format&fit=crop&q=60", path: "/fashion-deals", color: "#B42225" },
  { name: "Computing", icon: <FiMonitor size={15} />, image: "https://images.unsplash.com/photo-1640955014216-75201056c829?w=1000&auto=format&fit=crop&q=60", path: "/computing-deals", color: "#06B6D4" },
  { name: "Gaming", icon: <FiPlay size={15} />, image: "https://images.unsplash.com/photo-1629429407756-4a7703614972?w=600&auto=format&fit=crop&q=60", path: "/gaming-deals", color: "#10B981" },
  { name: "All Categories", icon: <FiGrid size={15} />, image: "https://plus.unsplash.com/premium_photo-1664201889896-6a42c19e953a?w=700&auto=format&fit=crop&q=60", path: "#", color: "#F59E0B" },
];

const additionalCategories = [
  { name: "Drinks & Beverages", icon: <FiCoffee size={18} />, path: "/drink-deals", color: "#8B4513", description: "Soft drinks, juices, energy drinks" },
  { name: "Perishables", icon: <FiPackage size={18} />, path: "/perishable", color: "#22C55E", description: "Fresh food, vegetables, dairy" },
  { name: "Personal Care", icon: <FiWind size={18} />, path: "/personal-care", color: "#F43F5E", description: "Skincare, hygiene, grooming" },
  { name: "Cleaning & Hygiene", icon: <FiDroplet size={18} />, path: "/cleaning-hygiene", color: "#3B82F6", description: "Detergents, cleaning supplies" },
  { name: "Groceries", icon: <FiShoppingBag size={18} />, path: "/groceries", color: "#F59E0B", description: "Pantry staples, snacks, cooking essentials" },
  { name: "Services", icon: <FiBriefcase size={18} />, path: "/services", color: "#8B5CF6", description: "Tutoring, repairs, photography" },
  { name: "Logistics", icon: <FiTruck size={18} />, path: "/logistics", color: "#06B6D4", description: "Delivery, shipping, courier services" },
  { name: "Accommodation", icon: <FiHome size={18} />, path: "/accommodations", color: "#EC4899", description: "Hostels, apartments, short-let" },
];

const slides: Slide[] = [
  { id: 1, video: "https://assets.mixkit.co/videos/242/242-720.mp4", label: "NEW ARRIVALS", headline: "Shop the Latest\nTech & Gadgets", sub: "Exclusive deals on phones, laptops and more", cta: "Shop Now", ctaPath: "/electronic-deals", accent: "#FF8C00" },
  { id: 2, video: "https://assets.mixkit.co/videos/23509/23509-720.mp4", label: "LATEST NEWS", headline: "Stay Updated with\nJOVO News", sub: "Campus events, product launches, and exclusive offers", cta: "Read News", ctaPath: "/news", accent: "#3B82F6" },
  { id: 3, video: "https://assets.mixkit.co/videos/44541/44541-720.mp4", label: "FLASH SALES", headline: "Up to 60% Off\nFashion & Beauty", sub: "Limited time deals ending soon", cta: "Grab Deals", ctaPath: "/flash-sales", accent: "#B42225" },
  { id: 4, video: "https://assets.mixkit.co/videos/4198/4198-720.mp4", label: "ACCOMMODATION", headline: "Find Your\nPerfect Stay", sub: "Hostels, apartments, and short-let accommodations near campus", cta: "Find Accommodation", ctaPath: "/accommodations", accent: "#D97706" },
  { id: 5, video: "https://assets.mixkit.co/videos/36425/36425-720.mp4", label: "CAMPUS DELIVERY", headline: "Fast Delivery\nRight to Your Door", sub: "Within FUTO campus in under 30 minutes", cta: "Learn More", ctaPath: "/logistics", accent: "#10B981" },
  { id: 6, video: "https://assets.mixkit.co/videos/49301/49301-720.mp4", label: "CAMPUS SERVICES", headline: "Book Services\nInstantly", sub: "Cleaning, repairs, tutoring & more - all on campus", cta: "Explore Services", ctaPath: "/services", accent: "#8B5CF6" },
  { id: 7, video: "https://assets.mixkit.co/videos/4519/4519-720.mp4", label: "CAMPUS GUIDE", headline: "Your Ultimate\nCampus Guide", sub: "Discover the best spots, events, and student resources", cta: "Explore Guide", ctaPath: "/campus-guide", accent: "#EC4899" },
];

const HeroSection = () => {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const { isSeller } = useContext(AuthContext);
  const [current, setCurrent] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(true);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState<boolean>(false);
  const desktopVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  // Handle desktop video playback
  useEffect(() => {
    const videos = desktopVideoRefs.current;
    videos.forEach((video, idx) => {
      if (!video) return;
      if (idx === current) {
        video.currentTime = 0;
        video.play().catch(err => console.log("Play error:", err));
      } else {
        video.pause();
      }
    });
  }, [current]);

  // Handle mobile video playback
  useEffect(() => {
    const videos = mobileVideoRefs.current;
    videos.forEach((video, idx) => {
      if (!video) return;
      if (idx === current) {
        video.currentTime = 0;
        video.play().catch(err => console.log("Play error:", err));
      } else {
        video.pause();
      }
    });
  }, [current]);

  // Initial play for desktop
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstVideo = desktopVideoRefs.current[0];
      if (firstVideo) {
        firstVideo.play().catch(() => {});
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initial play for mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstVideo = mobileVideoRefs.current[0];
      if (firstVideo) {
        firstVideo.play().catch(() => {});
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (cat: Category) => {
    if (cat.name === "All Categories") {
      setShowAllCategoriesModal(true);
    } else {
      navigate(cat.path);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = "none";
    if (target.nextSibling && target.nextSibling instanceof HTMLElement) {
      target.nextSibling.style.display = "flex";
    }
  };

  const slide = slides[current];

  return (
    <>
      <style>{`
        @keyframes hero-fade-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hero-fade-in { from { opacity:0; } to { opacity:1; } }
        @keyframes pill-in { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes modalSlideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .hero-label { animation: hero-fade-up 0.5s ease both; animation-delay:0.1s; }
        .hero-title { animation: hero-fade-up 0.55s ease both; animation-delay:0.22s; }
        .hero-sub { animation: hero-fade-up 0.55s ease both; animation-delay:0.34s; }
        .hero-cta { animation: hero-fade-up 0.55s ease both; animation-delay:0.46s; }
        .hero-dots { animation: hero-fade-in 0.4s ease both; animation-delay:0.5s; }
      `}</style>

      <section className="w-full" style={{ fontFamily: "'DM Sans',sans-serif" }}>
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:block relative w-full" style={{ height: "80vh", maxHeight: "720px", minHeight: "560px" }}>
          <div className="absolute inset-0 overflow-hidden">
            {slides.map((s, i) => (
              <video
                key={`desktop-${s.id}`}
                ref={(el) => { desktopVideoRefs.current[i] = el; }}
                src={s.video}
                loop
                muted={muted}
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                style={{ opacity: i === current ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.05) 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
          </div>

          {/* Category Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-52 z-30 flex flex-col justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-6">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-4 px-1">Categories</p>
              <div className="space-y-0.5">
                {categories.map((cat, i) => (
                  <button key={cat.name} onClick={() => handleCategoryClick(cat)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group transition-all duration-150 hover:bg-white/10 cursor-pointer">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-110" style={{ background: `${cat.color}22`, color: cat.color }}>{cat.icon}</div>
                    <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors leading-tight">{cat.name}</span>
                    <FiArrowRight size={11} className="ml-auto text-white/0 group-hover:text-white/50 transition-all group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex items-center" style={{ paddingLeft: "224px" }}>
            <div className="max-w-lg px-10" key={current}>
              <div className="hero-label inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] px-3 py-1.5 rounded-full mb-5" style={{ background: `${slide.accent}25`, border: `1px solid ${slide.accent}50`, color: slide.accent }}>
                <MdFlashOn size={12} /> {slide.label}
              </div>
              <h1 className="hero-title font-black text-white leading-[1.05] mb-4" style={{ fontSize: "clamp(2.2rem,3.5vw,3.4rem)", fontFamily: "'Georgia',serif", whiteSpace: "pre-line", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{slide.headline}</h1>
              <p className="hero-sub text-white/55 text-base mb-8 leading-relaxed">{slide.sub}</p>
              <div className="hero-cta flex items-center gap-3">
                <button onClick={() => navigate(slide.ctaPath)} className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.03] active:scale-95 cursor-pointer" style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`, boxShadow: `0 8px 28px ${slide.accent}55` }}>{slide.cta} <FiArrowRight size={15} /></button>
                <button onClick={() => router.push("/flash-sales")} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/8 transition-all cursor-pointer">Flash Sales</button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="hero-dots absolute bottom-8 right-8 z-30 flex items-center gap-3">
            <button onClick={() => setMuted(!muted)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer">
              {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
            </button>
            <button onClick={prev} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer"><FiChevronLeft size={16} /></button>
            <button onClick={next} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm cursor-pointer"><FiChevronRight size={16} /></button>
            <div className="flex items-center gap-1.5 ml-1">
              {slides.map((_, i) => (<button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-400 cursor-pointer" style={{ width: i === current ? "24px" : "7px", height: "7px", background: i === current ? slide.accent : "rgba(255,255,255,0.35)" }} />))}
            </div>
          </div>

          {/* Slide Counter */}
          <div className="absolute top-6 right-8 z-30 flex items-center gap-2">
            <span className="text-white font-black text-lg" style={{ fontFamily: "'Georgia',serif" }}>{String(current + 1).padStart(2, "0")}</span>
            <div className="w-12 h-px bg-white/20 relative overflow-hidden"><div className="absolute top-0 left-0 h-full bg-white/70 transition-all duration-700" style={{ width: `${((current + 1) / slides.length) * 100}%` }} /></div>
            <span className="text-white/35 text-sm">{String(slides.length).padStart(2, "0")}</span>
          </div>

          {/* Stats */}
          <div className="absolute bottom-8 left-56 z-30 flex items-center gap-2">
            {[
              { icon: <MdFlashOn size={13} />, text: "Flash Sales Live" },
              { icon: <MdOutlineLocalOffer size={13} />, text: "50K+ Products" },
              { icon: <FiShoppingBag size={13} />, text: "Free Campus Pickup" },
            ].map((s, i) => (<div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full" style={{ animation: `pill-in 0.4s ease both`, animationDelay: `${0.6 + i * 0.1}s` }}><span style={{ color: slide.accent }}>{s.icon}</span>{s.text}</div>))}
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="md:hidden">
          <div className="relative w-full overflow-hidden" style={{ height: "75vw", maxHeight: "480px", minHeight: "280px" }}>
            {slides.map((s, i) => (
              <video
                key={`mobile-${s.id}`}
                ref={(el) => { mobileVideoRefs.current[i] = el; }}
                src={s.video}
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: i === current ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)" }} />
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-white font-black text-xs">{current + 1}</span><span className="text-white/40 text-xs">/</span><span className="text-white/40 text-xs">{slides.length}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10" key={`mob-${current}`}>
              <div className="hero-label inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[2px] px-2.5 py-1 rounded-full mb-2" style={{ background: `${slide.accent}30`, border: `1px solid ${slide.accent}50`, color: slide.accent }}><MdFlashOn size={10} /> {slide.label}</div>
              <h2 className="hero-title text-white font-black text-xl leading-tight mb-1" style={{ fontFamily: "'Georgia',serif", whiteSpace: "pre-line" }}>{slide.headline}</h2>
              <p className="hero-sub text-white/50 text-xs mb-3">{slide.sub}</p>
              <button onClick={() => navigate(slide.ctaPath)} className="hero-cta flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs text-white" style={{ background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}bb)`, boxShadow: `0 4px 16px ${slide.accent}44` }}>{slide.cta} <FiArrowRight size={13} /></button>
            </div>
            <div className="hero-dots absolute bottom-4 right-4 z-10 flex gap-1">
              {slides.map((_, i) => (<button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-300" style={{ width: i === current ? "18px" : "5px", height: "5px", background: i === current ? slide.accent : "rgba(255,255,255,0.4)" }} />))}
            </div>
          </div>

          {/* Mobile Categories */}
          <div className="px-4 py-4" style={{ background: "#fff" }}>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {categories.map((cat) => (
                <button key={cat.name} onClick={() => handleCategoryClick(cat)} className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden transition-all group-hover:scale-105 group-active:scale-95" style={{ border: `1.5px solid ${cat.color}25` }}>
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={handleImageError} />
                    <div className="w-full h-full hidden items-center justify-center text-white font-bold text-xs" style={{ background: cat.color }}>{cat.name.charAt(0)}</div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight w-14">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Promo Strip */}
          <div className="overflow-hidden relative" style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#150500 40%,#2a0e00 100%)", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none opacity-25" style={{ background: "radial-gradient(circle,#FF8C00,transparent 65%)" }} />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full pointer-events-none opacity-15" style={{ background: "radial-gradient(circle,#B42225,transparent 65%)" }} />
            <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,transparent,#B42225,#FF8C00,transparent)" }} />
            <div className="relative z-10 px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)", boxShadow: "0 4px 14px rgba(180,34,37,0.5)" }}><FiShoppingBag size={15} className="text-white" /></div>
                  <div><div className="flex items-center gap-1.5"><p className="text-white font-black text-sm leading-tight">Sell on JOVO</p><span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.3)", color: "#FF8C00" }}>FREE</span></div><p className="text-white/35 text-[10px] mt-0.5">Join 5,000+ campus sellers</p></div>
                </div>
                <button onClick={() => navigate(isSeller ? "/seller/dashboard" : "/become-seller")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[11px] text-white shrink-0 transition-all active:scale-95 cursor-pointer" style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)", boxShadow: "0 4px 14px rgba(180,34,37,0.4)" }}>{isSeller ? "Go to Dashboard" : "Start Now"} <FiArrowRight size={11} /></button>
              </div>
              <div className="flex items-center gap-2">{[" Easy Listing", "Weekly Payouts", "Instant Reach"].map((t) => (<span key={t} className="text-[9px] font-semibold text-white/30 bg-white/5 border border-white/8 px-2 py-1 rounded-full whitespace-nowrap">{t}</span>))}</div>
            </div>
          </div>
        </div>
      </section>

      {/* All Categories Modal */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} onClick={() => setShowAllCategoriesModal(false)}>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl" style={{ animation: "modalSlideUp 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
            <div className="relative px-6 py-5 border-b" style={{ background: "linear-gradient(135deg,#1e1b4b,#4338CA)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-white">All Categories</h2><p className="text-white/50 text-xs mt-1">Explore everything JOVO has to offer</p></div><button onClick={() => setShowAllCategoriesModal(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"><FiX size={20} /></button></div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.filter((cat) => cat.name !== "All Categories").map((cat) => (
                  <button key={cat.name} onClick={() => { setShowAllCategoriesModal(false); navigate(cat.path); }} className="group p-4 rounded-2xl text-left transition-all hover:scale-105 cursor-pointer" style={{ background: "linear-gradient(135deg,#F9FAFB,#F3F4F6)", border: "1px solid #E5E7EB" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                    <p className="font-bold text-gray-800 text-sm mb-1">{cat.name}</p><p className="text-gray-400 text-[10px]">Shop {cat.name.toLowerCase()}</p>
                  </button>
                ))}
                {additionalCategories.map((cat) => (
                  <button key={cat.name} onClick={() => { setShowAllCategoriesModal(false); navigate(cat.path); }} className="group p-4 rounded-2xl text-left transition-all hover:scale-105 cursor-pointer" style={{ background: "linear-gradient(135deg,#F9FAFB,#F3F4F6)", border: "1px solid #E5E7EB" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                    <p className="font-bold text-gray-800 text-sm mb-1">{cat.name}</p><p className="text-gray-400 text-[10px]">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t" style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}><p className="text-center text-xs text-gray-400">{categories.filter((cat) => cat.name !== "All Categories").length + additionalCategories.length} categories available • Shop with confidence on JOVO</p></div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;