"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiFileText,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import { FaStore, FaRocket } from "react-icons/fa";
import { MdStorefront, MdBadge, MdDirectionsCar, MdSchool } from "react-icons/md";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  business_name: string;
  short_business_description: string;
  business_address: string;
  seller_document_type: string;
  seller_document_file: File | null;
  seller_document_preview: string;
  seller_document_name: string;
  // After Cloudinary upload this holds the CDN URL; submission uses this
  seller_document_url: string;
}

interface Errors {
  business_name?: string;
  short_business_description?: string;
  business_address?: string;
  seller_document_type?: string;
  seller_document_file?: string;
}

// ─── Document types ───────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  {
    value: "PASSPORT",
    label: "Passport",
    icon: <FiFileText size={20} />,
    hint: "International passport biodata page",
  },
  {
    value: "ID_CARD",
    label: "ID Card",
    icon: <MdBadge size={20} />,
    hint: "National identity card (front & back)",
  },
  {
    value: "DRIVING_LICENSE",
    label: "Driving Licence",
    icon: <MdDirectionsCar size={20} />,
    hint: "Valid driver's licence",
  },
  {
    value: "SCHOOL_ID_CARD",
    label: "School ID Card",
    icon: <MdSchool size={20} />,
    hint: "Current student ID card",
  },
];

const STEPS = [
  { id: 1, label: "Business Info", icon: <MdStorefront size={16} /> },
  { id: 2, label: "Verification", icon: <FiShield size={16} /> },
  { id: 3, label: "Review", icon: <FiCheck size={16} /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
      <FiAlertCircle size={11} /> {msg}
    </p>
  ) : null;

const InputField = ({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
      {label} {required && <span className="text-[#B42225]">*</span>}
    </label>
    {hint && <p className="text-[11px] text-gray-400 -mt-0.5">{hint}</p>}
    {children}
    <FieldError msg={error} />
  </div>
);

const inputCls = (error?: string) =>
  `w-full px-4 py-3 rounded-2xl text-sm border outline-none transition-all bg-white ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-[#B42225] focus:ring-2 focus:ring-[#B42225]/10"
  }`;

// ─── Status Screen ────────────────────────────────────────────────────────────

const StatusScreen = ({
  status,
  rejectionReason,
  onReapply,
}: {
  status: string;
  rejectionReason: string;
  onReapply: () => void;
}) => {
  const router = useRouter();
  const configs: Record<string, any> = {
    pending: {
      icon: <FiClock size={32} className="text-amber-500" />,
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-700",
      badgeText: "Under Review",
      title: "Seller Application Submitted!",
      desc: "Your seller application is being reviewed by our team. We'll notify you via email within 24–48 hours.",
      accentColor: "#F59E0B",
    },
    approved: {
      icon: <FiCheckCircle size={32} className="text-green-500" />,
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
      badgeText: "Approved ✓",
      title: "You're a Verified Seller!",
      desc: "Congratulations! Your seller account is approved. Head to your seller dashboard to start listing products.",
      accentColor: "#10B981",
    },
    rejected: {
      icon: <FiX size={32} className="text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-100 text-red-700",
      badgeText: "Not Approved",
      title: "Application Not Approved",
      desc: "Unfortunately your seller application wasn't approved this time. You may reapply. Review the requirements and try again.",
      accentColor: "#EF4444",
    },
  };

  const c = configs[status] || configs.pending;

  return (
    <div
      className={`rounded-3xl border-2 p-8 text-center ${c.bg} ${c.border}`}
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
    >
      <div
        className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-5 shadow-md"
        style={{ border: `3px solid ${c.accentColor}30` }}
      >
        {c.icon}
      </div>
      <span
        className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${c.badge}`}
      >
        {c.badgeText}
      </span>
      <h2
        className="text-2xl font-black text-gray-900 mt-5 mb-2"
        style={{ fontFamily: "'Georgia',serif" }}
      >
        {c.title}
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-3">
        {c.desc}
      </p>

      {rejectionReason && (
        <div className="bg-red-100 border border-red-200 rounded-2xl px-4 py-3 mb-5 text-left max-w-sm mx-auto">
          <p className="text-xs font-black text-red-700 mb-1">Reason:</p>
          <p className="text-xs text-red-600 leading-relaxed">{rejectionReason}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {status === "approved" && (
          <button
            onClick={() => router.push("/seller/dashboard")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg,#059669,#10B981)",
              boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
            }}
          >
            <FaStore size={14} /> Go to Dashboard <FiArrowRight size={13} />
          </button>
        )}
        {status === "rejected" && onReapply && (
          <button
            onClick={onReapply}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg,#B42225,#FF6B00)",
              boxShadow: "0 8px 24px rgba(180,34,37,0.3)",
            }}
          >
            <FiRefreshCw size={14} /> Reapply Now
          </button>
        )}
        <button
          onClick={() => router.push("/seller/application-status")}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all"
        >
          Check Status
        </button>
        <Link
          href="/shop"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerApplication = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Upload state — separate from form submission loading
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [form, setForm] = useState<FormData>({
    business_name: "",
    short_business_description: "",
    business_address: "",
    seller_document_type: "PASSPORT",
    seller_document_file: null,
    seller_document_preview: "",
    seller_document_name: "",
    seller_document_url: "",   // populated after Cloudinary upload
  });
  const [errors, setErrors] = useState<Errors>({});

  const setFormField = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  // ── File selection → immediately upload to Cloudinary ──────────────────────
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous upload state
    setUploadError("");
    setErrors((p) => ({ ...p, seller_document_file: "" }));

    // Client-side validation
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({
        ...p,
        seller_document_file: "Only JPG, PNG, or PDF files allowed.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({
        ...p,
        seller_document_file: "File must be under 5MB.",
      }));
      return;
    }

    // Local preview (images only)
    const preview = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : "";

    setForm((p) => ({
      ...p,
      seller_document_file: file,
      seller_document_preview: preview,
      seller_document_name: file.name,
      seller_document_url: "",   // clear any previous URL while re-uploading
    }));

    // Upload to Cloudinary via ApiService
    setUploading(true);
    setUploadProgress(0);

    try {
      // Fake progress ticks while waiting (real progress isn't available via fetch)
      const ticker = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 8, 88));
      }, 200);

      const result = await apiService.uploadFiles([file], "seller_document");

      clearInterval(ticker);
      setUploadProgress(100);

      const uploadedUrl = result?.primary_url || result?.urls?.[0];
      if (!uploadedUrl) throw new Error("No URL returned from upload.");

      // Swap the blob preview for the real CDN URL
      if (preview) URL.revokeObjectURL(preview);
      setForm((p) => ({
        ...p,
        seller_document_preview: file.type.startsWith("image/") ? uploadedUrl : "",
        seller_document_url: uploadedUrl,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
      // Reset file selection so user can retry
      setForm((p) => ({
        ...p,
        seller_document_file: null,
        seller_document_preview: "",
        seller_document_name: "",
        seller_document_url: "",
      }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: Errors = {};
    if (!form.business_name.trim())
      e.business_name = "Business name is required.";
    else if (form.business_name.trim().length < 2)
      e.business_name = "Must be at least 2 characters.";
    if (!form.short_business_description.trim())
      e.short_business_description = "Description is required.";
    else if (form.short_business_description.trim().length < 20)
      e.short_business_description = "Please write at least 20 characters.";
    if (!form.business_address.trim())
      e.business_address = "Business address is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    if (!form.seller_document_type)
      e.seller_document_type = "Document type is required.";
    if (!form.seller_document_file)
      e.seller_document_file = "Please upload your document.";
    else if (!form.seller_document_url)
      e.seller_document_file = "Document is still uploading. Please wait.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  // Document is already on Cloudinary — just send the URL + metadata

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await apiService.applyAsSeller({
        business_name: form.business_name.trim(),
        short_business_description: form.short_business_description.trim(),
        business_address: form.business_address.trim(),
        seller_document: form.seller_document_url,   // CDN URL, not base64
        seller_document_type: form.seller_document_type,
      });

      router.push("/seller/application-status?justApplied=true");
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = () => {
    setSubmitStatus(null);
    setStep(1);
    setForm({
      business_name: "",
      short_business_description: "",
      business_address: "",
      seller_document_type: "PASSPORT",
      seller_document_file: null,
      seller_document_preview: "",
      seller_document_name: "",
      seller_document_url: "",
    });
    setErrors({});
    setSubmitError("");
    setUploadError("");
  };

  // ── Selected document type label (for review step) ─────────────────────────
  const selectedDocType = DOCUMENT_TYPES.find(
    (d) => d.value === form.seller_document_type
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ── Top bar ── */}
        <div
          className="sticky top-0 z-30 border-b border-white/10"
          style={{ background: "linear-gradient(135deg,#0a0a0a,#1a0505,#B42225)" }}
        >
          <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
            <Link
              href="/shop"
              className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Shop
            </Link>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <FaStore size={12} className="text-orange-300" />
              </div>
              <span className="text-white text-xs font-black tracking-wide">
                Seller Application
              </span>
            </div>
            <div className="text-white/40 text-xs font-bold">Jovo</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">

          {/* ── Heading ── */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-orange-600 mb-3"
              style={{
                background: "rgba(255,107,0,0.1)",
                border: "1px solid rgba(255,107,0,0.2)",
              }}
            >
              <FaRocket size={10} /> Free to Apply
            </div>
            <h1
              className="text-2xl md:text-3xl font-black text-gray-900 leading-tight"
              style={{ fontFamily: "'Georgia',serif" }}
            >
              Become a Seller on Jovo
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Fill in your business details and we'll review your application within 24–48 hours.
            </p>
          </div>

          {submitStatus ? (
            <div className="fade-up">
              <StatusScreen
                status={submitStatus}
                rejectionReason={rejectionReason}
                onReapply={handleReapply}
              />
            </div>
          ) : (
            <>
              {/* ── Step progress ── */}
              <div
                className="bg-white rounded-3xl p-5 mb-6"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-100 z-0 mx-10" />
                  <div
                    className="absolute left-10 top-5 h-0.5 z-0 transition-all duration-500"
                    style={{
                      background: "linear-gradient(90deg,#B42225,#FF6B00)",
                      right: step === 3 ? "40px" : step === 2 ? "50%" : "75%",
                    }}
                  />
                  {STEPS.map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300"
                        style={
                          step > s.id
                            ? { background: "#059669", color: "#fff", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }
                            : step === s.id
                            ? { background: "linear-gradient(135deg,#B42225,#FF6B00)", color: "#fff", boxShadow: "0 4px 16px rgba(180,34,37,0.35)" }
                            : { background: "#F3F4F6", color: "#9CA3AF" }
                        }
                      >
                        {step > s.id ? <FiCheck size={16} /> : s.icon}
                      </div>
                      <span
                        className="text-[10px] font-bold whitespace-nowrap"
                        style={{
                          color: step === s.id ? "#B42225" : step > s.id ? "#059669" : "#9CA3AF",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ STEP 1 — Business Info ══ */}
              {step === 1 && (
                <div className="fade-up space-y-5">
                  <div
                    className="bg-white rounded-3xl p-6 md:p-7"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                        style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)" }}
                      >
                        <MdStorefront size={18} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-gray-900">Business Information</h2>
                        <p className="text-xs text-gray-400">Tell us about your business</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <InputField
                        label="Business Name"
                        required
                        error={errors.business_name}
                        hint="This will be your store name visible to buyers."
                      >
                        <input
                          type="text"
                          value={form.business_name}
                          onChange={(e) => setFormField("business_name", e.target.value)}
                          placeholder="e.g. Chidi's Gadget Hub"
                          className={inputCls(errors.business_name)}
                          maxLength={80}
                        />
                      </InputField>

                      <InputField
                        label="Short Business Description"
                        required
                        error={errors.short_business_description}
                        hint="Briefly describe what you sell and who your customers are."
                      >
                        <textarea
                          value={form.short_business_description}
                          onChange={(e) =>
                            setFormField("short_business_description", e.target.value)
                          }
                          placeholder="e.g. We sell quality phone accessories and gadgets at affordable prices to FUTO students..."
                          rows={4}
                          className={inputCls(errors.short_business_description) + " resize-none"}
                          maxLength={300}
                        />
                        <p className="text-[10px] text-gray-300 text-right -mt-1">
                          {form.short_business_description.length}/300
                        </p>
                      </InputField>

                      <InputField
                        label="Business Address"
                        required
                        error={errors.business_address}
                        hint="Where are your products based / dispatched from?"
                      >
                        <input
                          type="text"
                          value={form.business_address}
                          onChange={(e) => setFormField("business_address", e.target.value)}
                          placeholder="e.g. Beside FUTO Main Gate, Owerri, Imo State"
                          className={inputCls(errors.business_address)}
                        />
                      </InputField>
                    </div>
                  </div>

                  <div className="flex justify-end mb-8">
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg,#B42225,#FF6B00)",
                        boxShadow: "0 8px 24px rgba(180,34,37,0.3)",
                      }}
                    >
                      Continue <FiArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* ══ STEP 2 — Identity Verification ══ */}
              {step === 2 && (
                <div className="fade-up space-y-5">
                  <div
                    className="bg-white rounded-3xl p-6 md:p-7"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                        style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}
                      >
                        <FiShield size={18} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-gray-900">Identity Verification</h2>
                        <p className="text-xs text-gray-400">
                          We need to verify your identity to protect all users
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
                      <FiShield size={16} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Your documents are encrypted and stored securely. They're used solely for
                        identity verification and never shared with third parties.
                      </p>
                    </div>

                    <div className="space-y-6">

                      {/* ── Document Type ── */}
                      <InputField
                        label="Document Type"
                        required
                        error={errors.seller_document_type}
                      >
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          {DOCUMENT_TYPES.map(({ value, label, icon, hint }) => {
                            const selected = form.seller_document_type === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setFormField("seller_document_type", value)}
                                className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                                  selected
                                    ? "border-[#B42225] bg-[#B42225]/4"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                              >
                                <span
                                  className="mt-0.5 shrink-0"
                                  style={{ color: selected ? "#B42225" : "#9CA3AF" }}
                                >
                                  {icon}
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className="text-sm font-bold leading-tight"
                                    style={{ color: selected ? "#B42225" : "#6B7280" }}
                                  >
                                    {label}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                                    {hint}
                                  </p>
                                </div>
                                {selected && (
                                  <div className="w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center shrink-0 ml-auto mt-0.5">
                                    <FiCheck size={11} className="text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </InputField>

                      {/* ── File Upload ── */}
                      <InputField
                        label="Upload Document"
                        required
                        error={errors.seller_document_file}
                        hint="JPG, PNG, or PDF · Max 5MB · Ensure document is clear and readable."
                      >
                        {/* Upload error banner */}
                        {uploadError && (
                          <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-red-50 border border-red-200 mb-2">
                            <FiAlertCircle size={12} className="text-red-400 shrink-0" />
                            <p className="text-xs text-red-600">{uploadError}</p>
                          </div>
                        )}

                        {/* Upload progress bar */}
                        {uploading && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span className="flex items-center gap-1.5">
                                <FiLoader size={12} className="animate-spin" />
                                Uploading securely…
                              </span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${uploadProgress}%`,
                                  background: "linear-gradient(90deg,#B42225,#FF6B00)",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div
                          onClick={() => !uploading && fileInputRef.current?.click()}
                          className={`relative mt-1 border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                            uploading
                              ? "cursor-wait opacity-70"
                              : "cursor-pointer hover:border-[#B42225]/40 hover:bg-[#B42225]/2"
                          } ${
                            errors.seller_document_file
                              ? "border-red-300 bg-red-50"
                              : form.seller_document_url
                              ? "border-green-300 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFile}
                            className="hidden"
                            disabled={uploading}
                          />

                          {form.seller_document_file && !uploading ? (
                            <div className="space-y-3">
                              {form.seller_document_preview ? (
                                <Image
                                  src={form.seller_document_preview}
                                  alt="preview"
                                  width={96}
                                  height={96}
                                  className="object-cover rounded-xl mx-auto border-2 border-green-200"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                                  <FiFileText size={28} className="text-green-600" />
                                </div>
                              )}
                              <p className="text-sm font-bold text-green-700 flex items-center justify-center gap-1.5">
                                <FiCheck size={14} />
                                {form.seller_document_url ? "Uploaded successfully" : "File selected"}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate max-w-xs mx-auto">
                                {form.seller_document_name}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormField("seller_document_file", null);
                                  setFormField("seller_document_preview", "");
                                  setFormField("seller_document_name", "");
                                  setFormField("seller_document_url", "");
                                  setUploadError("");
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                              >
                                Remove & re-upload
                              </button>
                            </div>
                          ) : uploading ? (
                            <div className="space-y-2 py-2">
                              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto">
                                <FiLoader size={22} className="text-[#B42225] animate-spin" />
                              </div>
                              <p className="text-sm font-bold text-gray-600">Uploading…</p>
                              <p className="text-[11px] text-gray-400">{form.seller_document_name}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto">
                                <FiUpload size={20} className="text-gray-400" />
                              </div>
                              <p className="text-sm font-bold text-gray-600">
                                Click to upload document
                              </p>
                              <p className="text-[11px] text-gray-400">or drag and drop here</p>
                            </div>
                          )}
                        </div>
                      </InputField>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all"
                    >
                      <FiArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={uploading}
                      className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100"
                      style={{
                        background: "linear-gradient(135deg,#B42225,#FF6B00)",
                        boxShadow: "0 8px 24px rgba(180,34,37,0.3)",
                      }}
                    >
                      {uploading ? (
                        <><FiLoader size={14} className="animate-spin" /> Uploading…</>
                      ) : (
                        <>Review Application <FiArrowRight size={15} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ══ STEP 3 — Review ══ */}
              {step === 3 && (
                <div className="fade-up space-y-5">
                  <div
                    className="bg-white rounded-3xl p-6 md:p-7"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                        style={{ background: "linear-gradient(135deg,#059669,#10B981)" }}
                      >
                        <FiCheck size={18} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-gray-900">
                          Review Your Application
                        </h2>
                        <p className="text-xs text-gray-400">Check everything before submitting</p>
                      </div>
                    </div>

                    <div className="space-y-4">

                      {/* Business Info review */}
                      <div className="rounded-2xl bg-gray-50 p-5 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                            Business Info
                          </p>
                          <button
                            onClick={() => setStep(1)}
                            className="text-[11px] text-[#B42225] font-bold hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                              Business Name
                            </p>
                            <p className="font-bold text-gray-800">{form.business_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                              Address
                            </p>
                            <p className="font-bold text-gray-800">{form.business_address}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                              Description
                            </p>
                            <p className="text-gray-700 text-xs leading-relaxed">
                              {form.short_business_description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification review */}
                      <div className="rounded-2xl bg-gray-50 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                            Verification
                          </p>
                          <button
                            onClick={() => setStep(2)}
                            className="text-[11px] text-[#B42225] font-bold hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          {form.seller_document_preview ? (
                            <Image
                              src={form.seller_document_preview}
                              alt="doc"
                              width={56}
                              height={56}
                              className="object-cover rounded-xl border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                              <FiFileText size={22} className="text-blue-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {selectedDocType?.label ?? form.seller_document_type}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">
                              {form.seller_document_name}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-green-600 font-semibold mt-0.5">
                              <FiCheck size={10} /> Document uploaded
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <p className="text-xs text-amber-700 leading-relaxed">
                        By submitting, you confirm all information is accurate and agree to Jovo's{" "}
                        <Link href="/terms" className="font-bold underline">Terms</Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-bold underline">Privacy Policy</Link>.
                      </p>
                    </div>

                    {submitError && (
                      <div className="mt-4 flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200">
                        <FiAlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700">{submitError}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <button
                      onClick={prevStep}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all disabled:opacity-50"
                    >
                      <FiArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                      style={{
                        background: "linear-gradient(135deg,#B42225,#FF6B00)",
                        boxShadow: "0 8px 24px rgba(180,34,37,0.3)",
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                          </svg>{" "}
                          Submitting…
                        </>
                      ) : (
                        <><FaRocket size={14} /> Submit Application</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerApplication;