"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
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
  { val: "starting_at", label: "Starting At" },
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
  const prefix = type === "starting_at" ? "From " : "";
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
      ${
        active ? "text-white shadow-lg" : "text-slate-400 hover:text-orange-400"
      }`}
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
    allowedCategoryIds.includes(cat.id),
  );

  const [data, setData] = useState({
    display_name: initial?.display_name || "",
    category_id: initial?.category_id || validCats[0]?.id || "",
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

  if (validCats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 text-sm">No approved categories found.</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {validCats.map(({ id, name, icon, gradient }) => (
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [profForm, setProfForm] = useState({
    business_name: "",
    business_bio: "",
    whatsapp_number: "",
    logo_url: "",
    cover_image_url: "",
  });
  const [profError, setProfError] = useState("");
  const [serviceError, setServiceError] = useState("");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fetchCategories = useCallback(async () => {
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

  const load = useCallback(async () => {
    setPageLoading(true);
    setPageError("");
    try {
      fetchCategories();
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
      setProfile(profileWithStatus);
      setProfForm({
        business_name: p.business_name || "",
        business_bio: p.business_bio || "",
        whatsapp_number: p.whatsapp_number || p.phone_number || "",
        logo_url: p.logo_url || "",
        cover_image_url: p.cover_image_url || "",
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
    } catch (err: any) {
      setPageError(err.message || "Failed to load your profile.");
    } finally {
      setPageLoading(false);
    }
  }, [fetchCategories, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfError("");
    try {
      await apiService.updateServiceProviderProfile(profForm);
      await load();
      setEditingProfile(false);
    } catch (err: any) {
      setProfError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
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
      await load();
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
      await load();
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
      await load();
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
    try {
      await apiService.updateService(service.id, {
        is_active: !service.is_active,
      });
      await load();
    } catch {
      /* silently fail */
    } finally {
      setTogglingActive(false);
    }
  };

  const getCategoryDisplay = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);
  const catInfo = service ? getCategoryDisplay(service.category_id) : null;
  const hasApprovedCategories =
    allowedCategoryIds.length > 0 &&
    categories.some((cat) => allowedCategoryIds.includes(cat.id));
  const activeServiceCount = hasService && service?.is_active === true ? 1 : 0;
  const activeServiceText = activeServiceCount === 1 ? "Active" : "Inactive";

  const initials =
    profile?.business_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  /* ─── Sidebar nav items ───────────────────────────────────────── */
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
            onClick={load}
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
              {profile?.logo_url ? (
                <Image
                  src={profile.logo_url}
                  alt="logo"
                  width={44}
                  height={44}
                  className="rounded-xl object-cover"
                  style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}
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
            href="/services"
            className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#B42225,#FF8C00)",
              boxShadow: "0 4px 14px rgba(180,34,37,0.25)",
            }}
          >
            <MdOutlineSwapHoriz size={17} /> Browse Services
          </Link>
          <button className="w-full flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 transition">
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
            borderBottom: "1px solid #F1F5F9",
            boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Animated orange accent line — mobile only */}
          <div
            className="lg:hidden h-[2px] w-full"
            style={{
              background:
                "linear-gradient(90deg,#B42225 0%,#FF6B00 35%,#FFB347 55%,#FF6B00 75%,#B42225 100%)",
            }}
          />

          <div className="flex items-center justify-between px-4 lg:px-5 py-3">
            <div className="flex items-center gap-3">
              {/* Hamburger — styled for mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(180,34,37,0.08),rgba(255,140,0,0.08))",
                  border: "1px solid rgba(255,140,0,0.22)",
                }}
              >
                <FiMenu size={17} className="text-orange-600" />
              </button>

              {/* Desktop greeting */}
              <div className="hidden sm:block">
                <p className="text-slate-400 text-xs font-medium">{greeting}</p>
                <p className="text-slate-900 text-[13px] font-black">
                  {profile?.business_name || "Provider"}
                </p>
              </div>

              {/* Mobile greeting — xs only */}
              <div className="sm:hidden">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-orange-500">
                    {greeting}
                  </span>
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={
                      service?.is_active
                        ? {
                            background: "rgba(16,185,129,0.12)",
                            color: "#059669",
                          }
                        : {
                            background: "rgba(148,163,184,0.12)",
                            color: "#64748B",
                          }
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${service?.is_active ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`}
                    />
                    {service?.is_active ? "LIVE" : "OFFLINE"}
                  </span>
                </div>
                <p className="text-slate-900 text-sm font-black leading-none truncate max-w-[148px]">
                  {profile?.business_name || "Provider"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Rating — desktop */}
              {(profile?.rating ?? 0) > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                  <FaStar size={11} className="text-amber-500" />
                  <span className="text-amber-700 font-black text-sm">
                    {profile?.rating?.toFixed(1)}
                  </span>
                </div>
              )}
              {/* Status chip — desktop */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${service?.is_active ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-slate-100 border border-slate-200 text-slate-500"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${service?.is_active ? "bg-emerald-500" : "bg-slate-400"}`}
                />
                {service?.is_active ? "Live" : "Offline"}
              </div>

              <button className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500">
                <FiBell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white animate-pulse" />
              </button>

              {showCreateButton && (
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF8C00)",
                    boxShadow: "0 4px 12px rgba(180,34,37,0.3)",
                  }}
                >
                  <FiPlus size={15} />
                  <span className="hidden sm:inline">Create Service</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile quick-stats sub-bar */}
          <div
            className="sm:hidden flex items-center px-4 pb-2.5 overflow-x-auto gap-0"
            style={{ scrollbarWidth: "none" }}
          >
            {[
              {
                icon: <FiDollarSign size={13} />,
                label: "Service Rate",
                value: service?.starting_price
                  ? `₦${service.starting_price.toLocaleString()}`
                  : "Not set",
                color: "#EA580C",
              },
              {
                icon: <FiCalendar size={13} />,
                label: "Days Open",
                value: service?.availability_schedule
                  ? `${Object.keys(service.availability_schedule).length}/7 days`
                  : "0/7 days",
                color: "#10B981",
              },
              {
                icon: <FiZap size={13} />,
                label: "Booking",
                value: service?.booking_mode
                  ? service.booking_mode.charAt(0).toUpperCase() +
                    service.booking_mode.slice(1)
                  : "—",
                color: "#6366F1",
              },
            ].map(({ icon, label, value, color }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-0.5 shrink-0"
                style={i > 0 ? { borderLeft: "1px solid #F1F5F9" } : {}}
              >
                <span className="shrink-0" style={{ color }}>
                  {icon}
                </span>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                    {label}
                  </p>
                  <p className="text-[11px] font-black" style={{ color }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto">
          {/* ════════════════════════════════════════════════════
              ── HERO BANNER (REDESIGNED) ──
          ════════════════════════════════════════════════════ */}
          <div
            className="relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #6B0D10 0%, #8C1F10 22%, #A83318 42%, #C44D1A 62%, #D96318 80%, #E8751A 100%)",
            }}
          >
            {/* ── Background atmosphere ── */}
            {/* Top-right warm burst */}
            <div
              className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,200,100,0.28) 0%, transparent 65%)",
              }}
            />
            {/* Bottom-left depth shadow */}
            <div
              className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(60,5,0,0.75) 0%, transparent 65%)",
              }}
            />
            {/* Center ambient glow */}
            <div
              className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-56 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,140,40,0.45) 0%, transparent 70%)",
              }}
            />
            {/* Diagonal light slash overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(118deg, transparent 25%, rgba(255,255,255,0.045) 42%, transparent 55%)",
              }}
            />
            {/* Dot grid texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.11) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Top shimmer line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.45) 35%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.45) 65%, transparent 95%)",
              }}
            />
            {/* Corner rings */}
            <div
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            />
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{ border: "1px solid rgba(255,255,255,0.05)" }}
            />
            {/* Faded watermark */}
            <div
              className="absolute bottom-14 right-4 md:right-10 pointer-events-none select-none leading-none"
              style={{
                fontSize: "clamp(48px,8vw,96px)",
                fontWeight: 900,
                color: "rgba(255,255,255,0.04)",
                letterSpacing: "-0.04em",
                whiteSpace: "nowrap",
              }}
            >
              PROVIDER
            </div>

            {/* ── CARD CONTAINER ── */}
            <div className="relative z-10 px-3 sm:px-5 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-0">
              {/* ════ PREMIUM PROFILE CARD ════ */}
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
                style={{
                  background: "#FFFFFF",
                  boxShadow:
                    "0 28px 90px rgba(0,0,0,0.30), 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.95)",
                }}
              >
                {/* ── DIAGONAL SLASH DECORATIONS (top-right corner) ── */}
                <div className="absolute top-0 right-0 w-52 sm:w-64 h-full pointer-events-none overflow-hidden">
                  {/* Slash 1 — widest, most faded */}
                  <div
                    className="absolute"
                    style={{
                      top: "-40px",
                      right: "-28px",
                      width: "22px",
                      height: "220px",
                      background:
                        "linear-gradient(180deg, rgba(220,80,12,0.22) 0%, rgba(249,115,22,0.06) 100%)",
                      transform: "rotate(22deg)",
                      borderRadius: "8px",
                    }}
                  />
                  {/* Slash 2 */}
                  <div
                    className="absolute"
                    style={{
                      top: "-40px",
                      right: "4px",
                      width: "12px",
                      height: "200px",
                      background:
                        "linear-gradient(180deg, rgba(220,80,12,0.30) 0%, rgba(249,115,22,0.08) 100%)",
                      transform: "rotate(22deg)",
                      borderRadius: "6px",
                    }}
                  />
                  {/* Slash 3 — medium */}
                  <div
                    className="absolute"
                    style={{
                      top: "-40px",
                      right: "28px",
                      width: "8px",
                      height: "185px",
                      background:
                        "linear-gradient(180deg, rgba(234,88,12,0.35) 0%, rgba(249,115,22,0.10) 100%)",
                      transform: "rotate(22deg)",
                      borderRadius: "5px",
                    }}
                  />
                  {/* Slash 4 — thin bright */}
                  <div
                    className="absolute"
                    style={{
                      top: "-40px",
                      right: "48px",
                      width: "5px",
                      height: "170px",
                      background:
                        "linear-gradient(180deg, rgba(234,88,12,0.28) 0%, rgba(251,146,60,0.05) 100%)",
                      transform: "rotate(22deg)",
                      borderRadius: "4px",
                    }}
                  />
                  {/* Slash 5 — hairline accent */}
                  <div
                    className="absolute"
                    style={{
                      top: "-40px",
                      right: "62px",
                      width: "3px",
                      height: "150px",
                      background:
                        "linear-gradient(180deg, rgba(234,88,12,0.18) 0%, transparent 100%)",
                      transform: "rotate(22deg)",
                      borderRadius: "4px",
                    }}
                  />
                  {/* Subtle orange glow bloom behind slashes */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(234,88,12,0.10) 0%, transparent 70%)",
                    }}
                  />
                </div>

                {/* ── TOP ACCENT BAR — thicker, richer, multi-stop ── */}
                <div
                  className="h-[7px] w-full relative"
                  style={{
                    background:
                      "linear-gradient(90deg, #6B0D10 0%, #9A2E10 20%, #C44D1A 42%, #EA580C 62%, #F97316 82%, #FB923C 100%)",
                  }}
                >
                  {/* Bright shimmer on bar */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.25) 48%, transparent 76%)",
                    }}
                  />
                </div>

                {/* ── CARD BODY ── */}
                <div className="p-4 sm:p-5 md:p-6 relative z-10">
                  {/* Top row: avatar + info + edit button */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="p-[3px] rounded-2xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #C44D1A 0%, #EA580C 45%, #FB923C 100%)",
                          boxShadow: "0 10px 30px rgba(196,77,26,0.40)",
                        }}
                      >
                        {profile?.logo_url ? (
                          <Image
                            src={profile.logo_url}
                            alt="logo"
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-xl object-cover block"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-xl flex items-center justify-center text-xl md:text-2xl font-black text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #A83318, #C44D1A)",
                            }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>
                      {/* Status dot */}
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center"
                        style={{
                          background: service?.is_active
                            ? "#10B981"
                            : "#94A3B8",
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>

                    {/* Name, status, bio, contacts */}
                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <h1 className="text-slate-900 font-black text-lg sm:text-xl md:text-2xl leading-tight tracking-tight">
                          {profile?.business_name}
                        </h1>
                        <MdVerified
                          size={17}
                          style={{ color: "#EA580C" }}
                          className="shrink-0"
                        />
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 sm:mb-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-[5px] rounded-full uppercase tracking-wider"
                          style={
                            service?.is_active
                              ? {
                                  background: "#ECFDF5",
                                  color: "#059669",
                                  border: "1px solid #A7F3D0",
                                }
                              : {
                                  background: "#F8FAFC",
                                  color: "#94A3B8",
                                  border: "1px solid #E2E8F0",
                                }
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${service?.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                          />
                          {service?.is_active
                            ? "Live on Marketplace"
                            : "Currently Offline"}
                        </span>
                        {(profile?.rating ?? 0) > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-[5px] rounded-full"
                            style={{
                              background: "#FFFBEB",
                              color: "#B45309",
                              border: "1px solid #FDE68A",
                            }}
                          >
                            <FaStar size={8} className="text-amber-500" />
                            {profile?.rating?.toFixed(1)} ·{" "}
                            {profile?.review_count} reviews
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2.5 sm:mb-3 max-w-md capitalize">
                        {profile?.business_bio ||
                          "Precision-crafted service delivered with professionalism and care."}
                      </p>

                      {/* Contact chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {profile?.whatsapp_number && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-medium"
                            style={{
                              background: "#F0FDF4",
                              color: "#15803D",
                              border: "1px solid #BBF7D0",
                            }}
                          >
                            <FaWhatsapp size={10} />
                            {profile.whatsapp_number}
                          </span>
                        )}
                        {profile?.phone_number && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-medium"
                            style={{
                              background: "#F8FAFC",
                              color: "#475569",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <FiPhone size={10} />
                            {profile.phone_number}
                          </span>
                        )}
                        {service?.location && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-medium"
                            style={{
                              background: "#FFF7ED",
                              color: "#C2410C",
                              border: "1px solid #FED7AA",
                            }}
                          >
                            <FiMapPin size={10} />
                            {service.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit button — top right */}
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, #A83318, #C44D1A, #EA580C)",
                        boxShadow: "0 4px 18px rgba(168,51,24,0.40)",
                      }}
                    >
                      <FiEdit2 size={13} />
                      <span className="hidden xs:inline sm:hidden md:inline">
                        Edit
                      </span>
                    </button>
                  </div>

                  {/* ── STAT STRIP ── */}
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 mt-4 sm:mt-5 pt-4"
                    style={{ borderTop: "1px solid #F1F5F9" }}
                  >
                    {[
                      {
                        icon: <FiDollarSign size={12} />,
                        label: "Service Rate",
                        value: `₦${(service?.starting_price ?? 0).toLocaleString()}`,
                        color: "#EA580C",
                        borderCls: "border-r border-b md:border-b-0",
                      },
                      {
                        icon: <FiActivity size={12} />,
                        label: "Status",
                        value: service?.is_active ? "Active" : "Inactive",
                        color: service?.is_active ? "#059669" : "#94A3B8",
                        borderCls: "border-b md:border-b-0 md:border-r",
                      },
                      {
                        icon: <FiZap size={12} />,
                        label: "Booking",
                        value: service?.booking_mode
                          ? service.booking_mode.charAt(0).toUpperCase() +
                            service.booking_mode.slice(1)
                          : "Not set",
                        color: "#6366F1",
                        borderCls: "border-r",
                      },
                      {
                        icon: <FiCalendar size={12} />,
                        label: "Availability",
                        value:
                          service?.availability_schedule &&
                          Object.keys(service.availability_schedule).length > 0
                            ? `${Object.keys(service.availability_schedule).length}/7 days`
                            : "Not set",
                        color: "#0891B2",
                        borderCls: "",
                      },
                    ].map(({ icon, label, value, color, borderCls }, i) => (
                      <div
                        key={i}
                        className={`px-3 md:px-4 py-3 md:py-1 border-slate-100 ${borderCls}`}
                      >
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <span style={{ color }}>{icon}</span>
                          {label}
                        </p>
                        <p
                          className="font-black text-sm md:text-base leading-tight"
                          style={{ color }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── BOTTOM ACCENT BAR — subtle mirror of top ── */}
                <div
                  className="h-[3px] w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(234,88,12,0.15) 30%, rgba(249,115,22,0.25) 55%, rgba(234,88,12,0.12) 80%, transparent 100%)",
                  }}
                />
              </div>
            </div>

            {/* ── CURVE TRANSITION ── */}
            <div
              className="relative w-full overflow-hidden"
              style={{ height: "56px", marginTop: "-1px" }}
            >
              <svg
                className="absolute bottom-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1440 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V64Z"
                  fill="#F8FAFC"
                />
              </svg>
            </div>
          </div>
          {/* ════════════════════ END HERO BANNER ════════════════════ */}

          {/* ── MAIN BODY ── */}
          <div className="px-5 md:px-8 py-8 space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                icon={<FiDollarSign size={18} />}
                label="Service Rate"
                prefix="₦"
                value={
                  service?.starting_price != null
                    ? service.starting_price.toLocaleString()
                    : "0"
                }
                color="#F97316"
                trend="+24%"
                trendUp
              />
              <MetricCard
                icon={<FiPackage size={18} />}
                label="Active Service"
                value={activeServiceCount}
                color="#6366F1"
                trend={activeServiceText}
                trendUp={activeServiceCount === 1}
              />
              <MetricCard
                icon={<FiCalendar size={18} />}
                label="Available Days"
                value={
                  service?.availability_schedule
                    ? Object.keys(service.availability_schedule).length
                    : 0
                }
                suffix="/7"
                color="#10B981"
                trend={service?.is_active ? "Live" : "Offline"}
                trendUp={service?.is_active}
              />
            </div>

            {/* Quick Actions Row */}
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

            {/* Edit Profile Modal */}
            {editingProfile && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{
                  backgroundColor: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
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
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: "logo_url", label: "Logo URL" },
                        { key: "cover_image_url", label: "Cover Image URL" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                            {label}
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                            placeholder="https://..."
                            value={(profForm as any)[key]}
                            onChange={(e) =>
                              setProfForm((f) => ({
                                ...f,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
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
                  {profile?.cover_image_url && (
                    <div className="h-28 sm:h-36 overflow-hidden">
                      <Image
                        src={profile.cover_image_url}
                        alt="cover"
                        sizes="(max-width: 639px) 100vw, 900px"
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
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
                          onClick={toggleActive}
                          disabled={togglingActive}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all"
                          style={
                            service.is_active
                              ? {
                                  background: "rgba(239,68,68,0.08)",
                                  color: "#DC2626",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                }
                              : {
                                  background: "rgba(16,185,129,0.08)",
                                  color: "#059669",
                                  border: "1px solid rgba(16,185,129,0.2)",
                                }
                          }
                        >
                          {togglingActive ? (
                            <Spinner />
                          ) : service.is_active ? (
                            <FiToggleRight size={14} />
                          ) : (
                            <FiToggleLeft size={14} />
                          )}
                          <span className="hidden xs:inline">
                            {service.is_active ? "Deactivate" : "Activate"}
                          </span>
                        </button>
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
