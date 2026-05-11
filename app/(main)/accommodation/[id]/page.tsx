"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
// src/pages/AccommodationDetails.jsx
import { useState } from "react";
import { accommodations } from "@/data/accommodation";
import Footer from "@/components/layout/Footer";
import {
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiHeart,
  FiShare2,
  FiChevronRight,
  FiCheck,
  FiPhone,
  FiMail,
  FiWifi,
} from "react-icons/fi";
import {
  FaBed,
  FaBath,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaShieldAlt,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaCopy,
} from "react-icons/fa";
import {
  MdElectricBolt,
  MdOutlineKitchen,
  MdAir,
  MdFitnessCenter,
  MdLocalParking,
} from "react-icons/md";
import { GiGardeningShears } from "react-icons/gi";
import Image from "next/image";

/* ── Star renderer ── */
const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => {
      if (rating >= s)
        return <FaStar key={s} size={size} className="text-yellow-400" />;
      if (rating >= s - 0.5)
        return (
          <FaStarHalfAlt key={s} size={size} className="text-yellow-400" />
        );
      return <FaRegStar key={s} size={size} className="text-gray-300" />;
    })}
  </div>
);

/* ── Amenity map ── */
const amenityMap = {
  Pool: {
    icon: <FaSwimmingPool size={16} />,
    color: "bg-blue-50 text-blue-600",
  },
  WiFi: { icon: <FaWifi size={16} />, color: "bg-purple-50 text-purple-600" },
  Parking: {
    icon: <MdLocalParking size={16} />,
    color: "bg-gray-50 text-gray-600",
  },
  Security: {
    icon: <FaShieldAlt size={16} />,
    color: "bg-green-50 text-green-600",
  },
  Generator: {
    icon: <MdElectricBolt size={16} />,
    color: "bg-yellow-50 text-yellow-600",
  },
  "Air Conditioning": {
    icon: <MdAir size={16} />,
    color: "bg-cyan-50 text-cyan-600",
  },
  Garden: {
    icon: <GiGardeningShears size={16} />,
    color: "bg-emerald-50 text-emerald-600",
  },
  Gym: {
    icon: <MdFitnessCenter size={16} />,
    color: "bg-orange-50 text-orange-600",
  },
  Kitchen: {
    icon: <MdOutlineKitchen size={16} />,
    color: "bg-red-50 text-red-600",
  },
};

/* ── Mock reviews ── */
const mockReviews = [
  {
    id: 1,
    name: "Adaeze O.",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Absolutely stunning place! The amenities were top-notch and the location was perfect. Will definitely book again.",
    verified: true,
    helpful: 18,
  },
  {
    id: 2,
    name: "Emeka N.",
    rating: 4,
    date: "1 month ago",
    comment:
      "Great value for money. Very clean and well-maintained. The security was excellent throughout our stay.",
    verified: true,
    helpful: 12,
  },
  {
    id: 3,
    name: "Funmi A.",
    rating: 5,
    date: "2 months ago",
    comment:
      "One of the best shortlets I've ever stayed in Nigeria. Everything was as described, no surprises.",
    verified: false,
    helpful: 7,
  },
];

const AccommodationDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const navigate = (p: any) =>
    typeof p === "number" ? router.back() : router.push(p);

  const place = accommodations.find((a) => a.id === Number(id));

  const [wishlisted, setWishlisted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!place) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#F7F8FC" }}
      >
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
          🏠
        </div>
        <h2 className="text-xl font-bold text-gray-700">
          Accommodation not found
        </h2>
        <Link
          href="/accommodations"
          className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)" }}
        >
          Browse Accommodations
        </Link>
      </div>
    );
  }

  const suggested = accommodations
    .filter((a) => a.id !== place.id && a.type === place.type)
    .slice(0, 4)
    .concat(
      accommodations
        .filter((a) => a.id !== place.id && a.type !== place.type)
        .slice(0, 2),
    )
    .slice(0, 4);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => setBooked(false), 2500);
  };

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F7F8FC" }}>
        {/* ── Breadcrumb ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#B42225] transition-colors">
              Home
            </Link>
            <FiChevronRight size={12} />
            <Link
              href="/accommodations"
              className="hover:text-[#B42225] transition-colors"
            >
              Accommodations
            </Link>
            <FiChevronRight size={12} />
            <span className="text-gray-600 truncate max-w-37.5 md:max-w-xs">
              {place.name}
            </span>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}
          >
            <div className="grid lg:grid-cols-2 gap-0">
              {/* ── Left: Image ── */}
              <div className="relative min-h-72 md:min-h-96 lg:min-h-130 overflow-hidden lg:rounded-tl-3xl lg:rounded-bl-3xl">
                <Image
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  width={600}
                  height={400}
                  style={{ minHeight: "288px" }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                {/* Type badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {place.type}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setWishlisted(!wishlisted)}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <FiHeart
                      size={16}
                      className={
                        wishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShareOpen(!shareOpen)}
                      className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <FiShare2 size={16} className="text-gray-500" />
                    </button>
                    {shareOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShareOpen(false)}
                        />
                        <div
                          className="absolute top-10 right-0 bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-1 w-44 z-30"
                          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
                        >
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 mb-1">
                            Share via
                          </p>
                          {[
                            {
                              icon: (
                                <FaWhatsapp
                                  className="text-green-500"
                                  size={15}
                                />
                              ),
                              label: "WhatsApp",
                            },
                            {
                              icon: (
                                <FaFacebook
                                  className="text-blue-600"
                                  size={15}
                                />
                              ),
                              label: "Facebook",
                            },
                            {
                              icon: (
                                <FaTwitter className="text-sky-500" size={15} />
                              ),
                              label: "Twitter",
                            },
                            {
                              icon: (
                                <FaCopy className="text-gray-500" size={15} />
                              ),
                              label: "Copy Link",
                            },
                          ].map(({ icon, label }) => (
                            <button
                              key={label}
                              onClick={() => setShareOpen(false)}
                              className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                            >
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Stars rating={place.rating} size={14} />
                    <span className="text-white font-bold text-sm">
                      {place.rating}
                    </span>
                    <span className="text-white/60 text-xs">
                      ({place.reviews} reviews)
                    </span>
                  </div>
                  <h1
                    className="text-xl md:text-2xl font-black text-white leading-tight"
                    style={{ fontFamily: "'Georgia',serif" }}
                  >
                    {place.name}
                  </h1>
                  <p className="flex items-center gap-1.5 text-white/70 text-sm mt-1">
                    <FiMapPin size={13} className="text-[#FF8C00] shrink-0" />{" "}
                    {place.location}
                  </p>
                </div>
              </div>

              {/* ── Right: Details ── */}
              <div className="p-5 md:p-7 lg:p-8 flex flex-col gap-5">
                {/* Price + type */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                      Annual Rate
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl md:text-4xl font-black text-gray-900">
                        ₦{place.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 mb-1">/year</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ≈ ₦{Math.round(place.price / 12).toLocaleString()}/month
                    </p>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-black text-white shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF8C00)",
                    }}
                  >
                    {place.type}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: <FaBed size={18} />,
                      label: "Bedrooms",
                      value: place.beds,
                    },
                    {
                      icon: <FaBath size={18} />,
                      label: "Bathrooms",
                      value: place.baths,
                    },
                    {
                      icon: <FaStar size={18} />,
                      label: "Rating",
                      value: place.rating,
                    },
                  ].map(({ icon, label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 text-center"
                    >
                      <span className="text-[#B42225]">{icon}</span>
                      <span className="text-lg font-black text-gray-900">
                        {value}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-2xl bg-gray-100">
                  {["overview", "amenities", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                        activeTab === tab
                          ? "text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      style={
                        activeTab === tab
                          ? {
                              background:
                                "linear-gradient(135deg,#B42225,#FF8C00)",
                            }
                          : {}
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div
                  className="flex-1 overflow-y-auto"
                  style={{ maxHeight: "220px" }}
                >
                  {/* Overview */}
                  {activeTab === "overview" && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {place.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Property Type", value: place.type },
                          {
                            label: "Location",
                            value: place.location.split(",")[0],
                          },
                          {
                            label: "Bedrooms",
                            value: `${place.beds} bed${place.beds > 1 ? "s" : ""}`,
                          },
                          {
                            label: "Bathrooms",
                            value: `${place.baths} bath${place.baths > 1 ? "s" : ""}`,
                          },
                          { label: "Availability", value: "Available Now" },
                          { label: "Lease Term", value: "12 Months" },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="bg-gray-50 rounded-xl p-3"
                          >
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">
                              {label}
                            </p>
                            <p className="text-xs font-bold text-gray-800 mt-0.5">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {activeTab === "amenities" && (
                    <div className="grid grid-cols-2 gap-2">
                      {place.amenities.map((a) => {
                        const meta = amenityMap[a] || {
                          icon: <FiCheck size={16} />,
                          color: "bg-gray-50 text-gray-600",
                        };
                        return (
                          <div
                            key={a}
                            className={`flex items-center gap-2.5 p-3 rounded-xl ${meta.color}`}
                          >
                            {meta.icon}
                            <span className="text-xs font-bold">{a}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reviews */}
                  {activeTab === "reviews" && (
                    <div className="space-y-3">
                      {mockReviews.map((r) => (
                        <div
                          key={r.id}
                          className="border border-gray-100 rounded-xl p-3"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg,#B42225,#FF8C00)",
                              }}
                            >
                              {r.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">
                                {r.name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Stars rating={r.rating} size={9} />
                                <span className="text-[10px] text-gray-400">
                                  {r.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {r.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2 border-t border-gray-100">
                  <button
                    onClick={handleBook}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all duration-300 ${
                      booked
                        ? "bg-green-500 scale-95"
                        : "hover:opacity-90 hover:scale-[1.01] active:scale-95"
                    }`}
                    style={
                      !booked
                        ? {
                            background:
                              "linear-gradient(135deg,#B42225,#FF8C00)",
                            boxShadow: "0 6px 20px rgba(180,34,37,0.3)",
                          }
                        : {}
                    }
                  >
                    {booked ? (
                      <>
                        <FiCheck size={15} /> Booking Request Sent!
                      </>
                    ) : (
                      "Book Now"
                    )}
                  </button>
                  <a
                    href="https://wa.me/2348000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90 shrink-0"
                    style={{ background: "#25D366" }}
                  >
                    <FaWhatsapp size={16} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "", label: "Secure Booking", sub: "100% Protected" },
              { icon: "", label: "Verified Listing", sub: "JOVO Assured" },
              { icon: "", label: "24/7 Support", sub: "Always available" },
              { icon: "", label: "Easy Cancellation", sub: "Flexible terms" },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="text-xs font-black text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Similar Accommodations ── */}
        {suggested.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-10">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-1 h-7 rounded-full"
                style={{
                  background: "linear-gradient(180deg,#FF8C00,#B42225)",
                }}
              />
              <h2
                className="text-lg md:text-xl font-black text-gray-900"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Similar Accommodations
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {suggested.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/accommodation/${item.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.07)" }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      width={300}
                      height={225}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {item.type}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      <FaStar size={8} className="text-yellow-500" />{" "}
                      {item.rating}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-black text-gray-900 line-clamp-1 group-hover:text-[#B42225] transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                      <FiMapPin size={9} className="text-[#B42225]" />{" "}
                      {item.location.split(",")[0]}
                    </p>
                    <p className="text-sm font-black text-[#B42225] mt-1.5">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AccommodationDetails;
