'use client'
import Link from 'next/link'
import { useState } from "react";
import {
  FiChevronRight, FiAlertTriangle, FiFileText,
  FiUpload, FiCheck, FiShield, FiX, FiLock,
  FiArrowRight, FiMail, FiImage, FiPaperclip,
  FiInfo, FiFlag, FiPackage, FiLoader,
} from "react-icons/fi";
import {
  FaWhatsapp, FaRegCheckCircle, FaBan, FaRegImage,
  FaHandshake, FaShieldAlt,
} from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

// Types
interface Errors {
  productName?: string;
  reason?: string;
  text?: string;
  email?: string;
  upload?: string;
}

interface UploadedFile {
  filename: string;
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  resource_type: string;
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const reportReasons = [
  { id: "counterfeit",  label: "Counterfeit / Fake Product",       icon: <FaBan size={16} />, color: "#B42225" },
  { id: "dangerous",    label: "Dangerous or Unsafe Item",          icon: <FiAlertTriangle size={18} />, color: "#D97706" },
  { id: "prohibited",   label: "Prohibited / Illegal Product",      icon: <FaBan size={16} />, color: "#7C3AED" },
  { id: "misleading",   label: "Misleading Description or Images",  icon: <FaRegImage size={18} />, color: "#0891B2" },
  { id: "stolen",       label: "Suspected Stolen Goods",            icon: <FiPackage size={18} />, color: "#DC2626" },
  { id: "adult",        label: "Inappropriate / Adult Content",     icon: <FiAlertTriangle size={18} />, color: "#9333EA" },
  { id: "spam",         label: "Spam or Duplicate Listing",         icon: <FiFileText size={18} />, color: "#059669" },
  { id: "other",        label: "Other Violation",                   icon: <FiInfo size={18} />, color: "#475569" },
];

const tips = [
  { icon: <FiFileText size={16} />, title: "Product Name",              tip: "Enter the exact product name as it appears on Jovo. This helps our team locate the listing quickly." },
  { icon: <FiImage size={16} />, title: "Upload Evidence",              tip: "Attach screenshots showing the violation. This helps our team investigate faster." },
  { icon: <FiInfo size={16} />, title: "Be Specific",                  tip: "Describe exactly what you saw — a clear report is resolved faster." },
  { icon: <FiLock size={16} />, title: "Your Report is Confidential",  tip: "All reports are anonymous. The seller will never know who reported them." },
];

const processSteps = [
  { icon: <FiFileText size={16} />, color: "#B42225", label: "Report Submitted",   sub: "Immediately" },
  { icon: <FiShield size={16} />,   color: "#D97706", label: "Under Review",       sub: "Within 24 hrs" },
  { icon: <FaShieldAlt size={16} />, color: "#7C3AED", label: "Action Taken",       sub: "If violation found" },
  { icon: <FiCheck size={16} />,    color: "#059669", label: "You're Notified",    sub: "Via email" },
];

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ReportProduct = () => {
  const [productName, setProductName] = useState<string>("");
  const [selectedReason, setReason] = useState<string>("");
  const [reportText, setReportText] = useState<string>("");
  const [reporterEmail, setReporterEmail] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    
    // Validate file sizes (max 5MB each)
    const invalidFiles = selected.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, upload: "Some files exceed 5MB limit" }));
      return;
    }
    
    setFiles(selected);
    setErrors(prev => ({ ...prev, upload: "" }));
    
    // Auto-upload files when selected
    if (selected.length > 0) {
      await uploadEvidenceFiles(selected);
    }
  };

  const uploadEvidenceFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Upload files using the upload endpoint
      const result = await apiService.uploadFiles(
        filesToUpload,
        "seller_document" // Using seller_document type for evidence
      );
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setUploadedFiles(result.files || []);
      console.log("Files uploaded successfully:", result);
      
      const fileInput = document.getElementById("evidence-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error: any) {
      console.error("Upload failed:", error);
      setErrors(prev => ({ ...prev, upload: error.message || "Failed to upload files. Please try again." }));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!productName.trim()) e.productName = "Please enter the product name.";
    if (!selectedReason)    e.reason = "Please select a reason for reporting.";
    if (!reportText.trim()) e.text = "Please describe the issue.";
    if (reporterEmail && !/\S+@\S+\.\S+/.test(reporterEmail)) e.email = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    // Here you would send the report to your backend API
    console.log("Submitting report:", {
      productName,
      selectedReason,
      reportText,
      reporterEmail,
      uploadedFiles,
    });
    
    setSubmitted(true);
  };

  const handleReset = () => {
    setProductName(""); setReason(""); setReportText("");
    setReporterEmail(""); setFiles([]); setUploadedFiles([]);
    setErrors({}); setSubmitted(false); setUploading(false);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease; }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .scale-in { animation: scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden" style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#1a0505 35%,#2d0808 65%,#B42225 100%)",
        }}>
          <div className="absolute -top-16 right-1/3 w-72 h-72 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle,#DC2626,transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-24">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <Link href="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Report a Product</span>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 mt-1"
                style={{ background: "rgba(180,34,37,0.25)", border: "1px solid rgba(252,165,165,0.3)" }}>
                <FiFlag size={26} className="text-red-300" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-red-300/70 px-3 py-1.5 rounded-full mb-3"
                  style={{ background: "rgba(180,34,37,0.2)", border: "1px solid rgba(252,165,165,0.2)" }}>
                  Community Safety
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
                  style={{ fontFamily: "'Georgia', serif", textShadow: "0 4px 30px rgba(180,34,37,0.5)" }}>
                  Report a<br />
                  <span style={{ background: "linear-gradient(90deg,#fca5a5,#f87171,#fca5a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Product
                  </span>
                </h1>
                <p className="text-white/45 text-sm leading-relaxed max-w-lg">
                  See something that violates our policies? Report it to our safety team. We'll investigate within 24 hours.
                </p>

                <div className="flex flex-wrap gap-3 mt-5">
                  {[
                    { icon: <FiLock size={11} />, text: "Anonymous & confidential" },
                    { icon: <FiShield size={11} />, text: "Reviewed within 24 hrs" },
                    { icon: <FaShieldAlt size={11} />, text: "Action taken on violations" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs font-semibold text-white/70 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <span className="text-red-300">{icon}</span> {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z" fill="#F4F5F9" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

          {/* ══════════ WHAT HAPPENS NEXT ══════════ */}
          <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full bg-[#B42225]" />
              <h2 className="text-base font-black text-gray-900">What happens after you report?</h2>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              {processSteps.map(({ icon, color, label, sub }, i) => (
                <div key={label} className="relative flex flex-col items-center text-center">
                  {i < 3 && (
                    <div className="hidden sm:block absolute left-[calc(50%+28px)] top-5 w-[calc(100%-56px)] h-0.5 bg-gray-100 z-0" />
                  )}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white mb-3 z-10"
                    style={{ background: color, boxShadow: `0 4px 16px ${color}40` }}>
                    {icon}
                  </div>
                  <p className="text-xs font-black text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ FORM / SUCCESS ══════════ */}
          {submitted ? (
            /* ── SUCCESS STATE ── */
            <div className="bg-white rounded-3xl p-10 text-center scale-in"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <FaRegCheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                Report Submitted
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-2">
                Thank you for helping keep Jovo safe. Our team will review your report within 24 hours.
              </p>
              {reporterEmail && (
                <p className="text-xs text-gray-400 mb-6">
                  Updates will be sent to <strong>{reporterEmail}</strong>
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#B42225,#DC2626)", boxShadow: "0 4px 20px rgba(180,34,37,0.3)" }}>
                  Submit Another Report
                </button>
                <Link href="/shop"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                  Back to Shop <FiArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            /* ── REPORT FORM ── */
            <div className="bg-white rounded-3xl overflow-hidden fade-up"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <div className="px-6 md:px-8 pt-7 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                  <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                    Submit a Report
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-4">All fields marked * are required</p>
              </div>

              <div className="p-6 md:p-8 space-y-6">

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                    Product Name <span className="text-[#B42225]">*</span>
                  </label>
                  <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${
                    errors.productName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                  }`}>
                    <FiFileText size={15} className={errors.productName ? "text-red-400" : "text-gray-400"} />
                    <input
                      type="text"
                      placeholder="Enter the exact product name..."
                      value={productName}
                      onChange={(e) => { setProductName(e.target.value); setErrors((p) => ({ ...p, productName: "" })); }}
                      className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                    />
                  </div>
                  {errors.productName && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><FiAlertTriangle size={11} /> {errors.productName}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">Enter the exact product name as it appears on Jovo</p>
                </div>

                {/* Reason grid */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-3">
                    Reason for Report <span className="text-[#B42225]">*</span>
                  </label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {reportReasons.map(({ id, label, icon, color }) => (
                      <button key={id} type="button"
                        onClick={() => { setReason(id); setErrors((p) => ({ ...p, reason: "" })); }}
                        className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition-all ${
                          selectedReason === id
                            ? "border-[#B42225]/40 shadow-sm"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                        }`}
                        style={selectedReason === id ? { background: color + "0d", borderColor: color + "60" } : {}}>
                        <span className="text-gray-700 shrink-0">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-snug ${selectedReason === id ? "text-gray-900" : "text-gray-700"}`}>
                            {label}
                          </p>
                        </div>
                        {selectedReason === id && (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white"
                            style={{ background: color }}>
                            <FiCheck size={9} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.reason && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><FiAlertTriangle size={11} /> {errors.reason}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                    Describe the Issue <span className="text-[#B42225]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Be specific — describe exactly what is wrong with this product, what you saw, and why it violates Jovo's policies..."
                    value={reportText}
                    onChange={(e) => { setReportText(e.target.value); setErrors((p) => ({ ...p, text: "" })); }}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-700 outline-none resize-none placeholder-gray-400 transition-all ${
                      errors.text
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.text
                      ? <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertTriangle size={11} /> {errors.text}</p>
                      : <span />
                    }
                    <p className="text-[10px] text-gray-400 ml-auto">{reportText.length} characters</p>
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                    Attach Evidence <span className="text-gray-400 font-normal normal-case">(optional — upload screenshots or documents)</span>
                  </label>
                  
                  {/* Upload progress indicator */}
                  {uploading && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-2">
                          <FiLoader size={14} className="spin" />
                          Uploading evidence...
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg, #B42225, #FF6B00)" }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                    uploading ? "border-gray-200 bg-gray-50 opacity-50" : "border-gray-200 bg-gray-50 hover:border-[#B42225]/40 hover:bg-red-50/30"
                  }`}>
                    <FiUpload size={22} className="text-gray-400" />
                    <p className="text-sm font-bold text-gray-500">Click to upload screenshots or documents</p>
                    <p className="text-[11px] text-gray-400">Images (PNG, JPG) or PDF — up to 5MB each</p>
                    <input 
                      id="evidence-input"
                      type="file" 
                      multiple 
                      accept="image/*,.pdf" 
                      className="hidden" 
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  
                  {errors.upload && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><FiAlertTriangle size={11} /> {errors.upload}</p>
                  )}
                  
                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Uploaded evidence:</p>
                      {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2.5 border border-green-100">
                          <FiCheck size={14} className="text-green-500 shrink-0" />
                          <span className="text-xs text-gray-700 flex-1 truncate">{file.filename}</span>
                          <span className="text-[10px] text-gray-400">{(file.bytes / 1024).toFixed(0)} KB</span>
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            View
                          </a>
                          <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pending files list (not yet uploaded) */}
                  {files.length > 0 && uploadedFiles.length === 0 && !uploading && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Ready to upload:</p>
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                          <FiPaperclip size={14} className="text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                          <span className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                          <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
                    Your Email <span className="text-gray-400 font-normal normal-case">(optional — for follow-up updates)</span>
                  </label>
                  <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${
                    errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                  }`}>
                    <FiMail size={15} className="text-gray-400" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={reporterEmail}
                      onChange={(e) => { setReporterEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                      className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><FiAlertTriangle size={11} /> {errors.email}</p>}
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <FiLock size={10} /> Your identity is kept anonymous from the seller.
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#B42225,#DC2626)", boxShadow: "0 6px 24px rgba(180,34,37,0.35)" }}>
                  {uploading ? (
                    <><FiLoader size={17} className="spin" /> Uploading files...</>
                  ) : (
                    <><FiFlag size={17} /> Submit Report</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════ TIPS ══════════ */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-amber-400" />
              <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                Tips for a Better Report
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tips.map(({ icon, title, tip }) => (
                <div key={title} className="bg-white rounded-2xl p-5 hover:-translate-y-0.5 transition-all"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                  <span className="text-2xl block mb-3 text-[#B42225]">{icon}</span>
                  <h4 className="text-sm font-black text-gray-800 mb-1.5">{title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ SUPPORT FOOTER ══════════ */}
          <div className="relative rounded-3xl overflow-hidden p-7 md:p-8 text-white"
            style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#1a0505 50%,#B42225 100%)" }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaHandshake size={18} className="text-red-300" />
                  <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Need direct help?</span>
                </div>
                <h3 className="text-lg font-black mb-1.5" style={{ fontFamily: "'Georgia', serif" }}>
                  Contact our Safety Team
                </h3>
                <p className="text-white/40 text-sm max-w-sm">
                  For urgent safety concerns, reach us directly via WhatsApp or email. We respond within 2 hours on weekdays.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
                  <FaWhatsapp size={15} /> WhatsApp Us
                </a>
                <a href="mailto:safety@jovo.ng"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all">
                  <FiMail size={14} /> safety@jovo.ng
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReportProduct;