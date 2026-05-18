"use client";

import Image from "next/image";
import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  FiSearch,
  FiX,
  FiMapPin,
  FiNavigation,
  FiClock,
  FiStar,
  FiPhone,
  FiChevronRight,
  FiInfo,
  FiExternalLink,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  FaUniversity,
  FaUtensils,
  FaMosque,
  FaRunning,
  FaWifi,
  FaRegBookmark,
  FaBookmark,
  FaStar,
} from "react-icons/fa";
import {
  MdOutlineSchool,
  MdStorefront,
  MdOutlineMedicalServices,
  MdSecurity,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface Location {
  id: string;
  category: string;
  name: string;
  shortName: string;
  zone: string;
  description: string;
  image: string;
  direction: string;
  landmark: string;
  openHours: string;
  rating: number;
  reviews: number;
  popular: boolean;
  featured: boolean;
  facilities: string[];
  tips: string;
  phone: string | null;
  walkTime: string;
  badge: string | null;
}

interface Review {
  id: string;
  campus_guide_id: string;
  rating: number;
  review: string;
  user_name?: string;
  username?: string;
  user?: { username?: string };
  created_at?: string;
}

interface ReviewForm {
  rating: number;
  review: string;
}

interface Category {
  key: string;
  label: string;
  icon: ReactNode;
  color: string;
}

interface QuickFact {
  icon: string;
  label: string;
  value: string;
}

interface CampusTip {
  icon: string;
  title: string;
  tip: string;
}

interface PopularRoute {
  from: string;
  to: string;
  time: string;
  steps: string[];
}

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const CATEGORY_API_MAP: Record<string, string> = {
  academic: "Academic",
  admin: "Admin",
  health: "Health",
  food: "Food",
  worship: "Worship",
  sports: "Sports",
  services: "Services",
  hostel: "Hostel",
};

const categories: Category[] = [
  {
    key: "all",
    label: "All Places",
    icon: <FiMapPin size={14} />,
    color: "#B42225",
  },
  {
    key: "academic",
    label: "Academic",
    icon: <MdOutlineSchool size={14} />,
    color: "#2563EB",
  },
  {
    key: "admin",
    label: "Admin",
    icon: <MdOutlineAdminPanelSettings size={14} />,
    color: "#7C3AED",
  },
  {
    key: "health",
    label: "Health",
    icon: <MdOutlineMedicalServices size={14} />,
    color: "#DC2626",
  },
  {
    key: "food",
    label: "Food & Eateries",
    icon: <FaUtensils size={14} />,
    color: "#D97706",
  },
  {
    key: "worship",
    label: "Worship",
    icon: <FaMosque size={14} />,
    color: "#059669",
  },
  {
    key: "sports",
    label: "Sports",
    icon: <FaRunning size={14} />,
    color: "#0891B2",
  },
  {
    key: "services",
    label: "Services",
    icon: <MdStorefront size={14} />,
    color: "#9333EA",
  },
  {
    key: "hostel",
    label: "Hostels",
    icon: <FaUniversity size={14} />,
    color: "#B45309",
  },
];

const quickFacts: QuickFact[] = [
  { icon: "🏫", label: "Founded", value: "1980" },
  { icon: "🎓", label: "Students", value: "~30,000" },
  { icon: "🏛️", label: "Faculties", value: "9 Schools" },
  { icon: "📍", label: "Location", value: "Ihiagwa, Owerri" },
  { icon: "🏆", label: "Ranking", value: "Top 15 Nigeria" },
  { icon: "🌐", label: "Website", value: "futo.edu.ng" },
];

const campusTips: CampusTip[] = [
  {
    icon: "🚶",
    title: "Getting Around",
    tip: "Most buildings are 5–15 min apart on foot. Campus buses run limited routes. Okadas (motorbikes) are common and affordable for longer distances.",
  },
  {
    icon: "📱",
    title: "Campus WiFi",
    tip: "Free WiFi is available at the ICT Centre and Library. Login with your student portal credentials. Speed is best in off-peak hours (before 9am, after 7pm).",
  },
  {
    icon: "💳",
    title: "Student ID",
    tip: "Your student ID is your passport on campus. Keep it on you at all times for access to facilities, the medical centre, library, and ATM student rates.",
  },
  {
    icon: "🌧️",
    title: "Rainy Season",
    tip: "FUTO gets heavy rains from April–October. The roads near SEET can flood. Wear comfortable waterproof shoes and always have an umbrella handy.",
  },
  {
    icon: "🕐",
    title: "Office Hours",
    tip: "Most administrative offices work strictly Mon–Fri, 8am–3pm. Student Affairs is most accessible on Tuesday and Thursday mornings.",
  },
  {
    icon: "🚨",
    title: "Emergency",
    tip: "Campus Security: +234 803 000 0030. Medical: +234 803 000 0020. Always save these numbers. The security post at the main gate operates 24/7.",
  },
];

const popularRoutes: PopularRoute[] = [
  {
    from: "Main Gate",
    to: "ICT Centre",
    time: "5 min",
    steps: [
      "Enter main gate",
      "Take first left",
      "Walk straight 300m",
      "ICT Centre on right",
    ],
  },
  {
    from: "Main Gate",
    to: "Senate Building",
    time: "6 min",
    steps: [
      "Enter main gate",
      "Walk straight on main boulevard",
      "Senate is the large white building ahead",
    ],
  },
  {
    from: "ICT Centre",
    to: "Library",
    time: "3 min",
    steps: [
      "Exit ICT Centre main door",
      "Turn right",
      "Walk 200m along the path",
      "Library entrance on your left",
    ],
  },
  {
    from: "SEET",
    to: "Medical Centre",
    time: "10 min",
    steps: [
      "Exit SEET main gate",
      "Turn left",
      "Walk past Senate Building",
      "Turn left at the T-junction",
      "Medical Centre is 150m ahead",
    ],
  },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=700&q=80";

/* ─────────────────────────────────────────────────────────────
   ADAPTER — maps raw API shape → typed Location
───────────────────────────────────────────────────────────── */
const adaptGuide = (g: Record<string, any>): Location => {
  const parseFacilities = (facilities: any): string[] => {
    if (!facilities) return [];
    if (Array.isArray(facilities)) {
      return facilities.map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          const keys = Object.keys(item);
          return keys.length > 0 ? keys[0] : String(item);
        }
        return String(item);
      });
    }
    if (typeof facilities === "object" && facilities !== null) {
      return Object.keys(facilities).filter(
        (key) => facilities[key] === true || facilities[key] === "true",
      );
    }
    return [];
  };

  return {
    id: String(g.id ?? ""),
    category: String(g.category ?? "").toLowerCase(),
    name: String(g.name ?? ""),
    shortName: String(g.short_name ?? g.name ?? ""),
    zone: String(g.location ?? g.zone ?? ""),
    description: String(g.about ?? g.description ?? ""),
    image: String(
      (Array.isArray(g.images) && g.images[0]) || g.image || FALLBACK_IMAGE,
    ),
    direction: String(g.directions ?? g.direction ?? ""),
    landmark: String(g.landmarks ?? g.landmark ?? ""),
    openHours: String(
      g.open_hours ?? g.operating_hours ?? "Mon–Fri: 8am – 5pm",
    ),
    rating: Number(g.average_rating ?? g.rating ?? 0),
    reviews: Number(g.review_count ?? g.total_reviews ?? 0),
    popular: Boolean(g.is_popular),
    featured: Boolean(g.is_must_know),
    facilities: parseFacilities(g.facilities),
    tips: String(g.tips ?? g.pro_tip ?? ""),
    phone: g.phone ?? g.phone_number ?? null,
    walkTime: String(g.walk_time ?? g.walking_time ?? ""),
    badge: g.badge ?? null,
  };
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const CAT_COLOR_MAP: Record<string, string> = {
  academic: "#2563EB",
  admin: "#7C3AED",
  health: "#DC2626",
  food: "#D97706",
  worship: "#059669",
  sports: "#0891B2",
  services: "#9333EA",
  hostel: "#B45309",
};
const getCatColor = (cat: string): string => CAT_COLOR_MAP[cat] ?? "#B42225";

const CAT_ICON_MAP: Record<string, ReactNode> = {
  academic: <MdOutlineSchool size={13} />,
  admin: <MdOutlineAdminPanelSettings size={13} />,
  health: <MdOutlineMedicalServices size={13} />,
  food: <FaUtensils size={12} />,
  worship: <FaMosque size={12} />,
  sports: <FaRunning size={12} />,
  services: <MdStorefront size={13} />,
  hostel: <FaUniversity size={12} />,
};
const getCatIcon = (cat: string): ReactNode =>
  CAT_ICON_MAP[cat] ?? <FiMapPin size={12} />;

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

interface StarInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}
const StarInput = ({ value, onChange, size = 20 }: StarInputProps) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <FaStar
          size={size}
          style={{ color: s <= value ? "#F59E0B" : "#E5E7EB" }}
        />
      </button>
    ))}
  </div>
);

const SkeletonCard = () => (
  <div
    className="bg-white rounded-3xl overflow-hidden animate-pulse"
    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
  >
    <div className="bg-gray-200" style={{ aspectRatio: "16/9" }} />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-5/6" />
    </div>
  </div>
);

interface LocationCardProps {
  loc: Location;
  onBookmark: (id: string) => void;
  bookmarked: boolean;
  onSelect: (loc: Location) => void;
}
const LocationCard = ({
  loc,
  onBookmark,
  bookmarked,
  onSelect,
}: LocationCardProps) => {
  const color = getCatColor(loc.category);
  return (
    <div
      onClick={() => onSelect(loc)}
      className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <Image
          src={loc.image}
          alt={loc.name}
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
          fill
          className="object-cover transition-transform duration-600 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full"
          style={{ background: color }}
        >
          {getCatIcon(loc.category)}
          {loc.category.toUpperCase()}
        </div>

        {loc.badge && (
          <div className="absolute top-3 right-10 bg-[#B42225] text-white text-[9px] font-black px-2 py-1 rounded-full">
            {loc.badge}
          </div>
        )}

        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onBookmark(loc.id);
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition"
        >
          {bookmarked ? (
            <FaBookmark size={11} className="text-yellow-400" />
          ) : (
            <FaRegBookmark size={11} className="text-white" />
          )}
        </button>

        {loc.walkTime && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
            <FiClock size={10} /> {loc.walkTime}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className="font-black text-gray-900 text-sm md:text-base leading-snug group-hover:text-[#B42225] transition-colors"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {loc.name}
          </h3>
          {loc.popular && (
            <span className="shrink-0 text-[9px] font-black bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full border border-orange-100">
              🔥 POPULAR
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <FiMapPin size={10} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-400 truncate">{loc.zone}</span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {loc.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                size={10}
                style={{
                  color: s <= Math.round(loc.rating) ? "#F59E0B" : "#E5E7EB",
                }}
              />
            ))}
            <span className="text-[11px] text-gray-600 font-bold ml-1">
              {loc.rating > 0 ? loc.rating.toFixed(1) : "—"}
            </span>
            <span className="text-[11px] text-gray-400">({loc.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FiClock size={9} />
            <span className="truncate max-w-[120px]">
              {loc.openHours.split("|")[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LocationModalProps {
  loc: Location;
  onClose: () => void;
  onBookmark: (id: string) => void;
  bookmarked: boolean;
}
const LocationModal = ({
  loc,
  onClose,
  onBookmark,
  bookmarked,
}: LocationModalProps) => {
  const [dirOpen, setDirOpen] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [form, setForm] = useState<ReviewForm>({ rating: 5, review: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [fullData, setFullData] = useState<Location>(loc);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const color = getCatColor(fullData.category);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const loadDetail = async (): Promise<void> => {
      setDetailLoading(true);
      try {
        const data: any = await apiService.getCampusGuideById(loc.id);
        const adaptedData = adaptGuide(data?.data ?? data);
        setFullData((prev) => ({
          ...prev,
          ...adaptedData,
          id: loc.id,
          name: adaptedData.name || loc.name,
          category: adaptedData.category || loc.category,
          zone: adaptedData.zone || loc.zone,
          description: adaptedData.description || loc.description,
          image: adaptedData.image || loc.image,
          direction: adaptedData.direction || loc.direction,
          walkTime: adaptedData.walkTime || loc.walkTime,
          openHours: adaptedData.openHours || loc.openHours,
          facilities:
            adaptedData.facilities.length > 0
              ? adaptedData.facilities
              : loc.facilities,
          tips: adaptedData.tips || loc.tips,
          phone: adaptedData.phone || loc.phone,
          badge: adaptedData.badge || loc.badge,
          rating: adaptedData.rating || loc.rating,
          reviews: adaptedData.reviews || loc.reviews,
        }));
      } catch (err) {
        console.error("Failed to load detail:", err);
      } finally {
        setDetailLoading(false);
      }
    };

    const loadReviews = async (): Promise<void> => {
      setReviewsLoading(true);
      try {
        const data: any = await apiService.getGuideReviews(loc.id, {
          limit: 20,
          verified_only: false,
        });
        const list: Review[] =
          data?.data?.reviews ?? data?.reviews ?? data?.data ?? [];
        setReviews(list);

        // ── fetch the user's own review separately ──────────────────────────
        // Guard: only attempt if a token exists. Even then, wrap in its own
        // try-catch so an expired/invalid token (401) doesn't surface as a
        // console error or crash the public review list above.
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;
        if (token) {
          try {
            const myData: any = await apiService.getMyCampusReviews({
              limit: 50,
            });
            const myList: Review[] =
              myData?.data?.reviews ?? myData?.reviews ?? myData?.data ?? [];
            const found = myList.find((r) => r.campus_guide_id === loc.id);
            if (found) {
              setMyReview(found);
              setForm({ rating: found.rating, review: found.review });
            }
          } catch (myReviewErr: unknown) {
            // Token exists but is expired or rejected by the server.
            // Clear the stale token and quietly treat the user as logged-out
            // so the review form hides gracefully instead of erroring.
            const msg = myReviewErr instanceof Error ? myReviewErr.message : "";
            if (
              msg.includes("401") ||
              msg.toLowerCase().includes("not authenticated") ||
              msg.toLowerCase().includes("authentication")
            ) {
              if (typeof window !== "undefined") {
                localStorage.removeItem("access_token");
              }
              setIsLoggedIn(false);
            }
            // No console.error — this is expected for expired sessions.
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadDetail();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.id]);

  const handleSubmit = async (): Promise<void> => {
    if (form.review.trim().length < 10) {
      setSubmitError("Review must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      if (myReview && editMode) {
        const res: any = await apiService.updateCampusReview(myReview.id, {
          rating: form.rating,
          review: form.review,
          campus_guide_id: loc.id,
        });
        // Merge API response with known form data so UI always reflects
        // what the user typed, even if the server returns a partial object.
        const updated: Review = {
          ...myReview,
          rating: form.rating,
          review: form.review,
          ...(res?.data ?? res),
        };
        setMyReview(updated);
        setReviews((prev) =>
          prev.map((r) => (r.id === myReview.id ? updated : r)),
        );
        // Update the header rating average instantly
        setFullData((prev) => {
          const otherCount = Math.max(0, prev.reviews - 1);
          const otherSum = prev.rating * prev.reviews - myReview.rating;
          const newRating = (otherSum + form.rating) / prev.reviews;
          return { ...prev, rating: Math.round(newRating * 10) / 10 };
        });
      } else {
        const res: any = await apiService.createCampusReview({
          rating: form.rating,
          review: form.review,
          campus_guide_id: loc.id,
        });
        // Build a complete review object from form data + whatever the API returns.
        // This guarantees the "Your Review" card renders immediately.
        const created: Review = {
          id: String(Date.now()), // temp id overwritten by API if provided
          campus_guide_id: loc.id,
          rating: form.rating,
          review: form.review,
          created_at: new Date().toISOString(),
          ...(res?.data ?? res),
        };
        setMyReview(created);
        setReviews((prev) => [created, ...prev]);
        // Update header rating + count instantly
        setFullData((prev) => {
          const newCount = prev.reviews + 1;
          const newRating =
            (prev.rating * prev.reviews + form.rating) / newCount;
          return {
            ...prev,
            reviews: newCount,
            rating: Math.round(newRating * 10) / 10,
          };
        });
      }
      setEditMode(false);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!myReview) return;
    try {
      await apiService.deleteCampusReview(myReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      setMyReview(null);
      setForm({ rating: 5, review: "" });
      setEditMode(false);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to delete review.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-2xl max-h-[92vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="relative shrink-0" style={{ height: "220px" }}>
          <Image
            src={fullData.image}
            alt={fullData.name}
            sizes="(max-width: 639px) 100vw, 600px"
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
          >
            <FiX size={18} />
          </button>

          <button
            onClick={() => onBookmark(fullData.id)}
            className="absolute top-4 right-14 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
          >
            {bookmarked ? (
              <FaBookmark size={14} className="text-yellow-400" />
            ) : (
              <FaRegBookmark size={14} />
            )}
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white"
                style={{ background: color }}
              >
                {fullData.category?.toUpperCase() || "LOCATION"}
              </span>
              {fullData.badge && (
                <span className="text-[10px] font-black bg-[#B42225] text-white px-2 py-0.5 rounded-full">
                  {fullData.badge}
                </span>
              )}
            </div>
            <h2
              className="text-xl font-black text-white leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {fullData.name || "Loading..."}
              {detailLoading && (
                <span className="ml-2 text-sm font-normal opacity-60">
                  loading…
                </span>
              )}
            </h2>
            <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
              <FiMapPin size={10} /> {fullData.zone || "Location"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar
                    key={s}
                    size={9}
                    style={{
                      color:
                        s <= Math.round(fullData.rating || 0)
                          ? "#F59E0B"
                          : "#E5E7EB",
                    }}
                  />
                ))}
              </div>
              <p className="text-sm font-black text-gray-900">
                {fullData.rating > 0 ? fullData.rating.toFixed(1) : "—"}
              </p>
              <p className="text-[10px] text-gray-400">
                {fullData.reviews || 0} reviews
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <FiClock size={16} className="mx-auto mb-1 text-gray-500" />
              <p className="text-[11px] font-bold text-gray-700 leading-tight">
                {fullData.openHours?.split("|")[0]?.trim() || "—"}
              </p>
              <p className="text-[10px] text-gray-400">Hours</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <FiNavigation size={16} className="mx-auto mb-1 text-gray-500" />
              <p className="text-[11px] font-bold text-gray-700">
                {fullData.walkTime || "—"}
              </p>
              <p className="text-[10px] text-gray-400">Walk time</p>
            </div>
          </div>

          {fullData.description && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                About
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {fullData.description}
              </p>
            </div>
          )}

          {fullData.facilities && fullData.facilities.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                Facilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {fullData.facilities.map((f, idx) => {
                  const formattedName = String(f)
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                  return (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: `${color}18`, color }}
                    >
                      <FiStar size={10} /> {formattedName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {fullData.direction && (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setDirOpen((o) => !o)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ background: color }}
                  >
                    <FiNavigation size={14} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900">
                    How to Get There
                  </h4>
                </div>
                {dirOpen ? (
                  <FiChevronUp size={16} className="text-gray-400" />
                ) : (
                  <FiChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              {dirOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 pt-3 leading-relaxed">
                    {fullData.direction}
                  </p>
                  {fullData.landmark && (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-2.5 text-xs text-blue-700">
                      <FiMapPin size={12} className="shrink-0" />
                      <span>
                        <strong>Landmark:</strong> {fullData.landmark}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {fullData.tips && (
            <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <span className="text-lg shrink-0">💡</span>
              <div>
                <p className="text-xs font-black text-amber-800 mb-1">
                  Pro Tip
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {fullData.tips}
                </p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Reviews{reviews.length > 0 ? ` (${reviews.length})` : ""}
            </h4>

            {isLoggedIn && (
              <div className="mb-4">
                {myReview && !editMode ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-blue-800">
                        Your Review
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditMode(true)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void handleDelete()}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          size={10}
                          style={{
                            color:
                              s <= (myReview.rating || 0)
                                ? "#F59E0B"
                                : "#E5E7EB",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {myReview.review}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-black text-gray-700">
                      {myReview ? "Edit Your Review" : "Leave a Review"}
                    </p>
                    <StarInput
                      value={form.rating}
                      onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
                    />
                    <textarea
                      value={form.review}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setForm((f) => ({ ...f, review: e.target.value }))
                      }
                      placeholder="Share your experience (min. 10 characters)…"
                      rows={3}
                      className="w-full text-xs border border-gray-200 rounded-xl p-3 outline-none focus:border-purple-400 resize-none text-gray-700 bg-white"
                    />
                    {submitError && (
                      <p className="text-[10px] text-red-500">{submitError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleSubmit()}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-60"
                        style={{ background: color }}
                      >
                        {submitting
                          ? "Submitting…"
                          : myReview
                            ? "Update Review"
                            : "Submit Review"}
                      </button>
                      {editMode && (
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setSubmitError("");
                            if (myReview)
                              setForm({
                                rating: myReview.rating,
                                review: myReview.review,
                              });
                          }}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {reviewsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-50 rounded-2xl p-4 space-y-2"
                  >
                    <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-full w-full" />
                    <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6">
                <FiStar size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">
                  No reviews yet. Be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews
                  .filter((r) => !myReview || r.id !== myReview.id)
                  .slice(0, 8)
                  .map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-gray-800">
                          {r.user_name ??
                            r.username ??
                            r.user?.username ??
                            "Anonymous"}
                        </p>
                        {r.created_at && (
                          <span className="text-[9px] text-gray-400">
                            {new Date(r.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar
                            key={s}
                            size={9}
                            style={{
                              color:
                                s <= (r.rating || 0) ? "#F59E0B" : "#E5E7EB",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {r.review}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {fullData.phone && (
            <a
              href={`tel:${fullData.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90"
              style={{ background: color }}
            >
              <FiPhone size={15} /> Call {fullData.shortName || fullData.name}
            </a>
          )}

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(fullData.name || "")}+Owerri`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm border-2 text-gray-700 hover:border-gray-400 transition"
            style={{ borderColor: "#E5E7EB" }}
          >
            <FiExternalLink size={15} /> Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const CampusGuidePage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showRoutes, setShowRoutes] = useState<boolean>(false);

  const [mustKnow, setMustKnow] = useState<Location[]>([]);
  const [popularLocs, setPopularLocs] = useState<Location[]>([]);
  const [allLocs, setAllLocs] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [dropdownResults, setDropdownResults] = useState<Location[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadSchoolId = async () => {
      try {
        const raw =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (raw) {
          const u = JSON.parse(raw) as Record<string, unknown>;
          if (typeof u.school_id === "string" && u.school_id) {
            setSchoolId(u.school_id);
            return;
          }
        }

        const token = localStorage.getItem("access_token");
        if (!token) return;

        const data: any = await apiService.getCurrentUser();
        const sid: string | undefined =
          data?.data?.school_id ?? data?.school_id;
        if (sid) setSchoolId(sid);
      } catch {
        // not logged in — proceed without school_id
      }
    };

    loadSchoolId();
  }, []);

  const fetchGuides = useCallback(
    async (search = "", cat = "all") => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { limit: 60 };
        if (schoolId) params.school_id = schoolId;
        if (search) params.search = search;
        if (cat !== "all") params.category = CATEGORY_API_MAP[cat];

        try {
          const data: any = await apiService.getCampusGuides(params);
          const payload = data?.data ?? data;

          setMustKnow(
            (
              (payload.must_know_locations ?? []) as Record<string, unknown>[]
            ).map(adaptGuide),
          );
          setPopularLocs(
            (
              (payload.popular_locations ?? []) as Record<string, unknown>[]
            ).map(adaptGuide),
          );
          setAllLocs(
            ((payload.all_locations ?? []) as Record<string, unknown>[]).map(
              adaptGuide,
            ),
          );
        } catch (err: any) {
          if (
            err.message?.includes("401") ||
            err.message?.includes("Authentication")
          ) {
            console.log("Auth error, retrying campus guide fetch...");
            const retryData: any = await apiService.getCampusGuides(params);
            const retryPayload = retryData?.data ?? retryData;
            setMustKnow(
              (retryPayload.must_know_locations ?? []).map(adaptGuide),
            );
            setPopularLocs(
              (retryPayload.popular_locations ?? []).map(adaptGuide),
            );
            setAllLocs((retryPayload.all_locations ?? []).map(adaptGuide));
          } else {
            throw err;
          }
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load campus guide. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [schoolId],
  );

  useEffect(() => {
    if (schoolId !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchGuides("", activeCategory);
    }
  }, [schoolId, activeCategory, fetchGuides]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDropdownResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const params: Record<string, unknown> = {
          search: searchQuery.trim(),
          limit: 8,
        };
        if (schoolId) params.school_id = schoolId;

        const data: any = await apiService.getCampusGuides(params);
        const payload = data?.data ?? data;
        setDropdownResults(
          ((payload.all_locations ?? []) as Record<string, unknown>[]).map(
            adaptGuide,
          ),
        );
      } catch {
        /* silent */
      }
    }, 380);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, schoolId]);

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleBookmark = (id: string): void =>
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );

  const bookmarkedLocs = useMemo<Location[]>(() => {
    const seen = new Set<string>();
    return [...mustKnow, ...popularLocs, ...allLocs].filter((l) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return bookmarks.includes(l.id);
    });
  }, [mustKnow, popularLocs, allLocs, bookmarks]);

  const isSearching = searchQuery.trim().length > 0;
  const skeletonCount = activeCategory === "all" ? 8 : 6;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .loc-enter { animation: fadeIn 0.3s ease; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {selectedLoc && (
        <LocationModal
          loc={selectedLoc}
          onClose={() => setSelectedLoc(null)}
          onBookmark={toggleBookmark}
          bookmarked={bookmarks.includes(selectedLoc.id)}
        />
      )}

      <div className="min-h-screen" style={{ background: "#F3F4F8" }}>
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 35%, #2d1460 65%, #3d1a8a 100%)",
            minHeight: "380px",
          }}
        >
          <div
            className="absolute -top-20 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#7C3AED,transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#B42225,transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-20">
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(124,58,237,0.3)",
                  border: "1px solid rgba(167,139,250,0.4)",
                }}
              >
                <FaUniversity className="text-purple-300" size={14} />
              </div>
              <span className="text-purple-300/70 text-xs font-bold uppercase tracking-widest">
                FUTO Campus
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-black text-white leading-tight mb-4"
              style={{
                fontFamily: "'Georgia', serif",
                textShadow: "0 4px 30px rgba(124,58,237,0.4)",
              }}
            >
              Campus
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#c4b5fd,#f0abfc,#c4b5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Guide
              </span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-md mb-8">
              Every building, office, eatery, and facility at Federal University
              of Technology, Owerri — with directions, tips, and more.
            </p>

            <div className="flex flex-wrap gap-3">
              {quickFacts.map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span>{icon}</span>
                  <span className="text-white/50">{label}:</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1440 50"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 L0,25 Q360,0 720,25 Q1080,50 1440,25 L1440,50 Z"
              fill="#F3F4F8"
            />
          </svg>
        </div>

        <div
          className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100"
          style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm" ref={searchRef}>
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all duration-200 ${
                    searchFocused
                      ? "border-purple-500 shadow-[0_0_0_3px_rgba(124,58,237,0.1)] bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <FiSearch
                    size={15}
                    className={
                      searchFocused ? "text-purple-500" : "text-gray-400"
                    }
                  />
                  <input
                    type="text"
                    placeholder="Search locations, buildings, services..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 text-gray-700"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    onFocus={() => setSearchFocused(true)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setDropdownResults([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {searchFocused && searchQuery.trim().length > 0 && (
                  <div
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-gray-100 overflow-hidden z-50"
                    style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
                  >
                    {dropdownResults.length > 0 ? (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-4 pt-3 pb-1">
                          {dropdownResults.length} location
                          {dropdownResults.length > 1 ? "s" : ""} found
                        </p>
                        {dropdownResults.slice(0, 6).map((l) => (
                          <div
                            key={l.id}
                            onMouseDown={() => {
                              setSelectedLoc(l);
                              setSearchQuery("");
                              setSearchFocused(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <Image
                              src={l.image}
                              alt=""
                              width={40}
                              height={40}
                              className="rounded-xl object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800">
                                {l.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className="text-[9px] font-bold uppercase"
                                  style={{ color: getCatColor(l.category) }}
                                >
                                  {l.category}
                                </span>
                                {l.walkTime && (
                                  <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                    <FiClock size={8} /> {l.walkTime}
                                  </span>
                                )}
                              </div>
                            </div>
                            <FiChevronRight
                              size={13}
                              className="text-gray-300 shrink-0"
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <FiSearch
                          size={24}
                          className="text-gray-300 mx-auto mb-2"
                        />
                        <p className="text-sm font-bold text-gray-500">
                          No results for &quot;{searchQuery}&quot;
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try &quot;Library&quot;, &quot;Cafeteria&quot;, or
                          &quot;Medical&quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="flex items-center gap-1.5 overflow-x-auto flex-nowrap pb-0.5 sm:pb-0 scrollbar-hide"
                style={
                  {
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  } as React.CSSProperties
                }
              >
                {categories.map(({ key, label, icon, color }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategory(key);
                      setShowBookmarks(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      activeCategory === key && !showBookmarks
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      activeCategory === key && !showBookmarks
                        ? { background: color }
                        : {}
                    }
                  >
                    {icon} {label}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setShowBookmarks((v) => !v);
                    setActiveCategory("all");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    showBookmarks
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaBookmark size={11} /> Saved ({bookmarks.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10">
          {error && !loading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
              <FiAlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => void fetchGuides(searchQuery, activeCategory)}
                className="ml-auto text-xs font-bold text-red-500 hover:text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          {showBookmarks ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full bg-yellow-400" />
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Saved Locations
                </h2>
              </div>
              {bookmarkedLocs.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bookmarkedLocs.map((l) => (
                    <LocationCard
                      key={l.id}
                      loc={l}
                      onBookmark={toggleBookmark}
                      bookmarked
                      onSelect={setSelectedLoc}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FaRegBookmark
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-lg font-bold text-gray-500">
                    No saved locations
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Bookmark locations to find them quickly
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {activeCategory === "all" && !isSearching && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-1 h-7 rounded-full"
                      style={{ background: "linear-gradient(#B42225,#7C3AED)" }}
                    />
                    <h2
                      className="text-xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      Must-Know Locations
                    </h2>
                  </div>
                  {loading ? (
                    <div className="grid md:grid-cols-3 gap-5">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : mustKnow.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-5">
                      {mustKnow.map((l) => (
                        <LocationCard
                          key={l.id}
                          loc={l}
                          onBookmark={toggleBookmark}
                          bookmarked={bookmarks.includes(l.id)}
                          onSelect={setSelectedLoc}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full bg-gray-300" />
                    <h2
                      className="text-xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {isSearching
                        ? `Results for "${searchQuery}"`
                        : activeCategory === "all"
                          ? "All Locations"
                          : categories.find((c) => c.key === activeCategory)
                              ?.label}
                    </h2>
                    {!loading && (
                      <span className="text-sm text-gray-400">
                        ({allLocs.length})
                      </span>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: skeletonCount }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : allLocs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {allLocs.map((l) => (
                      <div key={l.id} className="loc-enter">
                        <LocationCard
                          loc={l}
                          onBookmark={toggleBookmark}
                          bookmarked={bookmarks.includes(l.id)}
                          onSelect={setSelectedLoc}
                        />
                      </div>
                    ))}
                  </div>
                ) : !error ? (
                  <div className="text-center py-20">
                    <FiMapPin
                      size={48}
                      className="text-gray-300 mx-auto mb-4"
                    />
                    <p className="text-lg font-bold text-gray-500">
                      {isSearching
                        ? "No locations found"
                        : "No locations in this category yet"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isSearching
                        ? "Try a different search term"
                        : "Check back later"}
                    </p>
                  </div>
                ) : null}
              </div>

              {activeCategory === "all" && !isSearching && (
                <div
                  className="bg-white rounded-3xl p-6 md:p-8"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-7 rounded-full"
                        style={{
                          background: "linear-gradient(#0891B2,#2563EB)",
                        }}
                      />
                      <div className="w-9 h-9 rounded-2xl bg-blue-500 flex items-center justify-center">
                        <FiNavigation size={16} className="text-white" />
                      </div>
                      <h2
                        className="text-xl font-black text-gray-900"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        Popular Routes
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowRoutes((v) => !v)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
                    >
                      {showRoutes ? "Show less" : "Show all"}{" "}
                      <FiChevronRight size={13} />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(showRoutes
                      ? popularRoutes
                      : popularRoutes.slice(0, 4)
                    ).map((route, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-2xl p-4 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                            <FiNavigation size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">From</p>
                            <p className="text-xs font-black text-gray-800 truncate">
                              {route.from}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-xl bg-[#B42225] flex items-center justify-center shrink-0">
                            <FiMapPin size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">To</p>
                            <p className="text-xs font-black text-gray-800 truncate">
                              {route.to}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <FiClock size={10} className="text-blue-500" />
                          <span className="text-xs font-bold text-blue-600">
                            {route.time} walk
                          </span>
                        </div>
                        <div className="space-y-1">
                          {route.steps.map((step, si) => (
                            <div key={si} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {si + 1}
                              </span>
                              <p className="text-[10px] text-gray-600 leading-snug">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === "all" && !isSearching && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-1 h-7 rounded-full"
                      style={{ background: "linear-gradient(#D97706,#F59E0B)" }}
                    />
                    <div className="w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center">
                      <FiInfo size={16} className="text-white" />
                    </div>
                    <h2
                      className="text-xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      Survival Tips for FUTO
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campusTips.map((tip, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow"
                        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                      >
                        <span className="text-2xl mb-3 block">{tip.icon}</span>
                        <h4 className="text-sm font-black text-gray-900 mb-2">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {tip.tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === "all" && !isSearching && (
                <div
                  className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg,#0a0a0a 0%,#1a0a2e 50%,#B42225 100%)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <FiAlertCircle size={22} className="text-red-300" />
                      <h2
                        className="text-lg font-black"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        Emergency Contacts
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {(
                        [
                          {
                            label: "Campus Security",
                            phone: "+234 803 000 0030",
                            icon: <MdSecurity size={18} />,
                            color: "bg-red-500/20 border-red-400/30",
                          },
                          {
                            label: "Medical Centre",
                            phone: "+234 803 000 0020",
                            icon: <MdOutlineMedicalServices size={18} />,
                            color: "bg-blue-500/20 border-blue-400/30",
                          },
                          {
                            label: "Student Affairs",
                            phone: "+234 803 000 0010",
                            icon: <FaUniversity size={16} />,
                            color: "bg-purple-500/20 border-purple-400/30",
                          },
                          {
                            label: "ICT Centre",
                            phone: "+234 803 000 0001",
                            icon: <FaWifi size={16} />,
                            color: "bg-green-500/20 border-green-400/30",
                          },
                        ] as const
                      ).map(({ label, phone, icon, color }) => (
                        <a
                          key={label}
                          href={`tel:${phone}`}
                          className={`flex flex-col gap-2 p-4 rounded-2xl border backdrop-blur-sm hover:scale-105 transition-transform ${color}`}
                        >
                          <span className="text-white/70">{icon}</span>
                          <p className="text-white font-black text-sm">
                            {label}
                          </p>
                          <p className="text-white/60 text-xs">{phone}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CampusGuidePage;
