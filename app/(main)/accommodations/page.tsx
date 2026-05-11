"use client";
import { useRouter } from "next/navigation";
// src/pages/AccommodationsPage.jsx
import { useState, useMemo } from "react";
import { accommodations } from "@/data/accommodation";
import Footer from "@/components/layout/Footer";
import {
  FiSearch,
  FiX,
  FiMapPin,
  FiStar,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
} from "react-icons/fi";
import {
  FaBed,
  FaBath,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaShieldAlt,
} from "react-icons/fa";
import { MdElectricBolt } from "react-icons/md";
import Image from "next/image";

const TYPES = [
  "All",
  "Villa",
  "Apartment",
  "Mansion",
  "Studio",
  "Penthouse",
  "Duplex",
  "Cottage",
];
const SORT_OPTS = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Top Rated",
  "Most Reviewed",
];

const amenityIcon = (a) => {
  const map = {
    Pool: <FaSwimmingPool size={12} />,
    WiFi: <FaWifi size={12} />,
    Parking: <FaParking size={12} />,
    Security: <FaShieldAlt size={12} />,
    Generator: <MdElectricBolt size={12} />,
  };
  return map[a] || null;
};

/* ── Grid Card ── */
const AccomCard = ({ place, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
  >
    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
      <Image
        src={place.image}
        alt={place.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        width={300}
        height={225}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
        {place.type}
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 text-gray-900 text-xs font-black px-2 py-1 rounded-full">
        <FiStar size={11} className="text-yellow-500 fill-yellow-500" />
        {place.rating}
      </div>
    </div>

    <div className="p-4 md:p-5">
      <h3
        className="font-black text-gray-900 text-sm md:text-base leading-tight mb-1.5 group-hover:text-[#B42225] transition-colors"
        style={{ fontFamily: "'Georgia',serif" }}
      >
        {place.name}
      </h3>
      <p className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <FiMapPin size={11} className="text-[#B42225] shrink-0" />
        <span className="truncate">{place.location}</span>
      </p>

      <div className="flex items-center gap-2 md:gap-3 mb-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <FaBed size={11} className="text-gray-400 shrink-0" /> {place.beds}{" "}
          bed{place.beds > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <FaBath size={11} className="text-gray-400 shrink-0" /> {place.baths}{" "}
          bath{place.baths > 1 ? "s" : ""}
        </span>
        <span className="text-xs text-gray-400 hidden sm:inline">
          ({place.reviews} reviews)
        </span>
      </div>

      <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
        {place.amenities.slice(0, 3).map((a) => (
          <span
            key={a}
            className="flex items-center gap-1 text-[9px] md:text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full"
          >
            {amenityIcon(a)} {a}
          </span>
        ))}
        {place.amenities.length > 3 && (
          <span className="text-[9px] md:text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
            +{place.amenities.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <span className="text-base md:text-xl font-black text-gray-900">
            ₦{place.price.toLocaleString()}
          </span>
          <span className="text-[10px] md:text-xs text-gray-400"> /yr</span>
        </div>
        <button
          className="px-3 ml-2 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black text-white transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#B42225,#FF8C00)",
            boxShadow: "0 4px 14px rgba(180,34,37,0.3)",
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  </div>
);

/* ── List Row ── */
const AccomRow = ({ place, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-2xl overflow-hidden flex transition-all duration-200 hover:shadow-lg cursor-pointer"
    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
  >
    <div className="relative w-28 sm:w-40 md:w-52 shrink-0 overflow-hidden">
      <Image
        src={place.image}
        alt={place.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        width={208}
        height={208}
      />
      <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        {place.type}
      </div>
    </div>
    <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col justify-between min-w-0">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-black text-gray-900 text-sm md:text-base group-hover:text-[#B42225] transition-colors leading-tight"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            {place.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-yellow-50 text-yellow-700 text-[10px] md:text-xs font-black px-2 py-1 rounded-full">
            <FiStar size={9} className="fill-yellow-500 text-yellow-500" />{" "}
            {place.rating}
          </div>
        </div>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-1 mb-1.5">
          <FiMapPin size={10} className="text-[#B42225] shrink-0" />
          <span className="truncate">{place.location}</span>
        </p>
        <p className="text-xs text-gray-400 line-clamp-2 hidden sm:block">
          {place.description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 md:mt-3">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <FaBed size={10} /> {place.beds} beds
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <FaBath size={10} /> {place.baths} baths
          </span>
          <span className="text-xs text-gray-400 hidden md:inline">
            ({place.reviews} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="shrink-0">
            <span className="text-sm md:text-lg font-black text-gray-900">
              ₦{place.price.toLocaleString()}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400"> /yr</span>
          </div>
          <button
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)" }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
const AccommodationsPage = () => {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const [search, setSearch] = useState("");
  const [activeType, setType] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let list = [...accommodations];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q),
      );
    }
    if (activeType !== "All") list = list.filter((a) => a.type === activeType);
    if (sortBy === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low")
      list.sort((a, b) => b.price - a.price);
    else if (sortBy === "Top Rated") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "Most Reviewed")
      list.sort((a, b) => b.reviews - a.reviews);
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [search, activeType, sortBy]);

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FF8C00,transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/60 text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-5 tracking-widest uppercase">
            🏠 Accommodation Deals
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4 leading-tight"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            Find Your Perfect
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#FF8C00,#FFB347)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Home Away From Home
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-xl mb-6 md:mb-8">
            Browse premium shortlets, apartments, villas, and more across
            Nigeria's top cities.
          </p>

          {/* Search */}
          <div
            className="flex items-center gap-3 bg-white rounded-2xl px-4 md:px-5 py-3 md:py-4 max-w-xl"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
          >
            <FiSearch size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, location or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 transition shrink-0"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 md:gap-4 mt-6 md:mt-8">
            {[
              { num: `${accommodations.length}+`, label: "Listings" },
              { num: "6+", label: "Cities" },
              { num: "4.6★", label: "Avg Rating" },
            ].map(({ num, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span className="text-[#FF8C00] font-black text-xs md:text-sm">
                  {num}
                </span>
                <span className="text-white/40 text-[10px] md:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ background: "#F4F5F9" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Filter row */}
          <div className="flex flex-col gap-3 mb-5 md:mb-6">
            {/* Type tabs */}
            <div
              className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 flex-nowrap"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setType(type)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    activeType === type
                      ? "text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                  style={
                    activeType === type
                      ? {
                          background: "linear-gradient(135deg,#B42225,#FF8C00)",
                          boxShadow: "0 4px 12px rgba(180,34,37,0.3)",
                        }
                      : {}
                  }
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Sort + View */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500 font-semibold">
                <span className="text-gray-900 font-black">
                  {filtered.length}
                </span>{" "}
                result{filtered.length !== 1 ? "s" : ""}
                {activeType !== "All" ? ` · ${activeType}` : ""}
                {search ? ` · "${search}"` : ""}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
                  >
                    <FiFilter size={12} />
                    <span className="hidden sm:inline">{sortBy}</span>
                    <span className="sm:hidden">Sort</span>
                    <FiChevronDown
                      size={12}
                      className={`transition-transform ${showSort ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showSort && (
                    <div
                      className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 overflow-hidden z-20 w-44 md:w-52"
                      style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
                    >
                      {SORT_OPTS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortBy(opt);
                            setShowSort(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 md:py-3 text-xs font-semibold transition-colors hover:bg-gray-50 ${sortBy === opt ? "text-[#B42225] bg-red-50" : "text-gray-600"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                  {[
                    { mode: "grid", icon: <FiGrid size={14} /> },
                    { mode: "list", icon: <FiList size={14} /> },
                  ].map(({ mode, icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-2.5 md:px-3 py-2 transition-all ${viewMode === mode ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                      style={
                        viewMode === mode
                          ? {
                              background:
                                "linear-gradient(135deg,#B42225,#FF8C00)",
                            }
                          : {}
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl">
                🏠
              </div>
              <p className="font-black text-gray-700 text-base md:text-lg">
                No accommodations found
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setType("All");
                }}
                className="mt-4 px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-black text-white"
                style={{
                  background: "linear-gradient(135deg,#B42225,#FF8C00)",
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {filtered.map((place) => (
                <AccomCard
                  key={place.id}
                  place={place}
                  onClick={() => navigate(`/accommodation/${place.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4">
              {filtered.map((place) => (
                <AccomRow
                  key={place.id}
                  place={place}
                  onClick={() => navigate(`/accommodation/${place.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AccommodationsPage;
