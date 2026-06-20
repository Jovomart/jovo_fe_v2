// app/services/dashboard/page.tsx
"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiStar,
  FiMapPin,
  FiClock,
  FiTool,
  FiToggleLeft,
  FiToggleRight,
  FiLoader,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiBell,
  FiPhone,
  FiHome,
  FiSettings,
  FiLogOut,
  FiBarChart2,
  FiChevronRight,
  FiMenu,
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiZap,
  FiUpload,
  FiImage,
  FiCamera,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaBroom,
  FaCut,
  FaTshirt,
  FaBolt,
  FaWrench,
  FaChalkboardTeacher,
  FaCamera,
  FaStar,
  FaTools,
  FaStore,
  FaCrown,
} from "react-icons/fa";
import {
  MdVerified,
  MdOutlineInventory2,
  MdOutlineDeliveryDining,
  MdOutlineSwapHoriz,
} from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

/* ─── types ─────────────────────────────────────────────────────── */
interface ProviderProfile {
  id: string;
  business_name: string;
  business_bio: string;
  logo_url?: string;
  cover_image_url?: string;
  whatsapp_number?: string;
  phone_number?: string;
  status?: string;
  provider_status?: string;
  account_status?: string;
  is_phone_verified?: boolean;
  is_active?: boolean;
  rating?: number;
  review_count?: number;
  service_category?: string[];
  [key: string]: any;
}

interface CategoryFromAPI {
  id: string;
  name: string;
  description?: string;
  category_type?: string;
  is_active?: boolean;
}

interface DisplayCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

interface ServiceData {
  id: string;
  display_name: string;
  category_id: string;
  description: string;
  price_type: string;
  starting_price: number;
  location: string;
  availability_schedule: Record<string, Array<{ start: string; end: string }>>;
  booking_mode: string;
  is_active: boolean;
}

/* ─── Fallback categories ─────────────────────────────────────────── */
const FALLBACK_CATEGORIES: DisplayCategory[] = [
  {
    id: "cleaning",
    name: "Cleaning",
    icon: <FaBroom size={14} />,
    gradient: "linear-gradient(135deg,#B42225,#FF6B00)",
  },
  {
    id: "salon",
    name: "Salon & Barber",
    icon: <FaCut size={14} />,
    gradient: "linear-gradient(135deg,#7C3AED,#A78BFA)",
  },
  {
    id: "laundry",
    name: "Laundry",
    icon: <FaTshirt size={14} />,
    gradient: "linear-gradient(135deg,#0891B2,#06B6D4)",
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: <FaBolt size={14} />,
    gradient: "linear-gradient(135deg,#D97706,#F59E0B)",
  },
  {
    id: "repair",
    name: "Repairs",
    icon: <FaWrench size={14} />,
    gradient: "linear-gradient(135deg,#059669,#10B981)",
  },
  {
    id: "tutoring",
    name: "Tutoring",
    icon: <FaChalkboardTeacher size={14} />,
    gradient: "linear-gradient(135deg,#2563EB,#60A5FA)",
  },
  {
    id: "photography",
    name: "Photography",
    icon: <FaCamera size={14} />,
    gradient: "linear-gradient(135deg,#DB2777,#F472B6)",
  },
];

const getIconForCategory = (categoryName: string): React.ReactNode => {
  const name = categoryName.toLowerCase();
  if (name.includes("clean")) return <FaBroom size={14} />;
  if (
    name.includes("salon") ||
    name.includes("barber") ||
    name.includes("hair")
  )
    return <FaCut size={14} />;
  if (name.includes("laundry") || name.includes("wash"))
    return <FaTshirt size={14} />;
  if (
    name.includes("electrical") ||
    name.includes("electrician") ||
    name.includes("electric")
  )
    return <FaBolt size={14} />;
  if (
    name.includes("repair") ||
    name.includes("fix") ||
    name.includes("handyman")
  )
    return <FaWrench size={14} />;
  if (
    name.includes("tutor") ||
    name.includes("teach") ||
    name.includes("education")
  )
    return <FaChalkboardTeacher size={14} />;
  if (name.includes("photo") || name.includes("camera"))
    return <FaCamera size={14} />;
  return <FaTools size={14} />;
};

const getGradientForCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes("clean")) return "linear-gradient(135deg,#B42225,#FF6B00)";
  if (name.includes("salon") || name.includes("barber"))
    return "linear-gradient(135deg,#7C3AED,#A78BFA)";
  if (name.includes("laundry"))
    return "linear-gradient(135deg,#0891B2,#06B6D4)";
  if (name.includes("electrical") || name.includes("electrician"))
    return "linear-gradient(135deg,#D97706,#F59E0B)";
  if (name.includes("repair")) return "linear-gradient(135deg,#059669,#10B981)";
  if (name.includes("tutor")) return "linear-gradient(135deg,#2563EB,#60A5FA)";
  if (name.includes("photo")) return "linear-gradient(135deg,#DB2777,#F472B6)";
  return "linear-gradient(135deg,#6B7280,#9CA3AF)";
};

/**
 * Flexible category matching:
 * allowedCategoryIds may contain UUIDs, slugs like "cleaning", or display names.
 * We match against both the category's id AND its name (case-insensitive, partial).
 */
function isCategoryAllowed(
  cat: DisplayCategory,
  allowedCategoryIds: string[],
): boolean {
  if (allowedCategoryIds.length === 0) return true; // no filter → show all
  return allowedCategoryIds.some((allowed) => {
    const a = allowed.toLowerCase().trim();
    const catId = cat.id.toLowerCase().trim();
    const catName = cat.name.toLowerCase().trim();
    return (
      catId === a || catName === a || catName.includes(a) || a.includes(catName)
    );
  });
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_SHORT: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
const PRICE_TYPES = [
  { val: "fixed", label: "Fixed Price" },
  { val: "starting_from", label: "Starting From" },
  { val: "negotiable", label: "Negotiable" },
];
const BOOKING_MODES = [
  { val: "request", label: "Request (you approve)" },
  { val: "slot", label: "Slot Booking" },
];

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all";
const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
};
const labelCls =
  "text-white/50 text-[10px] font-black mb-1.5 block uppercase tracking-widest";

function formatPrice(type: string, price: number | null | undefined) {
  if (type === "negotiable") return "Negotiable";
  const prefix = type === "starting_from" ? "From " : "";
  return `${prefix}₦${(price ?? 0).toLocaleString()}`;
}

/* ─── sub-components ─────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  );
}

/* ─── Nav Item ───────────────────────────────────────────────────── */
const NavItem = ({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left group
      ${active ? "text-white shadow-lg" : "text-slate-400 hover:text-orange-400"}`}
    style={
      active
        ? {
            background: "linear-gradient(135deg,#B42225,#FF8C00)",
            boxShadow: "0 4px 16px rgba(180,34,37,0.35)",
          }
        : { background: "transparent" }
    }
  >
    <span
      className={`shrink-0 transition-transform duration-150 ${active ? "" : "group-hover:scale-110"}`}
    >
      {icon}
    </span>
    <span className="flex-1">{label}</span>
    {badge && badge > 0 ? (
      <span
        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}
      >
        {badge}
      </span>
    ) : active ? (
      <FiChevronRight size={13} />
    ) : null}
  </button>
);

/* ─── Schedule Builder ───────────────────────────────────────────── */
function ScheduleBuilder({
  schedule,
  onChange,
}: {
  schedule: Record<string, Array<{ start: string; end: string }>>;
  onChange: (s: Record<string, Array<{ start: string; end: string }>>) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    if (schedule[day]) {
      const next = { ...schedule };
      delete next[day];
      onChange(next);
    } else {
      onChange({ ...schedule, [day]: [{ start: "09:00", end: "17:00" }] });
      setExpanded(day);
    }
  };

  const updateSlot = (
    day: string,
    i: number,
    field: "start" | "end",
    val: string,
  ) => {
    const slots = [...(schedule[day] || [])];
    slots[i] = { ...slots[i], [field]: val };
    onChange({ ...schedule, [day]: slots });
  };

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const active = !!schedule[day];
        const slots = schedule[day] || [];
        const isOpen = expanded === day && active;
        return (
          <div
            key={day}
            className="rounded-xl overflow-hidden"
            style={
              active
                ? {
                    background: "rgba(255,140,0,0.06)",
                    border: "1px solid rgba(255,140,0,0.2)",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }
            }
          >
            <div className="flex items-center gap-3 p-3">
              <button
                onClick={() => toggleDay(day)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${active ? "text-white" : "border border-white/20"}`}
                style={
                  active
                    ? { background: "linear-gradient(135deg,#B42225,#FF8C00)" }
                    : {}
                }
              >
                {active && <FiCheck size={11} />}
              </button>
              <span
                className={`text-xs font-black flex-1 ${active ? "text-white" : "text-white/40"}`}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </span>
              {active && (
                <>
                  <span className="text-[10px] text-white/40">
                    {slots.map((s) => `${s.start}–${s.end}`).join(", ")}
                  </span>
                  <button
                    onClick={() => setExpanded(isOpen ? null : day)}
                    className="text-white/40 hover:text-white ml-1"
                  >
                    {isOpen ? (
                      <FiChevronUp size={13} />
                    ) : (
                      <FiChevronDown size={13} />
                    )}
                  </button>
                </>
              )}
            </div>
            {isOpen && (
              <div className="px-3 pb-3 space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateSlot(day, i, "start", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        colorScheme: "dark",
                      }}
                    />
                    <span className="text-white/30 text-xs">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateSlot(day, i, "end", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        colorScheme: "dark",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Service Form ───────────────────────────────────────────────── */
function ServiceForm({
  initial,
  onSave,
  onCancel,
  saving,
  allowedCategoryIds,
  categories,
}: {
  initial?: Partial<ServiceData>;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
  allowedCategoryIds: string[];
  categories: DisplayCategory[];
}) {
  const validCats = categories.filter((cat) =>
    isCategoryAllowed(cat, allowedCategoryIds),
  );
  const displayCats = validCats.length > 0 ? validCats : categories;

  const [data, setData] = useState({
    display_name: initial?.display_name || "",
    category_id: initial?.category_id || displayCats[0]?.id || "",
    description: initial?.description || "",
    price_type: initial?.price_type || "fixed",
    starting_price: initial?.starting_price || 0,
    location: initial?.location || "",
    availability_schedule: initial?.availability_schedule || {},
    booking_mode: initial?.booking_mode || "request",
  });

  const upd = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const isValid =
    data.display_name.trim().length >= 2 &&
    data.category_id &&
    data.description.trim().length >= 10 &&
    data.location.trim().length >= 3 &&
    (data.price_type === "negotiable" || data.starting_price > 0) &&
    Object.keys(data.availability_schedule).length > 0;

  if (displayCats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 text-sm">No categories available.</p>
        <p className="text-white/40 text-xs mt-2">
          Please contact support to get your categories approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Service Name *</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="e.g. Professional Deep Cleaning"
          value={data.display_name}
          onChange={(e) => upd("display_name", e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Category *</label>
        {validCats.length === 0 && categories.length > 0 && (
          <p className="text-amber-400/70 text-[10px] mb-2 font-semibold">
            ⚠ Your approved category wasn't found in the list — showing all
            categories.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayCats.map(({ id, name, icon, gradient }) => (
            <button
              key={id}
              onClick={() => upd("category_id", id)}
              className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
              style={{
                background:
                  data.category_id === id
                    ? "rgba(255,255,255,0.09)"
                    : "rgba(255,255,255,0.04)",
                border:
                  data.category_id === id
                    ? "1px solid rgba(255,140,0,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: gradient }}
              >
                {icon}
              </div>
              <span className="text-white text-[11px] font-bold leading-tight">
                {name}
              </span>
              {data.category_id === id && (
                <FiCheck
                  size={11}
                  className="text-[#FF8C00] ml-auto shrink-0"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Description *</label>
        <textarea
          className={`${inputCls} resize-none`}
          style={inputStyle}
          rows={3}
          placeholder="Describe your service in detail — what's included, your process, requirements..."
          value={data.description}
          onChange={(e) => upd("description", e.target.value.slice(0, 500))}
        />
        <p className="text-white/20 text-[10px] mt-0.5 text-right">
          {data.description.length}/500
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Price Type *</label>
          <div className="space-y-1.5">
            {PRICE_TYPES.map(({ val, label }) => (
              <button
                key={val}
                onClick={() => upd("price_type", val)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all"
                style={
                  data.price_type === val
                    ? {
                        background: "rgba(255,140,0,0.1)",
                        border: "1px solid rgba(255,140,0,0.35)",
                        color: "#FF8C00",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.5)",
                      }
                }
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${data.price_type === val ? "border-[#FF8C00]" : "border-white/20"}`}
                >
                  {data.price_type === val && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#FF8C00" }}
                    />
                  )}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            {data.price_type === "negotiable"
              ? "Price (Optional)"
              : "Amount (₦) *"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">
              ₦
            </span>
            <input
              type="number"
              min={0}
              className={`${inputCls} pl-7`}
              style={inputStyle}
              placeholder="0"
              value={data.starting_price || ""}
              onChange={(e) => upd("starting_price", Number(e.target.value))}
              disabled={data.price_type === "negotiable"}
            />
          </div>
          <div className="mt-3">
            <label className={labelCls}>Location *</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="e.g. FUTO Campus, Owerri"
              value={data.location}
              onChange={(e) => upd("location", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Booking Mode *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {BOOKING_MODES.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => upd("booking_mode", val)}
              className="p-3 rounded-xl text-xs font-bold text-center transition-all"
              style={
                data.booking_mode === val
                  ? {
                      background: "rgba(255,140,0,0.1)",
                      border: "1px solid rgba(255,140,0,0.35)",
                      color: "#FF8C00",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Availability Schedule *</label>
        <ScheduleBuilder
          schedule={data.availability_schedule}
          onChange={(s) => upd("availability_schedule", s)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl text-sm font-black text-white/50 hover:text-white transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(data)}
          disabled={!isValid || saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isValid
              ? "linear-gradient(135deg,#B42225,#FF8C00)"
              : "rgba(255,255,255,0.08)",
            boxShadow: isValid ? "0 8px 24px rgba(180,34,37,0.3)" : "none",
          }}
        >
          {saving ? (
            <>
              <Spinner /> Saving...
            </>
          ) : (
            <>
              <FiCheck size={15} /> Save Service
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Metric Card ────────────────────────────────────────────────── */
const MetricCard = ({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  color,
  trend,
  trendUp = true,
}: any) => (
  <div
    className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.05)" }}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${trendUp ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </div>
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-2xl font-black text-slate-900">
      {prefix}
      {value}
      {suffix}
    </p>
  </div>
);

/* ─── Helper: Upload image (upload only, no profile mutation) ───── */
/**
 * Uploads a provider image (logo or cover) and returns the resulting URL.
 * Does NOT touch the provider profile - upload and save are two separate
 * steps; a single full-payload save persists the URL afterward (see
 * handleCoverUpload / handleLogoUpload below).
 *
 * Response-shape parsing mirrors apiService.uploadProfileImage(), which is
 * the proven, already-working normalizer for this exact backend endpoint
 * (/upload/files). uploadFiles() returns response.data as-is, whatever
 * shape the backend sends, so we reuse the same checks rather than
 * guessing at a different shape.
 */
async function uploadProviderImage(
  file: File,
  uploadType: "provider_logo" | "provider_cover",
  providerId?: string,
): Promise<string | null> {
  let result: any;
  try {
    result = await apiService.uploadFiles([file], uploadType, providerId);
  } catch (err) {
    console.error(`uploadFiles(${uploadType}) request failed:`, err);
    return null;
  }

  // Same shape-checks as apiService.uploadProfileImage(), the known-working
  // normalizer for this backend's /upload/files response.
  const urls: string[] = Array.isArray(result?.urls)
    ? result.urls
    : Array.isArray(result)
      ? result.map((r: any) => r?.url || r)
      : result?.url
        ? [result.url]
        : [];

  if (!urls.length || typeof urls[0] !== "string") {
    // Log the actual raw shape so a real mismatch is diagnosable instead of
    // silently failing again with a guess.
    console.error(
      `uploadFiles(${uploadType}) returned an unrecognized shape:`,
      result,
    );
    return null;
  }

  return urls[0];
}

/* ═══════════════════════ MAIN DASHBOARD ════════════════════════ */
export default function ProviderDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [service, setService] = useState<ServiceData | null>(null);
  const [hasService, setHasService] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [allowedCategoryIds, setAllowedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] =
    useState<DisplayCategory[]>(FALLBACK_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [deletingService, setDeletingService] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  // Hero image upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [imageError, setImageError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [profForm, setProfForm] = useState({
    business_name: "",
    business_bio: "",
    whatsapp_number: "",
  });
  const [profError, setProfError] = useState("");
  const [serviceError, setServiceError] = useState("");

  const hasLoadedRef = useRef(false);
  const categoriesFetchedRef = useRef(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fetchCategories = useCallback(async () => {
    if (categoriesFetchedRef.current) return;
    categoriesFetchedRef.current = true;
    setCategoriesLoading(true);
    const timeoutId = setTimeout(() => {
      setCategories(FALLBACK_CATEGORIES);
      setCategoriesLoading(false);
    }, 3000);
    try {
      const response = await apiService.getPublicCategories("SERVICE");
      clearTimeout(timeoutId);
      let cats: CategoryFromAPI[] = [];
      if (response?.data?.categories && Array.isArray(response.data.categories))
        cats = response.data.categories;
      else if (Array.isArray(response)) cats = response;
      else if (response?.data && Array.isArray(response.data))
        cats = response.data;
      else if (response?.categories && Array.isArray(response.categories))
        cats = response.categories;
      if (cats.length > 0) {
        const mappedCategories: DisplayCategory[] = cats
          .filter((cat: CategoryFromAPI) => cat.is_active !== false)
          .map((cat: CategoryFromAPI) => ({
            id: cat.id,
            name: cat.name,
            icon: getIconForCategory(cat.name),
            gradient: getGradientForCategory(cat.name),
          }));
        setCategories(mappedCategories);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      clearTimeout(timeoutId);
      setCategoriesLoading(false);
    }
  }, []);

  /**
   * Core fetch logic, shared by the initial load and any later refresh.
   * Does NOT touch hasLoadedRef - callers decide whether this is the
   * first load (full-page spinner) or a silent background refresh.
   */
  const fetchDashboardData = useCallback(async () => {
    let profRes: any = null;
    try {
      profRes = await apiService.getServiceProviderDetails();
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status ?? err?.statusCode;
      const isNotFound =
        status === 404 || err?.message?.toLowerCase().includes("not found");
      if (isNotFound) {
        router.replace("/services/apply");
        return;
      }
      throw err;
    }
    if (!profRes)
      throw new Error(
        "Could not load your provider profile. Please try again.",
      );

    const p = profRes?.data || profRes;
    let providerCats: string[] = [];
    if (p.service_category && Array.isArray(p.service_category))
      providerCats = p.service_category;
    else if (p.service_categories && Array.isArray(p.service_categories))
      providerCats = p.service_categories;
    else if (p.categories && Array.isArray(p.categories))
      providerCats = p.categories;
    else if (p.category) providerCats = [p.category];
    else if (p.category_id) providerCats = [p.category_id];
    setAllowedCategoryIds(providerCats);

    const resolvedStatus = (() => {
      if (p.is_active === true) return "active";
      const rawStatus = (
        p.provider_status ||
        p.status ||
        p.account_status ||
        ""
      )
        .toString()
        .toLowerCase()
        .trim();
      if (
        [
          "active",
          "verified",
          "approved",
          "complete",
          "completed",
          "enabled",
        ].includes(rawStatus)
      )
        return "active";
      if (
        [
          "pending",
          "under_review",
          "submitted",
          "reviewing",
          "review",
          "",
        ].includes(rawStatus)
      ) {
        if (p.is_phone_verified === true) return "active";
        return "pending";
      }
      if (
        ["inactive", "suspended", "disabled", "banned", "rejected"].includes(
          rawStatus,
        )
      )
        return "inactive";
      return "pending";
    })();

    const profileWithStatus: ProviderProfile = {
      ...p,
      _resolvedStatus: resolvedStatus,
    };
    setProfile((prev) => ({
      ...prev,
      ...profileWithStatus,
      // GET /service-provider/details does NOT include logo_url or
      // cover_image_url in its response (confirmed: only id, business_name,
      // business_bio, service_category, phone_number, whatsapp_number,
      // is_phone_verified, provider_status). Falling back to the previous
      // state here prevents this leaner endpoint from blanking out images
      // that were correctly saved via the PATCH /service-provider/profile
      // response - which DOES include them.
      logo_url:
        p.logo_url !== undefined ? p.logo_url : (prev?.logo_url ?? undefined),
      cover_image_url:
        p.cover_image_url !== undefined
          ? p.cover_image_url
          : (prev?.cover_image_url ?? undefined),
    }));
    // Only update image state from this response if the field is actually
    // present - otherwise leave whatever is currently shown untouched.
    if (p.cover_image_url !== undefined) {
      setCoverImage(p.cover_image_url || "");
    }
    if (p.logo_url !== undefined) {
      setLogoImage(p.logo_url || "");
    }
    setProfForm({
      business_name: p.business_name || "",
      business_bio: p.business_bio || "",
      whatsapp_number: p.whatsapp_number || p.phone_number || "",
    });

    if (resolvedStatus === "pending") {
      const providerId = p.id || p.service_provider_id;
      if (providerId)
        localStorage.setItem("sp_pending_id", String(providerId));
      router.replace("/services/apply/verify");
      return;
    }
    if (resolvedStatus === "inactive") return;

    const token = localStorage.getItem("access_token");
    const directResponse = await fetch(
      "https://dev-api-jovomart.onrender.com/api/v1/service-provider/services/my-services",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const directData = await directResponse.json();

    let svcData = null;
    if (directData?.data) {
      const dataObj = directData.data;
      if (Array.isArray(dataObj) && dataObj.length > 0) svcData = dataObj[0];
      else if (dataObj && typeof dataObj === "object") {
        if (
          dataObj.services &&
          Array.isArray(dataObj.services) &&
          dataObj.services.length > 0
        )
          svcData = dataObj.services[0];
        else if (
          dataObj.items &&
          Array.isArray(dataObj.items) &&
          dataObj.items.length > 0
        )
          svcData = dataObj.items[0];
        else if (
          dataObj.results &&
          Array.isArray(dataObj.results) &&
          dataObj.results.length > 0
        )
          svcData = dataObj.results[0];
        else if (dataObj.id) svcData = dataObj;
        else {
          for (const key in dataObj) {
            if (
              Array.isArray(dataObj[key]) &&
              dataObj[key].length > 0 &&
              dataObj[key][0]?.id
            ) {
              svcData = dataObj[key][0];
              break;
            }
          }
        }
      }
    }

    if (svcData && svcData.id) {
      setService(svcData);
      setHasService(true);
    } else {
      setHasService(false);
      setService(null);
    }
  }, [router]);

  /** First load only - shows the full-page spinner, runs once per mount. */
  const load = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setPageLoading(true);
    setPageError("");
    try {
      fetchCategories();
      await fetchDashboardData();
    } catch (err: any) {
      setPageError(err.message || "Failed to load your profile.");
    } finally {
      setPageLoading(false);
    }
  }, [fetchCategories, fetchDashboardData]);

  /**
   * Silent refresh used after every mutation (toggle active, save profile,
   * create/update/delete service, upload images). Always re-runs, unlike
   * `load`, so the UI reflects the server's true state without requiring
   * a manual page refresh.
   */
  const refresh = useCallback(async () => {
    try {
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Refresh failed:", err);
    }
  }, [fetchDashboardData]);

  const dashboardLoadedRef = useRef(false);

  useEffect(() => {
    if (!dashboardLoadedRef.current) {
      dashboardLoadedRef.current = true;
      load();
    }
  }, [load]);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfError("");
    try {
      await apiService.updateServiceProviderProfile(profForm);
      await refresh();
      setEditingProfile(false);
    } catch (err: any) {
      setProfError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Hero Image Handlers ──
  // IMPORTANT: GET /service-provider/details (used by refresh/fetchDashboardData)
  // returns a SLIMMER payload than PATCH /service-provider/profile - it does
  // NOT include logo_url, cover_image_url, rating, review_count, etc. Calling
  // refresh() after an image upload was overwriting the just-saved image back
  // to blank, because refresh() re-fetches from /details and that response
  // has no logo_url/cover_image_url field at all (undefined -> ""). The fix:
  // trust the PATCH response directly as the source of truth for these
  // fields, and do NOT call refresh() here.
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setImageError("");
    // Instant local preview so the UI feels responsive while uploading.
    const localPreviewUrl = URL.createObjectURL(file);
    setCoverImage(localPreviewUrl);
    try {
      const url = await uploadProviderImage(file, "provider_cover", profile?.id);
      if (!url) {
        throw new Error("Failed to upload cover image. Please try again.");
      }
      // Full-payload save: all current profile fields plus the new cover url.
      const saveRes = await apiService.updateServiceProviderProfile({
        ...profForm,
        cover_image_url: url,
      });
      // Trust the PATCH response's own data over our local guess - it's the
      // authoritative, freshest copy of the full profile (unlike /details).
      const saved = saveRes?.data ?? saveRes;
      const confirmedUrl =
        (saved && typeof saved === "object" && saved.cover_image_url) || url;
      setCoverImage(confirmedUrl);
      setProfile((prev) =>
        prev ? { ...prev, ...saved, cover_image_url: confirmedUrl } : prev,
      );
    } catch (err: any) {
      console.error("Cover upload failed:", err);
      setImageError(
        err.message || "Failed to upload cover image. Please try again.",
      );
      // Roll back the preview since the upload didn't actually persist.
      setCoverImage(profile?.cover_image_url || "");
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setImageError("");
    const localPreviewUrl = URL.createObjectURL(file);
    setLogoImage(localPreviewUrl);
    try {
      const url = await uploadProviderImage(file, "provider_logo", profile?.id);
      if (!url) {
        throw new Error("Failed to upload logo. Please try again.");
      }
      const saveRes = await apiService.updateServiceProviderProfile({
        ...profForm,
        logo_url: url,
      });
      const saved = saveRes?.data ?? saveRes;
      const confirmedUrl =
        (saved && typeof saved === "object" && saved.logo_url) || url;
      setLogoImage(confirmedUrl);
      setProfile((prev) =>
        prev ? { ...prev, ...saved, logo_url: confirmedUrl } : prev,
      );
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      setImageError(err.message || "Failed to upload logo. Please try again.");
      setLogoImage(profile?.logo_url || "");
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const createService = async (data: any) => {
    setSavingService(true);
    setServiceError("");
    try {
      const token = localStorage.getItem("access_token");
      const { availability_schedule, ...serviceData } = data;
      const createResponse = await fetch(
        "https://dev-api-jovomart.onrender.com/api/v1/service-provider/services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...serviceData, availability_schedule: {} }),
        },
      );
      const createResponseText = await createResponse.text();
      if (!createResponse.ok)
        throw new Error(`Create failed: ${createResponseText}`);
      const createResult = JSON.parse(createResponseText);
      const serviceId = createResult.data?.id;
      if (!serviceId) throw new Error("No service ID returned");
      if (Object.keys(availability_schedule).length > 0) {
        await fetch(
          `https://dev-api-jovomart.onrender.com/api/v1/service-provider/services/${serviceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ availability_schedule }),
          },
        );
      }
      await refresh();
      setShowServiceForm(false);
    } catch (err: any) {
      console.error("Create service error:", err);
      setServiceError(err.message || "Failed to create service.");
    } finally {
      setSavingService(false);
    }
  };

  const updateService = async (data: any) => {
    if (!service) return;
    setSavingService(true);
    setServiceError("");
    try {
      await apiService.updateService(service.id, data);
      await refresh();
      setEditingService(false);
    } catch (err: any) {
      setServiceError(err.message || "Failed to update service.");
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async () => {
    if (!service) return;
    setDeletingService(true);
    try {
      await apiService.deleteService(service.id);
      await refresh();
      setConfirmDelete(false);
    } catch (err: any) {
      setServiceError(err.message || "Failed to delete service.");
    } finally {
      setDeletingService(false);
    }
  };

  const toggleActive = async () => {
    if (!service) return;
    setTogglingActive(true);
    const previous = service;
    const nextActive = !service.is_active;
    // Optimistic update so the badge flips instantly...
    setService({ ...service, is_active: nextActive });
    try {
      await apiService.updateService(service.id, {
        is_active: nextActive,
      });
      // ...then confirm against the server, which now actually re-fetches
      // because `refresh` is not gated like `load` was.
      await refresh();
    } catch (err) {
      console.error("Toggle active failed:", err);
      // Roll back on failure instead of leaving a state that lies to the user.
      setService(previous);
    } finally {
      setTogglingActive(false);
    }
  };

  const getCategoryDisplay = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);
  const catInfo = service ? getCategoryDisplay(service.category_id) : null;
  const hasApprovedCategories =
    allowedCategoryIds.length > 0
      ? categories.some((cat) => isCategoryAllowed(cat, allowedCategoryIds))
      : categories.length > 0;
  const activeServiceCount = hasService && service?.is_active === true ? 1 : 0;

  const initials =
    profile?.business_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  const navItems = [
    { id: "dashboard", icon: <FiHome size={17} />, label: "Overview" },
    {
      id: "service",
      icon: <FiTool size={17} />,
      label: "My Service",
      badge: hasService ? 1 : 0,
    },
    { id: "bookings", icon: <FiCalendar size={17} />, label: "Bookings" },
    { id: "reviews", icon: <FiStar size={17} />, label: "Reviews" },
    { id: "earnings", icon: <FiDollarSign size={17} />, label: "Earnings" },
    { id: "settings", icon: <FiSettings size={17} />, label: "Settings" },
  ];

  /* ─── Loading ─────────────────────────────────────────────────── */
  if (pageLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8FAFC" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#F8FAFC" }}
      >
        <div className="text-center max-w-sm">
          <FiAlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="font-black text-slate-800 text-lg mb-2">
            Oops, something went wrong
          </p>
          <p className="text-slate-400 text-sm mb-5">{pageError}</p>
          <button
            onClick={() => {
              hasLoadedRef.current = false;
              load();
            }}
            className="px-6 py-3 rounded-2xl text-sm font-black text-white"
            style={{ background: "linear-gradient(135deg,#B42225,#FF8C00)" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const showCreateButton =
    !hasService && !showServiceForm && hasApprovedCategories;

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "#F8FAFC",
        fontFamily: "'DM Sans','Plus Jakarta Sans','Segoe UI',sans-serif",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════ SIDEBAR ══════ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #F1F5F9",
          boxShadow: "4px 0 30px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid #F8FAFC" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg,#B42225,#FF8C00)",
                boxShadow: "0 4px 12px rgba(180,34,37,0.3)",
              }}
            >
              <FaTools size={14} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 leading-none tracking-tight">
                JOVO
              </p>
              <p className="text-[10px] font-semibold text-orange-500 mt-0.5 uppercase tracking-wider">
                Provider Hub
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Provider Card */}
        <div
          className="mx-4 my-4 rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#FFF7ED,#FEF3C7)",
            border: "1px solid #FED7AA",
          }}
        >
          <div
            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #F97316, transparent 70%)",
            }}
          />
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {logoImage ? (
                <Image
                  src={logoImage}
                  alt="logo"
                  width={44}
                  height={44}
                  className="rounded-xl object-cover"
                  style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}
                  unoptimized
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF8C00)",
                    boxShadow: "0 4px 12px rgba(180,34,37,0.35)",
                  }}
                >
                  {initials}
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                style={{
                  background: service?.is_active ? "#10B981" : "#94A3B8",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <p className="text-slate-900 text-sm font-bold truncate">
                  {profile?.business_name || "Provider"}
                </p>
                <MdVerified size={12} className="text-orange-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FaCrown size={8} className="text-amber-500" />
                <p className="text-amber-700 text-[10px] font-bold">
                  Verified Partner
                </p>
              </div>
            </div>
          </div>
          {(profile?.rating ?? 0) > 0 && (
            <div
              className="mt-3 pt-3 flex justify-between text-[10px]"
              style={{ borderTop: "1px solid rgba(249,115,22,0.15)" }}
            >
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <FaStar size={9} className="text-amber-500" /> Rating
              </span>
              <span className="font-black text-slate-900">
                {profile?.rating?.toFixed(1)} ({profile?.review_count})
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3.5 pt-2 pb-1.5">
            Main Menu
          </p>
          {navItems.slice(0, 4).map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={activeNav === item.id}
              badge={item.badge}
              onClick={() => {
                setActiveNav(item.id);
                setSidebarOpen(false);
              }}
            />
          ))}
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3.5 pt-4 pb-1.5">
            Account
          </p>
          {navItems.slice(4).map((item) => (
            <NavItem
              key={item.id}
              {...item}
              active={activeNav === item.id}
              onClick={() => {
                setActiveNav(item.id);
                setSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        {/* Bottom actions */}
        <div
          className="p-4 space-y-2"
          style={{ borderTop: "1px solid #F8FAFC" }}
        >
          <Link
            href="/shop"
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold text-red-400 transition-all duration-200 hover:opacity-90"
            style={{
              background: "white",
        
            }}
          >
            <MdOutlineSwapHoriz size={17} /> Back to Shop
          </Link>
          <Link
            href="/services"
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#B42225,#FF8C00)",
              boxShadow: "0 4px 14px rgba(180,34,37,0.25)",
            }}
          >
            <MdOutlineSwapHoriz size={17} /> Browse Services
          </Link>

          <button
            onClick={() => apiService.logout()}
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition"
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── TOP NAVBAR ── */}
        <header
          className="sticky top-0 z-30"
          style={{
            background: "rgba(255,255,255,0.98)",
            borderBottom: "1px solid #EEF1F6",
            boxShadow: "0 1px 0 rgba(15,23,42,0.02), 0 8px 24px rgba(15,23,42,0.04)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Thin brand hairline - desktop + mobile, understated not candy-bright */}
          <div
            className="h-[2px] w-full"
            style={{
              background:
                "linear-gradient(90deg,#7A1417 0%,#B42225 30%,#C45A1E 60%,#B42225 85%,#7A1417 100%)",
              opacity: 0.9,
            }}
          />

          {/* ── Desktop / tablet row ── */}
          <div className="hidden sm:flex items-center justify-between px-5 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #EEF1F6",
                }}
              >
                <FiMenu size={17} className="text-slate-600" />
              </button>
              <div>
                <p className="text-slate-400 text-xs font-medium">{greeting}</p>
                <p className="text-slate-900 text-[13px] font-black">
                  {profile?.business_name || "Provider"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(profile?.rating ?? 0) > 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{ background: "#FBF8F3", border: "1px solid #F0E6D2" }}
                >
                  <FaStar size={11} className="text-amber-500" />
                  <span className="text-slate-800 font-black text-sm">
                    {profile?.rating?.toFixed(1)}
                  </span>
                </div>
              )}
              <div
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={
                  service?.is_active
                    ? {
                        background: "#F0FBF6",
                        border: "1px solid #CFEEDD",
                        color: "#0E7C53",
                      }
                    : {
                        background: "#F8FAFC",
                        border: "1px solid #E7EBF0",
                        color: "#64748B",
                      }
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: service?.is_active ? "#16A368" : "#94A3B8",
                  }}
                />
                {service?.is_active ? "Live" : "Offline"}
              </div>
              <button
                className="relative p-2.5 rounded-xl transition text-slate-500"
                style={{ background: "#F8FAFC", border: "1px solid #EEF1F6" }}
              >
                <FiBell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
              </button>
              {showCreateButton && (
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#9A3412)",
                    boxShadow: "0 4px 12px rgba(180,34,37,0.25)",
                  }}
                >
                  <FiPlus size={15} />
                  <span>Create Service</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile row: refined single bar, no candy gradient stacking ── */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all active:scale-95"
                  style={{ background: "#0F172A" }}
                >
                  <FiMenu size={16} className="text-white" />
                </button>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    {greeting}
                  </p>
                  <p className="text-[13.5px] font-black text-slate-900 leading-tight truncate max-w-[150px]">
                    {profile?.business_name || "Provider"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {(profile?.rating ?? 0) > 0 && (
                  <div
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
                    style={{ background: "#FBF8F3", border: "1px solid #F0E6D2" }}
                  >
                    <FaStar size={9} className="text-amber-500" />
                    <span className="text-slate-800 font-black text-[11px]">
                      {profile?.rating?.toFixed(1)}
                    </span>
                  </div>
                )}
                <span
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                  style={
                    service?.is_active
                      ? {
                          background: "#F0FBF6",
                          border: "1px solid #CFEEDD",
                          color: "#0E7C53",
                        }
                      : {
                          background: "#F8FAFC",
                          border: "1px solid #E7EBF0",
                          color: "#64748B",
                        }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: service?.is_active ? "#16A368" : "#94A3B8",
                    }}
                  />
                  {service?.is_active ? "Live" : "Offline"}
                </span>
                <button
                  className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                  style={{ background: "#F8FAFC", border: "1px solid #EEF1F6" }}
                >
                  <FiBell size={15} className="text-slate-500" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 border-[1.5px] border-white" />
                </button>
              </div>
            </div>

            {/* Compact metric strip - quiet, professional, not oversized chips */}
            <div
              className="flex items-stretch px-4 pb-3 gap-2 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {[
                {
                  icon: <FiDollarSign size={12} />,
                  label: "Rate",
                  value: service?.starting_price
                    ? `₦${service.starting_price.toLocaleString()}`
                    : "Not set",
                },
                {
                  icon: <FiCalendar size={12} />,
                  label: "Days",
                  value: service?.availability_schedule
                    ? `${Object.keys(service.availability_schedule).length}/7`
                    : "0/7",
                },
                {
                  icon: <FiZap size={12} />,
                  label: "Booking",
                  value: service?.booking_mode
                    ? service.booking_mode.charAt(0).toUpperCase() +
                      service.booking_mode.slice(1)
                    : "—",
                },
              ].map(({ icon, label, value }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
                  style={{ background: "#F8FAFC", border: "1px solid #EEF1F6" }}
                >
                  <span className="text-slate-400">{icon}</span>
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-[11.5px] font-bold text-slate-800">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
              {showCreateButton && (
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11.5px] font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#9A3412)",
                  }}
                >
                  <FiPlus size={13} /> Create
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto">
          {/* ════ HERO BANNER ════ */}
          <div className="relative">
            {/* Image-related error toast */}
            {imageError && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-lg flex items-center gap-2 max-w-[90%]">
                <FiAlertCircle size={14} className="shrink-0" />
                <span className="truncate">{imageError}</span>
                <button
                  onClick={() => setImageError("")}
                  className="shrink-0 opacity-80 hover:opacity-100"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {/* Cover Image */}
            <div
              className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #6B0D10 0%, #8C1F10 22%, #A83318 42%, #C44D1A 62%, #D96318 80%, #E8751A 100%)",
              }}
            >
              {coverImage && (
                <Image
                  src={coverImage}
                  alt="Cover image"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              )}

              {/* Dot grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 pointer-events-none" />

              {/* Glow accents */}
              <div
                className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle,#F97316 0%,transparent 70%)",
                }}
              />
              <div
                className="absolute right-0 bottom-0 w-56 h-56 rounded-full opacity-20 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle,#6366F1 0%,transparent 70%)",
                }}
              />

              {/* Cover upload button - positioned like seller profile page */}
              <div className="absolute top-0 inset-x-0 px-4 sm:px-6 pt-4 sm:pt-5 flex items-center justify-between z-20">
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/45 transition-colors disabled:opacity-60"
                >
                  {uploadingCover ? (
                    <FiLoader size={13} className="animate-spin" />
                  ) : (
                    <FiCamera size={13} />
                  )}
                  <span className="hidden sm:inline">
                    {uploadingCover ? "Uploading…" : "Change cover"}
                  </span>
                  <span className="sm:hidden">
                    {uploadingCover ? "…" : "Cover"}
                  </span>
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />

                {/* Edit profile button */}
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-semibold hover:bg-white transition-colors"
                >
                  <FiEdit2 size={13} />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              </div>

              {/* Cover empty state hint */}
              {!coverImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <FiImage size={28} className="text-white" />
                    <p className="text-white text-xs font-medium">
                      Click &quot;Change cover&quot; to add a cover photo
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Identity card - overlaps the cover like seller profile page */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="relative -mt-14 sm:-mt-16 md:-mt-20 bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
                  {/* Logo/Avatar with upload button - like seller profile */}
                  <div className="relative shrink-0 group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl border-[3px] sm:border-4 border-slate-50 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center relative">
                      {logoImage ? (
                        <Image
                          src={logoImage}
                          alt={profile?.business_name || "Provider"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-2xl font-black text-white tracking-tight">
                          {initials}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 border-2 border-slate-50 flex items-center justify-center text-white shadow-md hover:bg-orange-600 transition-colors disabled:opacity-60"
                      title="Change logo"
                    >
                      {uploadingLogo ? (
                        <FiLoader size={12} className="animate-spin" />
                      ) : (
                        <FiCamera size={12} />
                      )}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0 pb-1 sm:pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                        {profile?.business_name || "Provider"}
                      </h1>
                      <MdVerified
                        className="text-orange-500 shrink-0"
                        size={20}
                        title="Verified provider"
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-1 truncate max-w-2xl">
                      {profile?.business_bio ||
                        "Add a bio so clients know about your services"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiTool size={11} />{" "}
                        {service?.display_name || "No service listed yet"}
                      </span>
                      <span className="text-slate-200 text-xs">·</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiMapPin size={11} />{" "}
                        {service?.location || "Location not set"}
                      </span>
                      {profile?.rating && profile.rating > 0 && (
                        <>
                          <span className="text-slate-200 text-xs">·</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <FaStar size={10} className="text-amber-500" />{" "}
                            {profile.rating.toFixed(1)} ({profile.review_count}{" "}
                            reviews)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick status + actions */}
                  <div className="flex items-center gap-2 sm:pb-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold ${
                        service?.is_active
                          ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                          : "bg-slate-50 border border-slate-200 text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${service?.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                      />
                      {service?.is_active ? "Active" : "Inactive"}
                    </span>
                    {service && (
                      <button
                        onClick={toggleActive}
                        disabled={togglingActive}
                        className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        {togglingActive ? (
                          <Spinner />
                        ) : service.is_active ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stat strip - like seller profile page */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: <FiDollarSign size={16} />,
                      label: "Service Rate",
                      value: service?.starting_price
                        ? `₦${service.starting_price.toLocaleString()}`
                        : "Not set",
                      color: "#F97316",
                      bg: "#FFF7ED",
                    },
                    {
                      icon: <FiCalendar size={16} />,
                      label: "Available Days",
                      value: service?.availability_schedule
                        ? `${Object.keys(service.availability_schedule).length}/7`
                        : "0/7",
                      color: "#10B981",
                      bg: "#F0FDF4",
                    },
                    {
                      icon: <FiZap size={16} />,
                      label: "Booking Mode",
                      value: service?.booking_mode
                        ? service.booking_mode.charAt(0).toUpperCase() +
                          service.booking_mode.slice(1)
                        : "—",
                      color: "#6366F1",
                      bg: "#EEF2FF",
                    },
                    {
                      icon: <FiUsers size={16} />,
                      label: "Total Reviews",
                      value: profile?.review_count?.toLocaleString() || "0",
                      color: "#F59E0B",
                      bg: "#FFFBEB",
                    },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5"
                      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                    >
                      <div
                        className="flex items-center gap-2 mb-1.5"
                        style={{ color: stat.color }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: stat.bg }}
                        >
                          {stat.icon}
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN BODY ── */}
          <div className="px-5 md:px-8 py-8 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  icon: <FiCalendar size={16} />,
                  label: "Bookings",
                  sub: "Manage requests",
                  color: "#6366F1",
                  bg: "#EEF2FF",
                },
                {
                  icon: <FiMessageSquare size={16} />,
                  label: "Reviews",
                  sub: `${profile?.review_count ?? 0} total`,
                  color: "#F97316",
                  bg: "#FFF7ED",
                },
                {
                  icon: <FiUsers size={16} />,
                  label: "Customers",
                  sub: "View clients",
                  color: "#10B981",
                  bg: "#F0FDF4",
                },
                {
                  icon: <FiBarChart2 size={16} />,
                  label: "Analytics",
                  sub: "Performance",
                  color: "#0EA5E9",
                  bg: "#F0F9FF",
                },
              ].map(({ icon, label, sub, color, bg }) => (
                <button
                  key={label}
                  className="bg-white rounded-2xl p-4 border border-slate-100 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: bg, color }}
                  >
                    {icon}
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{label}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{sub}</p>
                </button>
              ))}
            </div>

            {/* ════ EDIT PROFILE MODAL ════ */}
            {editingProfile && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{
                  backgroundColor: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
                    <h2 className="font-black text-slate-900 text-lg">
                      Edit Profile
                    </h2>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Note about image uploads */}
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs">
                      💡 Upload your logo and cover image directly from the
                      banner above — they update instantly!
                    </div>

                    {/* Text fields */}
                    {[
                      {
                        key: "business_name",
                        label: "Business Name",
                        type: "input",
                      },
                      {
                        key: "business_bio",
                        label: "Business Bio",
                        type: "textarea",
                      },
                      {
                        key: "whatsapp_number",
                        label: "WhatsApp Number",
                        type: "input",
                      },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                          {label}
                        </label>
                        {type === "textarea" ? (
                          <textarea
                            className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition resize-none"
                            rows={3}
                            value={(profForm as any)[key]}
                            onChange={(e) =>
                              setProfForm((f) => ({
                                ...f,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <input
                            className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                            value={(profForm as any)[key]}
                            onChange={(e) =>
                              setProfForm((f) => ({
                                ...f,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}

                    {profError && (
                      <div className="p-3 rounded-xl text-red-500 text-xs bg-red-50 border border-red-200">
                        {profError}
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg,#B42225,#FF8C00)",
                        }}
                      >
                        {savingProfile ? (
                          <>
                            <Spinner /> Saving...
                          </>
                        ) : (
                          <>
                            <FiCheck size={15} /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Service Section ── */}
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.06)" }}
            >
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Service Management
                  </p>
                  <h2 className="text-slate-900 font-black text-xl mt-0.5">
                    My Service
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    You can have 1 active service at a time
                  </p>
                </div>
                {showCreateButton && (
                  <button
                    onClick={() => setShowServiceForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF8C00)",
                      boxShadow: "0 4px 16px rgba(180,34,37,0.3)",
                    }}
                  >
                    <FiPlus size={15} /> Create Service
                  </button>
                )}
              </div>

              {serviceError && (
                <div className="mx-6 mt-4 p-4 rounded-2xl text-red-500 text-sm flex items-start gap-2 bg-red-50 border border-red-200">
                  <FiAlertCircle size={15} className="shrink-0 mt-0.5" />{" "}
                  {serviceError}
                </div>
              )}

              {/* Create Form */}
              {showServiceForm && !hasService && (
                <div>
                  <div
                    className="px-6 py-4 flex items-center justify-between"
                    style={{
                      background: "#F8FAFC",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <h3 className="font-black text-slate-900">
                      Create Your Service
                    </h3>
                    <button
                      onClick={() => {
                        setShowServiceForm(false);
                        setServiceError("");
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  <div className="p-6" style={{ background: "#0a0a0a" }}>
                    <ServiceForm
                      onSave={createService}
                      onCancel={() => {
                        setShowServiceForm(false);
                        setServiceError("");
                      }}
                      saving={savingService}
                      allowedCategoryIds={allowedCategoryIds}
                      categories={categories}
                    />
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!hasService && !showServiceForm && (
                <div className="p-12 text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(180,34,37,0.1),rgba(255,140,0,0.1))",
                      border: "1px dashed rgba(180,34,37,0.3)",
                    }}
                  >
                    <FiTool size={28} className="text-[#B42225]" />
                  </div>
                  <p className="font-black text-slate-800 text-lg mb-2">
                    No service listed yet
                  </p>
                  <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                    Create your first service card to start appearing in the
                    marketplace and getting bookings.
                  </p>
                  {!hasApprovedCategories ? (
                    <div className="inline-block px-4 py-2 rounded-xl bg-yellow-50 text-yellow-600 text-xs">
                      Your category is being loaded or not yet approved.
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowServiceForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white"
                      style={{
                        background: "linear-gradient(135deg,#B42225,#FF8C00)",
                        boxShadow: "0 6px 20px rgba(180,34,37,0.3)",
                      }}
                    >
                      <FiPlus size={15} /> Create My Service
                    </button>
                  )}
                </div>
              )}

              {/* Service Card */}
              {hasService && service && !editingService && (
                <div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background:
                            catInfo?.gradient ||
                            getGradientForCategory("default"),
                        }}
                      >
                        {catInfo?.icon || (
                          <FaTools size={18} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                            {service.display_name}
                          </h3>
                          <span
                            className={`text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-full w-fit ${service.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {service.is_active ? "● Active" : "● Inactive"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                          <FiMapPin size={12} className="text-[#B42225]" />{" "}
                          {service.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0 mt-3 sm:mt-0">
                        <button
                          onClick={() => setEditingService(true)}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                        >
                          <FiEdit2 size={12} />{" "}
                          <span className="hidden xs:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black text-red-500 bg-red-50 hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={12} />{" "}
                          <span className="hidden xs:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 line-clamp-3 sm:line-clamp-none">
                      {service.description}
                    </p>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 py-4 border-t border-b border-slate-100 mb-5">
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          Price
                        </p>
                        <p className="font-black text-[#B42225] text-sm sm:text-base break-words">
                          {formatPrice(
                            service.price_type,
                            service.starting_price,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          Booking Mode
                        </p>
                        <p className="font-semibold text-slate-700 capitalize text-xs sm:text-sm">
                          {service.booking_mode}
                        </p>
                      </div>
                      <div className="xs:col-span-2 md:col-span-2">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          Available Days
                        </p>
                        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                          {DAYS.map((d) => (
                            <span
                              key={d}
                              className={`text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${service.availability_schedule[d] ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-300"}`}
                            >
                              {DAY_SHORT[d]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {confirmDelete && (
                      <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-red-50 border border-red-200">
                        <p className="text-sm font-black text-slate-800 mb-1">
                          Delete this service?
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          This will remove your service card from the
                          marketplace permanently.
                        </p>
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={deleteService}
                            disabled={deletingService}
                            className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
                          >
                            {deletingService ? (
                              <>
                                <Spinner /> Deleting...
                              </>
                            ) : (
                              <>
                                <FiTrash2 size={14} /> Yes, Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Service Form */}
              {editingService && service && (
                <div>
                  <div
                    className="px-6 py-4 flex items-center justify-between"
                    style={{
                      background: "#F8FAFC",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <h3 className="font-black text-slate-900">Edit Service</h3>
                    <button
                      onClick={() => {
                        setEditingService(false);
                        setServiceError("");
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  <div className="p-6" style={{ background: "#0a0a0a" }}>
                    <ServiceForm
                      initial={service}
                      onSave={updateService}
                      onCancel={() => {
                        setEditingService(false);
                        setServiceError("");
                      }}
                      saving={savingService}
                      allowedCategoryIds={allowedCategoryIds}
                      categories={categories}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Tip Banner ── */}
            <div
              className="rounded-3xl overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg,#0F172A 0%,#1C1917 60%,#1C0A00 100%)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div
                className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(249,115,22,0.25) 0%,transparent 70%)",
                }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-8 py-7">
                <div className="flex items-start gap-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                    style={{
                      background: "rgba(249,115,22,0.15)",
                      border: "1px solid rgba(249,115,22,0.2)",
                    }}
                  >
                    💡
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <HiSparkles size={11} className="text-orange-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/70">
                        Pro Provider Tip
                      </p>
                    </div>
                    <p className="text-white font-black text-lg mb-1">
                      Complete profiles get 3× more bookings
                    </p>
                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                      Add your WhatsApp number, a professional bio, and a cover
                      photo to stand out in the marketplace.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProfile(true)}
                  className="shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF8C00)",
                    boxShadow: "0 4px 20px rgba(180,34,37,0.4)",
                  }}
                >
                  <FiEdit2 size={13} /> Update Profile
                </button>
              </div>
            </div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}