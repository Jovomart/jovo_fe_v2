"use client";
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
} from "react-icons/fa";
import {
  MdVerified,
  MdOutlineInventory2,
  MdOutlineDeliveryDining,
  MdOutlineSwapHoriz,
} from "react-icons/md";
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

/* ─── Fallback categories in case API fails ─────────────────────── */
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

/* ─── icon mapping for visual display (UI only) ─────── */
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

/* ─── small helpers ─────────────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all";
const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
};
const labelCls =
  "text-white/50 text-[10px] font-black mb-1.5 block uppercase tracking-widest";

function formatPrice(type: string, price: number) {
  if (type === "negotiable") return "Negotiable";
  const prefix = type === "starting_at" ? "From " : "";
  return `${prefix}₦${price.toLocaleString()}`;
}

/* ─── sub-components ────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
    pending: {
      label: "Pending",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
    },
    inactive: {
      label: "Inactive",
      color: "#6B7280",
      bg: "rgba(107,114,128,0.12)",
    },
  };
  const c = cfg[status] || cfg["pending"];
  return (
    <span
      className="text-[10px] font-black px-2.5 py-1 rounded-full"
      style={{ color: c.color, background: c.bg }}
    >
      ● {c.label}
    </span>
  );
}

/* ─── schedule builder (redesigned) ─────────────────────────────── */
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

/* ─── service form (redesigned) ─────────────────────────────────── */
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

/* ─── Metric Card Component ─────────────────────────────────────── */
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
    className="bg-white rounded-2xl p-5 border border-slate-100"
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

/* ─── MAIN DASHBOARD ────────────────────────────────────────────── */
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

  const [profForm, setProfForm] = useState({
    business_name: "",
    business_bio: "",
    whatsapp_number: "",
    logo_url: "",
    cover_image_url: "",
  });
  const [profError, setProfError] = useState("");
  const [serviceError, setServiceError] = useState("");

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
      if (
        response?.data?.categories &&
        Array.isArray(response.data.categories)
      ) {
        cats = response.data.categories;
      } else if (Array.isArray(response)) {
        cats = response;
      } else if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      }

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
      } catch {
        router.replace("/services/apply");
        return;
      }

      if (!profRes) {
        router.replace("/services/apply");
        return;
      }

      const p = profRes?.data || profRes;

      let providerCats: string[] = [];
      if (p.service_category && Array.isArray(p.service_category)) {
        providerCats = p.service_category;
      } else if (p.service_categories && Array.isArray(p.service_categories)) {
        providerCats = p.service_categories;
      } else if (p.categories && Array.isArray(p.categories)) {
        providerCats = p.categories;
      } else if (p.category) {
        providerCats = [p.category];
      } else if (p.category_id) {
        providerCats = [p.category_id];
      }

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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const directData = await directResponse.json();

      let svcData = null;

      if (directData?.data) {
        const dataObj = directData.data;

        if (Array.isArray(dataObj) && dataObj.length > 0) {
          svcData = dataObj[0];
        } else if (dataObj && typeof dataObj === "object") {
          if (
            dataObj.services &&
            Array.isArray(dataObj.services) &&
            dataObj.services.length > 0
          ) {
            svcData = dataObj.services[0];
          } else if (
            dataObj.items &&
            Array.isArray(dataObj.items) &&
            dataObj.items.length > 0
          ) {
            svcData = dataObj.items[0];
          } else if (
            dataObj.results &&
            Array.isArray(dataObj.results) &&
            dataObj.results.length > 0
          ) {
            svcData = dataObj.results[0];
          } else if (dataObj.id) {
            svcData = dataObj;
          } else {
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
          body: JSON.stringify({
            ...serviceData,
            availability_schedule: {},
          }),
        },
      );

      const createResponseText = await createResponse.text();

      if (!createResponse.ok) {
        throw new Error(`Create failed: ${createResponseText}`);
      }

      const createResult = JSON.parse(createResponseText);
      const serviceId = createResult.data?.id;

      if (!serviceId) {
        throw new Error("No service ID returned");
      }

      if (Object.keys(availability_schedule).length > 0) {
        await fetch(
          `https://dev-api-jovomart.onrender.com/api/v1/service-provider/services/${serviceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              availability_schedule: availability_schedule,
            }),
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

  const getCategoryDisplay = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const catInfo = service ? getCategoryDisplay(service.category_id) : null;
  const dotBg = {
    backgroundImage:
      "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
    backgroundSize: "28px 28px",
  };

  const hasApprovedCategories =
    allowedCategoryIds.length > 0 &&
    categories.some((cat) => allowedCategoryIds.includes(cat.id));
  
  // Calculate active service count - 1 if service exists AND is_active === true, otherwise 0
  const activeServiceCount = hasService && service?.is_active === true ? 1 : 0;
  const activeServiceText = activeServiceCount === 1 ? "Active" : "Inactive";

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

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>

     {/* Hero Header - Optimized & Performant */}
<div
  className="relative overflow-hidden"
  style={{
    background: "linear-gradient(135deg, #E65C00 0%, #FF8C00 50%, #FFB347 100%)",
  }}
>
  {/* Single static background pattern - no animation */}
  <div 
    className="absolute inset-0 opacity-20 pointer-events-none"
    style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
    }}
  />
  
  {/* Single static gradient orb - no animation */}
  <div 
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
    style={{
      background: "radial-gradient(circle, #ffffff, transparent 70%)",
    }}
  />
  
  {/* Top accent line - static */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

  <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
    {/* Back Link */}
    <Link
      href="/services"
      className="inline-flex items-center gap-2 text-white/80 text-sm font-medium hover:text-white transition-colors mb-8"
    >
      <FiArrowLeft size={14} /> 
      Back to Services
    </Link>

    {/* Profile Header Card - Simplified */}
    <div className="relative">
      {/* Main Card - No animated borders */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
        {/* Simple top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
        
        {/* Simple card pattern - one div instead of SVG */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            
            {/* Avatar Section - No animated ring */}
            <div className="relative shrink-0">
              <div className="relative">
                {profile?.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="logo"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #E65C00, #FF8C00, #FFB347)",
                    }}
                  >
                    {profile?.business_name?.charAt(0).toUpperCase() || "P"}
                  </div>
                )}
              </div>
              {/* Status Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <StatusBadge
                  status={
                    profile?._resolvedStatus ||
                    profile?.status ||
                    profile?.provider_status ||
                    "pending"
                  }
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1
                  className="text-slate-800 font-bold text-2xl md:text-3xl tracking-tight uppercase"
                >
                  {profile?.business_name}
                </h1>
                {(profile?.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1.5 rounded-full">
                    <FaStar size={11} className="text-amber-400" />
                    <span className="text-slate-700 text-sm font-semibold">
                      {profile?.rating?.toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs">
                      {profile?.review_count} reviews
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl mb-3">
                {profile?.business_bio ||
                  "Professional service provider on the JOVO marketplace."}
              </p>

              {/* Contact Information */}
              <div className="flex flex-wrap gap-2">
                {profile?.whatsapp_number && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <FaWhatsapp size={11} className="text-emerald-500" />
                    <span className="text-slate-600 text-xs font-medium">{profile.whatsapp_number}</span>
                  </div>
                )}
                {profile?.phone_number && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    <FiPhone size={11} className="text-slate-400" />
                    <span className="text-slate-600 text-xs">{profile.phone_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setEditingProfile(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 shrink-0 shadow-md"
              style={{
                background: "linear-gradient(135deg, #E65C00, #FF8C00)",
              }}
            >
              <FiEdit2 size={13} /> Edit Profile
            </button>
          </div>

          {/* Stats Row - Simplified */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-200">
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Total Earnings</p>
              <p className="text-slate-800 text-lg font-bold">₦{service?.starting_price?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Service Status</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${service?.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <p className="text-slate-700 text-sm font-semibold">{service?.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Booking Mode</p>
              <p className="text-slate-700 text-sm font-semibold capitalize">{service?.booking_mode || 'Not set'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Availability</p>
              <p className="text-slate-700 text-sm font-semibold">
                {service && Object.keys(service.availability_schedule).length > 0 
                  ? `${Object.keys(service.availability_schedule).length}/7 days` 
                  : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={<FiDollarSign size={18} />}
            label="Total Earnings"
            prefix="₦"
            value={
              service?.starting_price
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
              service ? Object.keys(service.availability_schedule).length : 0
            }
            suffix="/7"
            color="#10B981"
            trend={service?.is_active ? "Live" : "Offline"}
            trendUp={service?.is_active}
          />
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
                <h2
                  className="font-black text-slate-900 text-lg"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
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
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Business Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    value={profForm.business_name}
                    onChange={(e) =>
                      setProfForm((f) => ({
                        ...f,
                        business_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Business Bio
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition resize-none"
                    rows={3}
                    value={profForm.business_bio}
                    onChange={(e) =>
                      setProfForm((f) => ({
                        ...f,
                        business_bio: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    WhatsApp Number
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    value={profForm.whatsapp_number}
                    onChange={(e) =>
                      setProfForm((f) => ({
                        ...f,
                        whatsapp_number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Logo URL
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                      placeholder="https://..."
                      value={profForm.logo_url}
                      onChange={(e) =>
                        setProfForm((f) => ({ ...f, logo_url: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Cover Image URL
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl text-sm text-slate-700 border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                      placeholder="https://..."
                      value={profForm.cover_image_url}
                      onChange={(e) =>
                        setProfForm((f) => ({
                          ...f,
                          cover_image_url: e.target.value,
                        }))
                      }
                    />
                  </div>
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

        {/* Service Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="text-slate-900 font-black text-xl"
                style={{ fontFamily: "'Georgia',serif" }}
              >
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
            <div className="p-4 rounded-2xl text-red-500 text-sm mb-4 flex items-start gap-2 bg-red-50 border border-red-200">
              <FiAlertCircle size={15} className="shrink-0 mt-0.5" />{" "}
              {serviceError}
            </div>
          )}

          {/* Create Service Form */}
          {showServiceForm && !hasService && (
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3
                  className="font-black text-slate-900 text-lg"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
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

          {/* No Service Empty State */}
          {!hasService && !showServiceForm && (
            <div
              className="bg-white rounded-3xl p-12 text-center"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
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
              <p
                className="font-black text-slate-800 text-lg mb-2"
                style={{ fontFamily: "'Georgia',serif" }}
              >
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
          {/* Service Card Display */}
          {hasService && service && !editingService && (
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              {profile?.cover_image_url && (
                <div className="h-28 sm:h-36 overflow-hidden">
                  <img
                    src={profile.cover_image_url}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 sm:p-6">
                {/* Header Section - Stack on mobile, row on tablet+ */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        catInfo?.gradient || getGradientForCategory("default"),
                    }}
                  >
                    {catInfo?.icon || (
                      <FaTools size={18} className="text-white sm:text-xl" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title & Status - Stack on very small, row on mobile landscape */}
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 flex-wrap mb-1">
                      <h3
                        className="font-black text-slate-900 text-lg sm:text-xl"
                        style={{ fontFamily: "'Georgia',serif" }}
                      >
                        {service.display_name}
                      </h3>
                      <span
                        className={`text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-full w-fit ${service.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {service.is_active ? "● Active" : "● Inactive"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <FiMapPin
                        size={12}
                        className="text-[#B42225] sm:text-[13px]"
                      />{" "}
                      {service.location}
                    </p>
                  </div>

                  {/* Action Buttons - Wrap on mobile, row on desktop */}
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

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 line-clamp-3 sm:line-clamp-none">
                  {service.description}
                </p>

                {/* Info Grid - 2 columns on mobile, 4 columns on tablet+ */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 py-4 border-t border-b border-slate-100 mb-5">
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <p className="font-black text-[#B42225] text-sm sm:text-base break-words">
                      {formatPrice(service.price_type, service.starting_price)}
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

                {/* Delete Confirmation - Responsive */}
                {confirmDelete && (
                  <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-red-50 border border-red-200">
                    <p className="text-sm font-black text-slate-800 mb-1">
                      Delete this service?
                    </p>
                    <p className="text-xs text-slate-500 mb-3 sm:mb-4">
                      This will remove your service card from the marketplace
                      permanently.
                    </p>
                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
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
            <div
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3
                  className="font-black text-slate-900 text-lg"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Edit Service
                </h3>
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
      </div>

      <Footer />
    </div>
  );
}