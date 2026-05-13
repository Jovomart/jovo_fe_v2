"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiTool,
  FiLoader,
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
} from "react-icons/fa";
import apiService from "@/services/apiService";
import { AuthContext } from "@/context/AuthContext";

const STEPS = ["Business Info", "Your Skills", "Review & Submit"];

// Category Skeleton Component
const CategorySkeleton = () => (
  <div
    className="relative flex items-center gap-3 p-4 rounded-2xl animate-pulse"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div className="w-10 h-10 rounded-xl bg-gray-700" />
    <div className="flex-1">
      <div className="h-3 bg-gray-700 rounded w-24 mb-2" />
      <div className="h-2 bg-gray-700 rounded w-32" />
    </div>
  </div>
);

// Icon mapping function (UI only - maps category names to icons)
const getCategoryIcon = (categoryName: string): React.ReactNode => {
  const name = categoryName.toLowerCase();
  if (name.includes("clean")) return <FaBroom size={14} />;
  if (name.includes("salon") || name.includes("barber"))
    return <FaCut size={14} />;
  if (name.includes("laundry")) return <FaTshirt size={14} />;
  if (name.includes("electrical")) return <FaBolt size={14} />;
  if (name.includes("repair")) return <FaWrench size={14} />;
  if (name.includes("tutor")) return <FaChalkboardTeacher size={14} />;
  if (name.includes("photo")) return <FaCamera size={14} />;
  return <FaBroom size={14} />;
};

const getCategoryGradient = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes("clean")) return "linear-gradient(135deg,#B42225,#FF6B00)";
  if (name.includes("salon") || name.includes("barber"))
    return "linear-gradient(135deg,#7C3AED,#A78BFA)";
  if (name.includes("laundry"))
    return "linear-gradient(135deg,#0891B2,#06B6D4)";
  if (name.includes("electrical"))
    return "linear-gradient(135deg,#D97706,#F59E0B)";
  if (name.includes("repair")) return "linear-gradient(135deg,#059669,#10B981)";
  if (name.includes("tutor")) return "linear-gradient(135deg,#2563EB,#60A5FA)";
  if (name.includes("photo")) return "linear-gradient(135deg,#DB2777,#F472B6)";
  return "linear-gradient(135deg,#6B7280,#9CA3AF)";
};

interface ApiCategory {
  id: string;
  name: string;
  description?: string;
  category_type?: string;
  is_active?: boolean;
}

interface DisplayCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const { isServiceProvider, isLoading: authLoading } = useContext(AuthContext) as any;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    business_bio: "",
    whatsapp_number: "",
    service_category: [] as string[],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already a service provider
  useEffect(() => {
    if (mounted && isServiceProvider) {
      router.replace("/service-dashboard");
    }
  }, [isServiceProvider, router, mounted]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiService.getPublicCategories("SERVICE");
        console.log("Categories API response:", response);

        let categoriesData = response?.data || response;

        if (
          categoriesData?.categories &&
          Array.isArray(categoriesData.categories)
        ) {
          categoriesData = categoriesData.categories;
        } else if (
          categoriesData?.items &&
          Array.isArray(categoriesData.items)
        ) {
          categoriesData = categoriesData.items;
        } else if (!Array.isArray(categoriesData)) {
          categoriesData = [];
        }

        const mappedCategories: DisplayCategory[] = categoriesData
          .filter((cat: ApiCategory) => cat.is_active !== false)
          .map((cat: ApiCategory) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || `${cat.name} services`,
            icon: getCategoryIcon(cat.name),
            gradient: getCategoryGradient(cat.name),
          }));

        setCategories(mappedCategories);
        console.log("Mapped categories:", mappedCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load service categories. Please refresh the page.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const update = (key: string, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleCat = (id: string) =>
    setForm((f) => ({
      ...f,
      service_category: f.service_category.includes(id)
        ? f.service_category.filter((c) => c !== id)
        : [...f.service_category, id],
    }));

  const canNext = () => {
    if (step === 0)
      return (
        form.business_name.trim().length >= 2 &&
        form.business_bio.trim().length >= 10 &&
        form.whatsapp_number.trim().length >= 7
      );
    if (step === 1) return form.service_category.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.applyAsServiceProvider({
        ...form,
        whatsapp_number: form.whatsapp_number.startsWith("234")
          ? form.whatsapp_number
          : `234${form.whatsapp_number.replace(/^0/, "")}`,
      });
      const id =
        res?.data?.service_provider_id ||
        res?.service_provider_id ||
        res?.id ||
        (typeof res === "string" ? res : null);
      if (id) localStorage.setItem("sp_pending_id", String(id));
      router.push("/services/apply/verify");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F5F9" }}>
        <div className="w-8 h-8 border-2 border-[#B42225]/20 border-t-[#B42225] rounded-full animate-spin" />
      </div>
    );
  }

  // If already a service provider, don't render
  if (isServiceProvider) {
    return null;
  }

  /* ─── helpers ─────────────────────────────────────────────── */
  const dotBg = {
    backgroundImage:
      "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)",
    backgroundSize: "28px 28px",
  };
  const glassBorder = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };
  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)",
      }}
    >
      {/* bg textures */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={dotBg}
      />
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle,#FF8C00,transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 md:py-16">
        {/* back */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-white/40 text-xs font-semibold hover:text-white/70 transition-colors mb-8"
        >
          <FiArrowLeft size={14} /> Back to Services
        </Link>

        {/* page header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/60 text-[10px] font-bold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            <FiTool size={11} /> Service Provider Application
          </div>
          <h1
            className="text-3xl md:text-4xl font-black text-white leading-tight"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            Earn with your
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#FF8C00,#FFB347)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              skills & expertise
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Join providers already earning on JOVO
          </p>
        </div>

        {/* step progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  style={
                    i <= step
                      ? {
                          background: "linear-gradient(135deg,#B42225,#FF8C00)",
                          color: "#fff",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.3)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  {i < step ? <FiCheck size={14} /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-bold whitespace-nowrap hidden sm:block ${i === step ? "text-white/80" : "text-white/25"}`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2 mb-4 transition-all"
                  style={{
                    background:
                      i < step
                        ? "linear-gradient(90deg,#FF8C00,#B42225)"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* form card */}
        <div
          className="rounded-3xl p-6 md:p-8 backdrop-blur-xl"
          style={{ ...glassBorder, backdropFilter: "blur(20px)" }}
        >
          {/* ── STEP 0: Business Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2
                  className="text-white font-black text-lg mb-1"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Tell us about your business
                </h2>
                <p className="text-white/40 text-xs">
                  This info will appear on your public service card
                </p>
              </div>

              <div>
                <label className="text-white/50 text-[10px] font-black mb-2 block uppercase tracking-widest">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => update("business_name", e.target.value)}
                  placeholder="e.g. Sparkle Clean Services"
                  className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/20 outline-none focus:border-orange-500/50 transition-all"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-white/50 text-[10px] font-black mb-2 block uppercase tracking-widest">
                  Business Bio *
                </label>
                <textarea
                  value={form.business_bio}
                  onChange={(e) =>
                    update("business_bio", e.target.value.slice(0, 300))
                  }
                  placeholder="Describe what you offer, your experience, and what makes you stand out..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/20 outline-none resize-none transition-all"
                  style={inputStyle}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-white/20 text-[10px]">
                    Minimum 10 characters
                  </p>
                  <p
                    className={`text-[10px] font-semibold ${form.business_bio.length >= 280 ? "text-orange-400" : "text-white/25"}`}
                  >
                    {form.business_bio.length}/300
                  </p>
                </div>
              </div>

              <div>
                <label className="text-white/50 text-[10px] font-black mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                  <FaWhatsapp className="text-green-400" size={12} />
                  WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  <div
                    className="px-4 py-3.5 rounded-2xl text-sm text-white/40 font-bold flex items-center shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    +234
                  </div>
                  <input
                    type="tel"
                    value={form.whatsapp_number}
                    onChange={(e) =>
                      update(
                        "whatsapp_number",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="8012345678"
                    className="flex-1 px-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/20 outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
                <p className="text-white/20 text-[10px] mt-1">
                  Customers will reach you directly via WhatsApp
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 1: Categories (DYNAMIC FROM BACKEND) ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2
                  className="text-white font-black text-lg mb-1"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  What services do you offer?
                </h2>
                <p className="text-white/40 text-xs">
                  Select all that apply — you can only list services in these
                  categories later
                </p>
              </div>

              {loadingCategories ? (
                <div className="space-y-3">
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">
                    No service categories available at the moment.
                  </p>
                  <p className="text-white/20 text-xs mt-2">
                    Please check back later or contact support.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map(
                    ({ id, name, icon, gradient, description }) => {
                      const sel = form.service_category.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleCat(id)}
                          className="relative flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
                          style={{
                            background: sel
                              ? "rgba(255,255,255,0.09)"
                              : "rgba(255,255,255,0.04)",
                            border: sel
                              ? "1px solid rgba(255,140,0,0.45)"
                              : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: sel
                              ? "0 0 0 1px rgba(255,140,0,0.15) inset"
                              : "none",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: gradient }}
                          >
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-black">
                              {name}
                            </p>
                            <p className="text-white/35 text-[10px] mt-0.5">
                              {description}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${sel ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                            style={{
                              background:
                                "linear-gradient(135deg,#FF8C00,#B42225)",
                            }}
                          >
                            <FiCheck size={11} className="text-white" />
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}

              {form.service_category.length > 0 && (
                <p className="text-[#FF8C00] text-xs font-bold flex items-center gap-1.5">
                  <FiCheck size={12} />
                  {form.service_category.length} categor
                  {form.service_category.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2
                  className="text-white font-black text-lg mb-1"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Review your application
                </h2>
                <p className="text-white/40 text-xs">
                  Check everything before submitting
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Business Name", value: form.business_name },
                  { label: "WhatsApp", value: `+234${form.whatsapp_number}` },
                  { label: "Bio", value: form.business_bio },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-4 rounded-2xl"
                    style={glassBorder}
                  >
                    <p className="text-white/35 text-[9px] font-black uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-white text-sm leading-relaxed">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="p-4 rounded-2xl" style={glassBorder}>
                  <p className="text-white/35 text-[9px] font-black uppercase tracking-widest mb-2">
                    Service Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.service_category.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      if (!cat) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[11px] font-bold"
                          style={{ background: cat.gradient }}
                        >
                          {cat.icon} {cat.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <div
                  className="p-4 rounded-2xl text-red-400 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <div
                className="p-4 rounded-2xl text-xs leading-relaxed"
                style={{
                  background: "rgba(255,140,0,0.06)",
                  border: "1px solid rgba(255,140,0,0.15)",
                }}
              >
                <span className="text-[#FF8C00] font-bold">
                  📱 What happens next:
                </span>
                <span className="text-white/40 ml-1">
                  After submitting, a 6-digit OTP will be sent to your WhatsApp
                  to verify and activate your account.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* nav buttons */}
        <div className="flex items-center gap-3 mt-5">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-black text-white/60 hover:text-white transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <FiArrowLeft size={15} /> Back
            </button>
          )}

          <button
            onClick={
              step < STEPS.length - 1
                ? () => setStep((s) => s + 1)
                : handleSubmit
            }
            disabled={!canNext() || loading || loadingCategories}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                canNext() && !loading && !loadingCategories
                  ? "linear-gradient(135deg,#B42225,#FF8C00)"
                  : "rgba(255,255,255,0.08)",
              boxShadow:
                canNext() && !loading && !loadingCategories
                  ? "0 8px 28px rgba(180,34,37,0.35)"
                  : "none",
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                Submitting...
              </>
            ) : step < STEPS.length - 1 ? (
              <>
                Continue <FiArrowRight size={15} />
              </>
            ) : (
              <>
                Submit Application <FiArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* already applied note */}
        <p className="text-center text-white/25 text-[11px] mt-5">
          Already applied?{" "}
          <Link
            href="/services/apply/verify"
            className="text-[#FF8C00] hover:text-[#FFB347] transition-colors font-semibold"
          >
            Verify your OTP
          </Link>
        </p>
      </div>
    </div>
  );
}