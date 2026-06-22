'use client'
import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiChevronRight, FiAlertTriangle, FiFileText,
  FiUpload, FiCheck, FiShield, FiX, FiLock,
  FiArrowRight, FiMail, FiFlag, FiPackage, FiLoader, FiSearch,
  FiUser, FiBriefcase, FiShoppingBag,
} from "react-icons/fi";
import {
  FaWhatsapp, FaRegCheckCircle, FaBan, FaRegImage,
  FaHandshake, FaShieldAlt,
} from "react-icons/fa";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface Errors {
  entity?: string;
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

interface SearchResult {
  id: string;
  name: string;
  type: 'seller' | 'provider' | 'product';
  image?: string;
  price?: number;
  sellerName?: string;
  categoryName?: string;
  businessName?: string;
  serviceType?: string;
  rating?: number;
  email?: string;
}

type ReportType = 'seller' | 'provider' | 'product';

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const reportReasons = {
  seller: [
    { id: "fraud",           label: "Fraud / Scam",              desc: "Seller is attempting to defraud buyers",              icon: <FiAlertTriangle size={15} />, color: "#DC2626" },
    { id: "counterfeit",     label: "Selling Counterfeit",        desc: "Seller is selling fake or knock-off products",        icon: <FaBan size={15} />,           color: "#D97706" },
    { id: "misleading",      label: "Misleading Product Info",    desc: "Product descriptions don't match reality",            icon: <FaRegImage size={15} />,       color: "#0891B2" },
    { id: "poor_service",    label: "Poor Customer Service",      desc: "Unresponsive or unprofessional behavior",             icon: <FiUser size={15} />,           color: "#7C3AED" },
    { id: "delivery_issues", label: "Delivery / Shipping Issues", desc: "Items not delivered or delayed",                      icon: <FiPackage size={15} />,        color: "#059669" },
    { id: "spam",            label: "Spam / Harassment",          desc: "Unsolicited messages or harassment",                  icon: <FiFileText size={15} />,       color: "#9333EA" },
    { id: "other_seller",    label: "Other Violation",            desc: "Something else not listed above",                     icon: <FiFlag size={15} />,           color: "#475569" },
  ],
  provider: [
    { id: "fraud",               label: "Fraud / Scam",              desc: "Provider is attempting to defraud customers",         icon: <FiAlertTriangle size={15} />, color: "#DC2626" },
    { id: "poor_service",        label: "Poor Service Quality",       desc: "Service didn't meet expectations",                    icon: <FiBriefcase size={15} />,     color: "#D97706" },
    { id: "unprofessional",      label: "Unprofessional Conduct",     desc: "Rude or inappropriate behavior",                      icon: <FiUser size={15} />,           color: "#7C3AED" },
    { id: "no_show",             label: "No-Show / Cancellation",     desc: "Provider didn't show up or cancelled last minute",    icon: <FiX size={15} />,             color: "#DC2626" },
    { id: "misleading_service",  label: "Misleading Service Info",    desc: "Service descriptions don't match reality",            icon: <FaRegImage size={15} />,       color: "#0891B2" },
    { id: "overcharging",        label: "Overcharging",               desc: "Charged more than agreed or quoted",                  icon: <FiFileText size={15} />,       color: "#059669" },
    { id: "other_provider",      label: "Other Violation",            desc: "Something else not listed above",                     icon: <FiFlag size={15} />,           color: "#475569" },
  ],
  product: [
    { id: "counterfeit", label: "Counterfeit / Fake",       desc: "Item appears to be a fake or knock-off brand",        icon: <FaBan size={15} />,           color: "#B42225" },
    { id: "dangerous",   label: "Dangerous Item",            desc: "Product poses a safety risk to buyers",               icon: <FiAlertTriangle size={15} />, color: "#D97706" },
    { id: "prohibited",  label: "Prohibited / Illegal",      desc: "Listing violates laws or platform policies",          icon: <FaBan size={15} />,           color: "#7C3AED" },
    { id: "misleading",  label: "Misleading Listing",        desc: "Photos or description don't match the real product",  icon: <FaRegImage size={15} />,       color: "#0891B2" },
    { id: "stolen",      label: "Suspected Stolen",          desc: "You suspect this product may be stolen goods",        icon: <FiPackage size={15} />,        color: "#DC2626" },
    { id: "adult",       label: "Inappropriate Content",     desc: "Contains adult or offensive material",                icon: <FiAlertTriangle size={15} />, color: "#9333EA" },
    { id: "spam",        label: "Spam / Duplicate",          desc: "Same product listed multiple times by same seller",   icon: <FiFileText size={15} />,       color: "#059669" },
    { id: "other_product", label: "Other Violation",         desc: "Something else not listed above",                     icon: <FiFlag size={15} />,           color: "#475569" },
  ],
};

const processSteps = [
  { icon: <FiFileText size={15} />, color: "#B42225", label: "Report Submitted", sub: "Immediately" },
  { icon: <FiShield size={15} />,   color: "#D97706", label: "Under Review",     sub: "Within 24 hrs" },
  { icon: <FaShieldAlt size={15} />,color: "#7C3AED", label: "Action Taken",     sub: "If violation found" },
  { icon: <FiCheck size={15} />,    color: "#059669", label: "You're Notified",  sub: "Via email" },
];

const reportTypeInfo = {
  seller: {
    label: "Seller",
    icon: FiUser,
    color: "#3B82F6",
    description: "Report a seller for fraud, poor service, or policy violations",
    searchPlaceholder: "Search for a seller by business name…",
    noResults: "No sellers found. Try a different name.",
  },
  provider: {
    label: "Service Provider",
    icon: FiBriefcase,
    color: "#8B5CF6",
    description: "Report a service provider for poor service, fraud, or misconduct",
    searchPlaceholder: "Search for a service provider by name…",
    noResults: "No service providers found. Try a different name.",
  },
  product: {
    label: "Product",
    icon: FiPackage,
    color: "#F59E0B",
    description: "Report a product for being counterfeit, dangerous, or misleading",
    searchPlaceholder: "Search for a product by name…",
    noResults: "No products found. Try a different name.",
  },
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const ReportPage = () => {
  const [reportType, setReportType] = useState<ReportType>('product');

  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<SearchResult | null>(null);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [searchError, setSearchError]     = useState("");
  const searchRef     = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const [selectedReason, setReason]       = useState("");
  const [reportText, setReportText]       = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted]         = useState(false);
  const [errors, setErrors]               = useState<Errors>({});
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getReasons = () => reportReasons[reportType] || reportReasons.product;

  // ── SELLER SEARCH ─────────────────────────────────────────────────────────
  // Strategy: search products matching the query, extract unique sellers from
  // the embedded seller data. Three attempts in order of reliability.
  const searchSellers = async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase().trim();
    const sellerMap = new Map<string, SearchResult>();

    const addSellersFromProducts = (products: any[]) => {
      products.forEach((p: any) => {
        const sellerId   = p.seller_id ?? p.seller?.id;
        const sellerName = p.seller?.business_name ?? p.business_name ?? p.seller_name;
        if (sellerId && sellerName && !sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            id:           sellerId,
            name:         sellerName,
            type:         "seller",
            image:        p.seller?.profile_image ?? p.seller?.logo_url ?? p.seller?.cover_image,
            rating:       p.seller?.rating,
            email:        p.seller?.email,
            businessName: sellerName,
          });
        }
      });
    };

    // Attempt 1 — marketspace search (has a `search` param, fastest)
    try {
      const res = await (apiService as any).makeRequest(
        `/marketspace/search?search=${encodeURIComponent(query)}&limit=50`,
        { method: "GET" },
      );
      const data = res?.data ?? res;
      const products: any[] = data?.products ?? data?.items ?? (Array.isArray(data) ? data : []);
      addSellersFromProducts(products);
    } catch { /* silent */ }

    // Attempt 2 — shop homepage (always works, filter client-side)
    if (sellerMap.size === 0) {
      try {
        const res = await apiService.getShopHomepage(30, false);
        const payload = res?.data ?? res;
        const cats: any[] = Array.isArray(payload)
          ? payload
          : (payload?.categories ?? payload?.data ?? []);
        const allProducts: any[] = cats.flatMap((c: any) => c?.products ?? []);
        addSellersFromProducts(allProducts);
      } catch { /* silent */ }
    }

    // Attempt 3 — search each category in parallel (catches sellers not on homepage)
    if (sellerMap.size === 0) {
      try {
        const catRes = await apiService.getPublicCategories();
        const catPayload = catRes?.data ?? catRes;
        const cats: any[] = Array.isArray(catPayload)
          ? catPayload
          : (catPayload?.categories ?? catPayload?.items ?? []);

        await Promise.allSettled(
          cats.slice(0, 6).map(async (cat: any) => {
            if (!cat?.id) return;
            try {
              const res = await apiService.getCategoryMarketspace(cat.id, {
                search: query,
                limit:  20,
                offset: 0,
              });
              const data = res?.data ?? res;
              const products: any[] = data?.products ?? data?.items ?? [];
              addSellersFromProducts(products);
            } catch { /* per-category failure is fine */ }
          }),
        );
      } catch { /* silent */ }
    }

    // Final filter — make sure every result actually matches the query
    return Array.from(sellerMap.values())
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q),
      )
      .slice(0, 20);
  };

  // ── PROVIDER SEARCH ───────────────────────────────────────────────────────
  const searchProviders = async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase().trim();
    const providerMap = new Map<string, SearchResult>();

    const addFromServices = (services: any[]) => {
      services.forEach((p: any) => {
        // Services have provider info nested differently depending on endpoint
        const providerId   = p.provider_id ?? p.provider?.id ?? p.id;
        const providerName = p.business_name ?? p.provider?.business_name ?? p.provider_name ?? p.name;
        if (providerId && providerName && !providerMap.has(providerId)) {
          providerMap.set(providerId, {
            id:           providerId,
            name:         providerName,
            type:         "provider",
            image:        p.logo_url ?? p.provider?.logo_url ?? p.provider_logo,
            serviceType:  p.service_type ?? p.category ?? p.service_category?.[0],
            rating:       p.rating ?? p.provider?.rating,
            businessName: providerName,
          });
        }
      });
    };

    // Attempt 1 — search with query param
    try {
      const res = await apiService.getMarketplaceServices({ search: query, limit: 30 });
      const data = res?.data ?? res;
      const services: any[] = data?.services ?? data?.providers ?? data?.items ?? (Array.isArray(data) ? data : []);
      addFromServices(services);
    } catch { /* silent */ }

    // Attempt 2 — fetch all and filter client-side
    if (providerMap.size === 0) {
      try {
        const res = await apiService.getMarketplaceServices({ limit: 50 });
        const data = res?.data ?? res;
        const services: any[] = data?.services ?? data?.providers ?? data?.items ?? (Array.isArray(data) ? data : []);
        addFromServices(services);
      } catch { /* silent */ }
    }

    return Array.from(providerMap.values())
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.serviceType ?? "").toLowerCase().includes(q),
      )
      .slice(0, 20);
  };

  // ── PRODUCT SEARCH ────────────────────────────────────────────────────────
  const searchProducts = async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase().trim();

    const toResult = (p: any): SearchResult => ({
      id:           p.id,
      name:         p.product_name ?? p.name ?? "Unnamed product",
      type:         "product",
      image:        p.product_images?.[0] ?? p.images?.[0],
      price:        p.current_price ?? p.price,
      sellerName:   p.seller?.business_name ?? p.business_name,
      categoryName: p.category?.name ?? p.category_name,
    });

    // Attempt 1 — dedicated search endpoint
    try {
      const res = await (apiService as any).makeRequest(
        `/marketspace/search?search=${encodeURIComponent(query)}&limit=20`,
        { method: "GET" },
      );
      const data = res?.data ?? res;
      const products: any[] = data?.products ?? data?.items ?? (Array.isArray(data) ? data : []);
      if (products.length > 0) return products.slice(0, 20).map(toResult);
    } catch { /* silent */ }

    // Attempt 2 — shop homepage, client-side filter
    try {
      const res = await apiService.getShopHomepage(20, false);
      const payload = res?.data ?? res;
      const cats: any[] = Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? []);
      const all: any[]  = cats.flatMap((c: any) => c?.products ?? []);
      return all
        .filter((p: any) => (p.product_name ?? p.name ?? "").toLowerCase().includes(q))
        .slice(0, 20)
        .map(toResult);
    } catch { /* silent */ }

    return [];
  };

  // ── MAIN SEARCH DISPATCHER ────────────────────────────────────────────────
  const searchEntities = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchError("");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      let results: SearchResult[] = [];

      switch (reportType) {
        case "seller":   results = await searchSellers(query);   break;
        case "provider": results = await searchProviders(query); break;
        case "product":  results = await searchProducts(query);  break;
      }

      setSearchResults(results);
      setShowDropdown(true);

      if (results.length === 0) {
        setSearchError(
          `No ${reportTypeInfo[reportType].label.toLowerCase()}s found matching "${query}"`,
        );
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setSearchError(err.message || "Failed to search. Please try again.");
      setSearchResults([]);
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedEntity(null);
    setErrors((p) => ({ ...p, entity: "" }));
    setSearchError("");
    clearTimeout(searchTimeout.current);
    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(() => searchEntities(val), 400);
  };

  const handleSelectEntity = (entity: SearchResult) => {
    setSelectedEntity(entity);
    setSearchQuery(entity.name);
    setShowDropdown(false);
    setErrors((p) => ({ ...p, entity: "" }));
    setSearchError("");
  };

  const handleClearEntity = () => {
    setSelectedEntity(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSearchError("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    const tooLarge = selected.filter((f) => f.size > 5 * 1024 * 1024);
    if (tooLarge.length > 0) {
      setErrors((p) => ({ ...p, upload: `${tooLarge.length} file(s) exceed the 5 MB limit` }));
      return;
    }
    setErrors((p) => ({ ...p, upload: "" }));
    if (selected.length > 0) await uploadEvidenceFiles(selected);
    const input = document.getElementById("evidence-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const uploadEvidenceFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(
      () => setUploadProgress((p) => Math.min(p + 10, 90)),
      200,
    );
    try {
      const result = await apiService.uploadFiles(files, "seller_document");
      clearInterval(interval);
      setUploadProgress(100);
      setUploadedFiles((prev) => [...prev, ...(result.files || [])]);
    } catch (err: any) {
      clearInterval(interval);
      setErrors((p) => ({ ...p, upload: err.message || "Upload failed. Please try again." }));
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
    }
  };

  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];
    try {
      await apiService.deleteFiles([file.url], "seller_document");
    } catch { /* best-effort */ }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!selectedEntity)
      e.entity = `Please search for and select a ${reportTypeInfo[reportType].label.toLowerCase()} to report.`;
    if (!selectedReason)   e.reason = "Choose a reason for your report.";
    if (!reportText.trim()) e.text   = "Describe the issue so our team can investigate.";
    if (reporterEmail && !/\S+@\S+\.\S+/.test(reporterEmail))
      e.email = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedEntity) return;
    setIsSubmitting(true);
    try {
      const imageUrls = uploadedFiles.map((f) => f.url);

      switch (reportType) {
        case "seller":
          await apiService.reportSeller(selectedEntity.id, selectedReason, reportText);
          break;
        case "provider":
          await apiService.reportProvider(selectedEntity.id, selectedReason, reportText);
          break;
        case "product":
          await apiService.reportProduct(
            selectedEntity.id,
            selectedReason,
            reportText,
            imageUrls.length > 0 ? imageUrls : undefined,
          );
          break;
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrors((p) => ({ ...p, text: err.message || "Failed to submit. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedEntity(null);
    setSearchQuery("");
    setSearchResults([]);
    setReason("");
    setReportText("");
    setReporterEmail("");
    setUploadedFiles([]);
    setErrors({});
    setSubmitted(false);
    setSearchError("");
  };

  const selectedReasonData = getReasons().find((r) => r.id === selectedReason);
  const typeInfo  = reportTypeInfo[reportType];
  const TypeIcon  = typeInfo.icon;

  return (
    <>
      <style>{`
        @keyframes fadeUp    { from { opacity:0; transform:translateY(8px); }  to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn   { from { opacity:0; transform:scale(0.9); }       to { opacity:1; transform:scale(1); } }
        @keyframes spin      { to   { transform:rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .fade-up    { animation: fadeUp 0.3s ease both; }
        .scale-in   { animation: scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        .spin       { animation: spin 1s linear infinite; }
        .slide-down { animation: slideDown 0.2s ease both; }
        .search-drop { box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
        .reason-btn:hover { transform: translateY(-1px); }
        .type-btn { transition: all 0.2s ease; }
        .type-btn:hover  { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .type-btn.active { transform: translateY(-2px); }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>

        {/* ══ HERO ══ */}
        <div className="relative overflow-hidden" style={{
          background: "linear-gradient(135deg,#0a0a0a 0%,#1a0505 40%,#2d0808 70%,#B42225 100%)",
        }}>
          <div className="absolute -top-20 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-15"
            style={{ background: "radial-gradient(circle,#DC2626,transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "30px 30px",
          }} />

          <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-10 pb-24">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <Link href="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Report</span>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-13 h-13 rounded-3xl flex items-center justify-center shrink-0 mt-1 p-3"
                style={{ background: "rgba(180,34,37,0.22)", border: "1px solid rgba(252,165,165,0.25)" }}>
                <FiFlag size={24} className="text-red-300" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-red-300/70 px-3 py-1.5 rounded-full mb-3"
                  style={{ background: "rgba(180,34,37,0.18)", border: "1px solid rgba(252,165,165,0.18)" }}>
                  Community Safety
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight"
                  style={{ fontFamily: "'Georgia',serif", textShadow: "0 4px 30px rgba(180,34,37,0.4)" }}>
                  Report a<br />
                  <span style={{ background: "linear-gradient(90deg,#fca5a5,#f87171,#fca5a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Violation
                  </span>
                </h1>
                <p className="text-white/45 text-sm leading-relaxed max-w-lg">
                  Spot something that breaks our rules? Let us know — we investigate every report within 24 hours.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-5">
                  {[
                    { icon: <FiLock size={10} />,      text: "Anonymous & confidential" },
                    { icon: <FiShield size={10} />,    text: "Reviewed within 24 hrs" },
                    { icon: <FaShieldAlt size={10} />, text: "Action taken on violations" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs font-semibold text-white/65 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)" }}>
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

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">

          {/* ══ PROCESS STEPS ══ */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">What happens after you report</p>
            <div className="grid sm:grid-cols-4 gap-3">
              {processSteps.map(({ icon, color, label, sub }, i) => (
                <div key={label} className="relative flex flex-col items-center text-center">
                  {i < 3 && (
                    <div className="hidden sm:block absolute left-[calc(50%+24px)] top-4 w-[calc(100%-48px)] h-px bg-gray-100 z-0" />
                  )}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white mb-2.5 z-10"
                    style={{ background: color, boxShadow: `0 3px 12px ${color}35` }}>
                    {icon}
                  </div>
                  <p className="text-xs font-black text-gray-800 leading-snug">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {submitted ? (
            /* ══ SUCCESS ══ */
            <div className="bg-white rounded-2xl p-10 text-center scale-in"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <FaRegCheckCircle size={38} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia',serif" }}>
                Report Received
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-2">
                Thanks for keeping Jovo safe. Our team will review your report on{" "}
                <strong>{selectedEntity?.name}</strong> within 24 hours.
              </p>
              {reporterEmail && (
                <p className="text-xs text-gray-400 mb-6">
                  We'll send updates to <strong>{reporterEmail}</strong>
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#B42225,#DC2626)", boxShadow: "0 4px 16px rgba(180,34,37,0.3)" }}>
                  Submit Another Report
                </button>
                <Link href="/shop"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                  Back to Shop <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            /* ══ FORM ══ */
            <div className="bg-white rounded-2xl overflow-hidden fade-up"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

              {/* Header */}
              <div className="px-6 md:px-8 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 rounded-full bg-[#B42225]" />
                  <div>
                    <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia',serif" }}>
                      Submit a Report
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Fields marked <span className="text-[#B42225]">*</span> are required
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-7">

                {/* ── STEP 1: Choose report type ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center text-white text-[10px] font-black shrink-0">1</div>
                    <label className="text-sm font-black text-gray-800">
                      What would you like to report? <span className="text-[#B42225]">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(["seller", "provider", "product"] as const).map((type) => {
                      const info   = reportTypeInfo[type];
                      const Icon   = info.icon;
                      const active = reportType === type;
                      return (
                        <button key={type} type="button"
                          onClick={() => {
                            setReportType(type);
                            setSelectedEntity(null);
                            setSearchQuery("");
                            setSearchResults([]);
                            setReason("");
                            setErrors({});
                            setSearchError("");
                          }}
                          className={`type-btn flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                            active ? "active" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                          }`}
                          style={{
                            borderColor: active ? info.color : undefined,
                            background:  active ? `${info.color}10` : undefined,
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: active ? `${info.color}20` : "#f1f5f9" }}>
                              <Icon size={16} style={{ color: active ? info.color : "#94a3b8" }} />
                            </div>
                            <span className="text-sm font-bold" style={{ color: active ? info.color : "#64748b" }}>
                              {info.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 text-center">{info.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── STEP 2: Find the entity ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center text-white text-[10px] font-black shrink-0">2</div>
                    <label className="text-sm font-black text-gray-800">
                      Which {typeInfo.label.toLowerCase()} are you reporting?{" "}
                      <span className="text-[#B42225]">*</span>
                    </label>
                  </div>

                  {selectedEntity ? (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-green-200 bg-green-50">
                      {selectedEntity.image ? (
                        <img src={selectedEntity.image} alt={selectedEntity.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-green-100"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          <TypeIcon size={18} className="text-green-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedEntity.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedEntity.type === "seller" && (
                            <>
                              {selectedEntity.email && <span>{selectedEntity.email}</span>}
                              {selectedEntity.rating && (
                                <span className="ml-2">⭐ {selectedEntity.rating.toFixed(1)}</span>
                              )}
                            </>
                          )}
                          {selectedEntity.type === "provider" && selectedEntity.serviceType && (
                            <span>{selectedEntity.serviceType}</span>
                          )}
                          {selectedEntity.type === "product" && selectedEntity.sellerName && (
                            <span>by {selectedEntity.sellerName}</span>
                          )}
                          {selectedEntity.type === "product" && selectedEntity.price && (
                            <span className="ml-2 text-gray-400">
                              ₦{selectedEntity.price.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <FiCheck size={11} className="text-white" />
                        </div>
                        <button onClick={handleClearEntity}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <FiX size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div ref={searchRef} className="relative">
                      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all ${
                        errors.entity
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.07)]"
                      }`}>
                        {isSearching
                          ? <FiLoader size={15} className="text-gray-400 spin shrink-0" />
                          : <FiSearch size={15} className={errors.entity ? "text-red-400" : "text-gray-400"} />
                        }
                        <input
                          type="text"
                          placeholder={typeInfo.searchPlaceholder}
                          value={searchQuery}
                          onChange={handleSearchInput}
                          className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                          autoComplete="off"
                        />
                        {searchQuery && !isSearching && (
                          <button
                            onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); setSearchError(""); }}
                            className="text-gray-300 hover:text-gray-500 transition-colors">
                            <FiX size={13} />
                          </button>
                        )}
                      </div>

                      {/* Searching indicator */}
                      {isSearching && searchQuery.length >= 2 && (
                        <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl px-4 py-4 slide-down search-drop">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FiLoader size={14} className="spin" />
                            Searching for &quot;{searchQuery}&quot;…
                          </div>
                        </div>
                      )}

                      {/* Dropdown */}
                      {showDropdown && !isSearching && (
                        <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl overflow-hidden slide-down search-drop">
                          {searchResults.length === 0 ? (
                            <div className="px-4 py-5 text-center">
                              <p className="text-sm text-gray-400">
                                {searchError || typeInfo.noResults}
                              </p>
                              <p className="text-xs text-gray-300 mt-1">
                                Try a different keyword or check the spelling
                              </p>
                            </div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                              {searchResults.map((entity) => (
                                <button
                                  key={`${entity.type}-${entity.id}`}
                                  type="button"
                                  onClick={() => handleSelectEntity(entity)}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                  {entity.image ? (
                                    <img src={entity.image} alt={entity.name}
                                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                      {entity.type === "seller"   && <FiUser size={14} className="text-gray-400" />}
                                      {entity.type === "provider" && <FiBriefcase size={14} className="text-gray-400" />}
                                      {entity.type === "product"  && <FiPackage size={14} className="text-gray-400" />}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{entity.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <span className="capitalize">{entity.type}</span>
                                      {entity.type === "seller"   && entity.email      && <span className="truncate">• {entity.email}</span>}
                                      {entity.type === "product"  && entity.sellerName && <span>• by {entity.sellerName}</span>}
                                      {entity.type === "provider" && entity.serviceType && <span>• {entity.serviceType}</span>}
                                    </div>
                                  </div>
                                  {entity.type === "product" && entity.price != null && (
                                    <span className="text-xs font-bold text-gray-600 shrink-0">
                                      ₦{entity.price.toLocaleString()}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {errors.entity && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <FiAlertTriangle size={11} /> {errors.entity}
                    </p>
                  )}
                </div>

                {/* ── STEP 3: Pick a reason ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center text-white text-[10px] font-black shrink-0">3</div>
                    <label className="text-sm font-black text-gray-800">
                      What's the problem? <span className="text-[#B42225]">*</span>
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {getReasons().map(({ id, label, desc, icon, color }) => {
                      const active = selectedReason === id;
                      return (
                        <button key={id} type="button"
                          onClick={() => { setReason(id); setErrors((p) => ({ ...p, reason: "" })); }}
                          className={`reason-btn flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                            active ? "shadow-sm" : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                          }`}
                          style={active ? { background: color + "0c", borderColor: color + "55" } : {}}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: active ? color : "#f1f5f9", color: active ? "white" : "#94a3b8" }}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold ${active ? "text-gray-900" : "text-gray-700"}`}>{label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                          </div>
                          {active && (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                              style={{ background: color }}>
                              <FiCheck size={9} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {errors.reason && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <FiAlertTriangle size={11} /> {errors.reason}
                    </p>
                  )}
                </div>

                {/* ── STEP 4: Describe ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[#B42225] flex items-center justify-center text-white text-[10px] font-black shrink-0">4</div>
                    <label className="text-sm font-black text-gray-800">
                      Describe what you saw <span className="text-[#B42225]">*</span>
                    </label>
                  </div>

                  {selectedReasonData && (
                    <div className="flex items-center gap-2 p-3 rounded-lg mb-3 text-xs"
                      style={{ background: selectedReasonData.color + "0c", border: `1px solid ${selectedReasonData.color}22` }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-white"
                        style={{ background: selectedReasonData.color }}>
                        {selectedReasonData.icon}
                      </div>
                      <span className="text-gray-600">
                        Reporting as:{" "}
                        <strong style={{ color: selectedReasonData.color }}>{selectedReasonData.label}</strong>{" "}
                        — {selectedReasonData.desc}
                      </span>
                    </div>
                  )}

                  <textarea
                    rows={5}
                    placeholder={`Be specific — what exactly did you notice about this ${typeInfo.label.toLowerCase()}? The more detail you provide, the faster our team can act.`}
                    value={reportText}
                    onChange={(e) => { setReportText(e.target.value); setErrors((p) => ({ ...p, text: "" })); }}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none resize-none placeholder-gray-400 transition-all ${
                      errors.text
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:shadow-[0_0_0_3px_rgba(180,34,37,0.07)]"
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.text
                      ? <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertTriangle size={11} /> {errors.text}</p>
                      : <span />
                    }
                    <p className="text-[10px] text-gray-400 ml-auto">{reportText.length} chars</p>
                  </div>
                </div>

                {/* ── STEP 5: Evidence ── */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-black shrink-0">5</div>
                    <label className="text-sm font-black text-gray-800">
                      Add screenshots{" "}
                      <span className="font-normal text-gray-400 text-xs normal-case tracking-normal">
                        — optional but very helpful
                      </span>
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3 ml-7">
                    Attach up to 5 screenshots or documents (PNG, JPG, PDF · max 5 MB each)
                  </p>

                  {uploading && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1.5"><FiLoader size={12} className="spin" /> Uploading…</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg,#B42225,#FF6B00)" }} />
                      </div>
                    </div>
                  )}

                  <label className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    uploading
                      ? "opacity-50 pointer-events-none border-gray-200 bg-gray-50"
                      : "border-gray-200 bg-gray-50 hover:border-[#B42225]/40 hover:bg-red-50/20"
                  }`}>
                    <FiUpload size={20} className="text-gray-400" />
                    <p className="text-sm font-semibold text-gray-500">Click to attach evidence</p>
                    <input id="evidence-input" type="file" multiple accept="image/*,.pdf"
                      className="hidden" onChange={handleFileChange} disabled={uploading} />
                  </label>

                  {errors.upload && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <FiAlertTriangle size={11} /> {errors.upload}
                    </p>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-3.5 py-2.5 border border-green-100">
                          <FiCheck size={13} className="text-green-500 shrink-0" />
                          <span className="text-xs text-gray-700 flex-1 truncate">{file.filename}</span>
                          <span className="text-[10px] text-gray-400">{(file.bytes / 1024).toFixed(0)} KB</span>
                          <a href={file.url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-blue-500 hover:underline">View</a>
                          <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-500 transition-colors ml-1">
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── STEP 6: Email ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-black shrink-0">6</div>
                    <label className="text-sm font-black text-gray-800">
                      Your email{" "}
                      <span className="font-normal text-gray-400 text-xs normal-case tracking-normal">
                        — optional, for follow-up updates
                      </span>
                    </label>
                  </div>
                  <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.07)]"
                  }`}>
                    <FiMail size={15} className="text-gray-400" />
                    <input type="email" placeholder="your@email.com" value={reporterEmail}
                      onChange={(e) => { setReporterEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                      className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <FiAlertTriangle size={11} /> {errors.email}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <FiLock size={10} /> The {typeInfo.label.toLowerCase()} will never see your identity.
                  </p>
                </div>

                {/* ── Submit ── */}
                <div className="pt-1">
                  {selectedEntity && selectedReason && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl mb-4"
                      style={{ background: "rgba(180,34,37,0.04)", border: "1px solid rgba(180,34,37,0.12)" }}>
                      <FiFlag size={14} className="text-[#B42225] shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Reporting{" "}
                        <strong className="text-gray-800">&quot;{selectedEntity.name}&quot;</strong>{" "}
                        for{" "}
                        <strong style={{ color: selectedReasonData?.color }}>{selectedReasonData?.label}</strong>
                        {uploadedFiles.length > 0 && ` · ${uploadedFiles.length} screenshot${uploadedFiles.length > 1 ? "s" : ""} attached`}
                      </p>
                    </div>
                  )}

                  <button onClick={handleSubmit} disabled={uploading || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#B42225,#DC2626)", boxShadow: "0 6px 24px rgba(180,34,37,0.3)" }}>
                    {isSubmitting
                      ? <><FiLoader size={16} className="spin" /> Submitting report…</>
                      : uploading
                      ? <><FiLoader size={16} className="spin" /> Uploading files…</>
                      : <><FiFlag size={16} /> Submit Report</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ DIRECT CONTACT ══ */}
          <div className="relative rounded-2xl overflow-hidden p-6 md:p-7 text-white"
            style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#1a0505 50%,#B42225 100%)" }}>
            <div className="absolute inset-0 opacity-[0.035]" style={{
              backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <FaHandshake size={15} className="text-red-300" />
                  <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Need direct help?</span>
                </div>
                <h3 className="text-base font-black mb-1" style={{ fontFamily: "'Georgia',serif" }}>
                  Contact our Safety Team
                </h3>
                <p className="text-white/40 text-xs max-w-xs">
                  For urgent safety concerns, reach us directly. We respond within 2 hours on weekdays.
                </p>
              </div>
              <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "#25D366", boxShadow: "0 3px 12px rgba(37,211,102,0.3)" }}>
                  <FaWhatsapp size={14} /> WhatsApp Us
                </a>
                <a href="mailto:safety@jovo.ng"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all">
                  <FiMail size={13} /> safety@jovo.ng
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

export default ReportPage;