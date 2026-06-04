"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout from "@/components/layout/SellerLayout";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiPlus,
  FiX,
  FiRefreshCw,
  FiSave,
  FiImage,
  FiWifiOff,
  FiUpload,
  FiTrash2,
  FiLoader,
  FiZap,
  FiClock,
  FiInfo,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditForm {
  product_name: string;
  product_description: string;
  product_condition: "Like New" | "Good" | "Fair" | "Poor" | "";
  product_original_price: string;
  is_on_sale: boolean;
  product_discount_price: string;
  stock_quantity: string;
  is_in_stock: boolean;
  is_active: boolean;
  brand: string;
  model: string;
  product_images: string[];
  product_videos: string[];
  tags: string[];
  seo_title: string;
  seo_description: string;
}

interface FlashSaleCampaign {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface FlashSaleApply {
  enabled: boolean;
  flash_sale_id: string;
  flash_price: string;
  flash_stock: string;
}

const CONDITIONS = ["Like New", "Good", "Fair", "Poor"] as const;

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder-slate-400 bg-white";

const INITIAL_FLASH_SALE: FlashSaleApply = {
  enabled: false,
  flash_sale_id: "",
  flash_price: "",
  flash_stock: "",
};

// ─── Shimmer Skeleton primitives ──────────────────────────────────────────────

const shimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, #f1f5f9 25%, #e9eef5 50%, #f1f5f9 75%)",
  backgroundSize: "400% 100%",
  animation: "skeletonShimmer 1.6s ease-in-out infinite",
  borderRadius: "0.5rem",
};

const Bone = ({
  h = 14,
  w = "100%",
  radius = 8,
  className = "",
}: {
  h?: number;
  w?: string | number;
  radius?: number;
  className?: string;
}) => (
  <div
    className={className}
    style={{ ...shimmerStyle, height: h, width: w, borderRadius: radius, flexShrink: 0 }}
  />
);

const FieldSkeleton = ({ wide = false }: { wide?: boolean }) => (
  <div className="space-y-2">
    <Bone h={10} w={wide ? "45%" : "30%"} />
    <Bone h={42} radius={12} />
  </div>
);

const TextareaSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-2">
    <Bone h={10} w="35%" />
    <Bone h={rows * 22} radius={12} />
  </div>
);

const SectionSkeleton = ({ children }: { children: React.ReactNode }) => (
  <div
    className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}
  >
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
      <Bone h={28} w={28} radius={8} />
      <Bone h={14} w={120} />
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

const LoadingSkeleton = () => (
  <>
    <style>{`
      @keyframes skeletonShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    <div className="p-5 md:p-7">
      <div className="max-w-2xl mx-auto space-y-5">
        <SectionSkeleton>
          <TextareaSkeleton rows={1} />
          <TextareaSkeleton rows={5} />
          <div className="grid grid-cols-2 gap-5">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </SectionSkeleton>
        <SectionSkeleton>
          <div className="space-y-2">
            <Bone h={10} w="30%" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <Bone key={i} h={44} radius={12} />)}
            </div>
          </div>
        </SectionSkeleton>
        <SectionSkeleton>
          <div className="grid grid-cols-2 gap-5">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </SectionSkeleton>
        <SectionSkeleton>
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <Bone key={i} h={72} radius={12} />
            ))}
          </div>
        </SectionSkeleton>
        <SectionSkeleton>
          <FieldSkeleton />
          <FieldSkeleton />
          <TextareaSkeleton rows={3} />
        </SectionSkeleton>
        <div className="flex gap-3 pb-8">
          <Bone h={48} w={100} radius={12} />
          <Bone h={48} radius={12} className="flex-1" />
        </div>
      </div>
    </div>
  </>
);

// ─── Error State ──────────────────────────────────────────────────────────────

const LoadError = ({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) => (
  <div className="p-5 md:p-7">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-red-100 overflow-hidden shadow-sm">
        <div className="px-8 py-12 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <FiWifiOff size={28} className="text-red-400" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 mb-1.5">Couldn't load product</p>
            <p className="text-sm text-slate-500 font-medium max-w-sm">
              {message || "Something went wrong. Check your connection and try again."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
            >
              ← Back to Products
            </button>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }}
            >
              <FiRefreshCw size={13} /> Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-[11px] text-slate-400 mt-1 font-medium">{hint}</p>}
    {error && (
      <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
        <FiAlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

// ─── Section Wrapper ──────────────────────────────────────────────────────────

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <div
    className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}
  >
    <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
      <span className="text-xl">{icon}</span>
      <p className="font-black text-slate-900">{title}</p>
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-orange-500" : "bg-slate-300"}`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
    />
  </button>
);

// ─── Image Upload Component ───────────────────────────────────────────────────

const ImageUploader = ({
  images,
  onImagesChange,
  label,
  required,
  error,
  productId,
}: {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  label: string;
  required?: boolean;
  error?: string;
  productId: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalidFiles = files.filter((f) => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }
    const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed 10MB limit. Please choose smaller images.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await apiService.uploadFiles(files, "product_images", productId);
      clearInterval(interval);
      setUploadProgress(100);
      const newImageUrls = result.urls ?? [];
      onImagesChange([...images, ...newImageUrls]);
    } catch (err: any) {
      alert(err.message || "Failed to upload images. Please try again.");
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
    }
  };

  // Delete a single image from Cloudinary then remove from local state
  const removeImage = async (index: number) => {
    const url = images[index];
    setDeletingUrl(url);
    try {
      // Only call delete API for real Cloudinary URLs (not placeholders)
      if (url && url.startsWith("http") && !url.includes("placehold.co")) {
        await apiService.deleteProductImages([url], productId);
      }
    } catch (err: any) {
      // Non-fatal: even if Cloudinary delete fails, remove from local state
      console.warn("Cloudinary delete failed (non-fatal):", err.message);
    } finally {
      setDeletingUrl(null);
      onImagesChange(images.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>

      {uploading && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-2">
              <FiLoader size={14} className="animate-spin" />
              Uploading images…
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg, #F97316, #EA580C)" }}
            />
          </div>
        </div>
      )}

      <label
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer mb-3 ${
          uploading
            ? "border-gray-200 bg-gray-50 opacity-50 pointer-events-none"
            : "border-gray-200 hover:border-orange-400 hover:bg-orange-50"
        }`}
      >
        <FiUpload size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">
          {uploading ? "Uploading…" : "Click to Upload Images"}
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </label>

      {error && (
        <p className="text-[11px] text-red-500 mb-3 font-semibold flex items-center gap-1">
          <FiAlertCircle size={10} /> {error}
        </p>
      )}

      {images.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <FiImage size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No images yet — click above to upload</p>
          <p className="text-xs text-slate-300 mt-1">JPEG, PNG, WebP up to 10MB each</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-xl border border-slate-200"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23F1F5F9'/%3E%3C/svg%3E")
                }
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-md">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                disabled={deletingUrl === url}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-60"
              >
                {deletingUrl === url ? (
                  <FiLoader size={8} className="animate-spin" />
                ) : (
                  <FiTrash2 size={10} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Flash Sale Section ───────────────────────────────────────────────────────

const FlashSaleSection = ({
  flashSale,
  onFlashSaleChange,
  campaigns,
  loadingCampaigns,
}: {
  flashSale: FlashSaleApply;
  onFlashSaleChange: (data: FlashSaleApply) => void;
  campaigns: FlashSaleCampaign[];
  loadingCampaigns: boolean;
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FiZap size={14} className="text-orange-500" />
            Apply to Flash Sale Campaign
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Submit this product for platform-wide flash sales
          </p>
        </div>
        <Toggle
          checked={flashSale.enabled}
          onChange={() =>
            onFlashSaleChange({
              ...flashSale,
              enabled: !flashSale.enabled,
              flash_sale_id: "",
              flash_price: "",
              flash_stock: "",
            })
          }
        />
      </div>

      {flashSale.enabled && (
        <div className="space-y-4 border-l-2 border-orange-200 pl-4">
          {loadingCampaigns ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
              <FiLoader size={14} className="animate-spin text-orange-400" />
              Loading active campaigns…
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <FiClock size={18} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No active flash sales available</p>
              <p className="text-xs text-slate-400 mt-1">Check back later</p>
            </div>
          ) : (
            <>
              <Field label="Select Campaign" required>
                <select
                  className={inputCls}
                  value={flashSale.flash_sale_id}
                  onChange={(e) => onFlashSaleChange({ ...flashSale, flash_sale_id: e.target.value })}
                >
                  <option value="">Select a flash sale campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {formatDate(c.start_date)} to {formatDate(c.end_date)}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Flash Sale Price (₦)" required>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Discounted price"
                    value={flashSale.flash_price}
                    onChange={(e) => onFlashSaleChange({ ...flashSale, flash_price: e.target.value })}
                  />
                </Field>
                <Field label="Flash Sale Stock" required hint="Limited quantity for flash sale">
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Units to allocate"
                    value={flashSale.flash_stock}
                    onChange={(e) => onFlashSaleChange({ ...flashSale, flash_stock: e.target.value })}
                  />
                </Field>
              </div>

              <div className="flex items-start gap-2 py-2 px-3 rounded-xl bg-amber-50 border border-amber-100">
                <FiInfo size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Admin approval is required before the flash sale price activates. Applying doesn't guarantee acceptance.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const productId = (() => {
    const raw =
      params?.id ??
      params?.product_id ??
      params?.productId ??
      params?.slug ??
      params?.pid;
    if (raw) return Array.isArray(raw) ? raw[0] : (raw as string);
    const match = pathname?.match(/\/products\/([^/]+)/);
    return match?.[1] ?? "";
  })();

  const [form, setForm] = useState<EditForm>({
    product_name: "",
    product_description: "",
    product_condition: "",
    product_original_price: "",
    is_on_sale: false,
    product_discount_price: "",
    stock_quantity: "1",
    is_in_stock: true,
    is_active: true,
    brand: "",
    model: "",
    product_images: [],
    product_videos: [],
    tags: [],
    seo_title: "",
    seo_description: "",
  });

  const [flashSale, setFlashSale] = useState<FlashSaleApply>(INITIAL_FLASH_SALE);
  const [flashSaleCampaigns, setFlashSaleCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [applyingFlashSale, setApplyingFlashSale] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [apiError, setApiError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastIsError, setToastIsError] = useState(false);
  const [willReset, setWillReset] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const hasLoadedRef = useRef(false);
  const hasFetchedCampaignsRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastIsError(isError);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ── Load product ────────────────────────────────────────────────────────────
  const loadProduct = useCallback(async () => {
    if (!productId) {
      setLoadError("No product ID found in the URL. Please go back and try again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoadError("Request timed out. Check your connection and try again.");
      setLoading(false);
    }, 15000);

    try {
      const res = await apiService.getMyProductById(productId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const p = res?.data ?? res;

      if (!p || typeof p !== "object") {
        setLoadError("Product not found or you don't have permission to edit it.");
        return;
      }

      setForm({
        product_name: p.product_name ?? "",
        product_description: p.product_description ?? "",
        product_condition: p.product_condition ?? "",
        product_original_price: String(p.product_original_price ?? ""),
        is_on_sale: p.is_on_sale ?? false,
        product_discount_price: String(p.product_discount_price ?? ""),
        stock_quantity: String(p.stock_quantity ?? 1),
        is_in_stock: p.is_in_stock ?? true,
        is_active: p.is_active ?? true,
        brand: p.brand ?? "",
        model: p.model ?? "",
        product_images: p.product_images ?? [],
        product_videos: p.product_videos ?? [],
        tags: p.tags ?? [],
        seo_title: p.seo_title ?? "",
        seo_description: p.seo_description ?? "",
      });
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const status = err?.response?.status;
      const msg =
        status === 404
          ? "Product not found. It may have been deleted."
          : status === 401 || status === 403
          ? "You don't have permission to edit this product."
          : err?.message ?? "Failed to load product. Please try again.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // ── Load flash sale campaigns ─────────────────────────────────────────────
  const fetchFlashSaleCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const response = await apiService.getActiveFlashSaleCampaign();
      const data = response?.data ?? response;
      let campaigns: FlashSaleCampaign[] = [];
      if (Array.isArray(data)) campaigns = data;
      else if (data?.campaign && typeof data.campaign === "object") campaigns = [data.campaign];
      else if (data?.id) campaigns = [data];
      else if (Array.isArray(data?.campaigns)) campaigns = data.campaigns;
      else if (data?.data && Array.isArray(data.data)) campaigns = data.data;
      setFlashSaleCampaigns(
        campaigns.map((c: any) => ({
          id: c.id,
          name: c.name || c.campaign_name || "Flash Sale",
          start_date: c.start_date,
          end_date: c.end_date,
          status: c.status || "active",
        })),
      );
    } catch {
      setFlashSaleCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current && productId) {
      hasLoadedRef.current = true;
      loadProduct();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loadProduct, productId]);

  useEffect(() => {
    if (!hasFetchedCampaignsRef.current) {
      hasFetchedCampaignsRef.current = true;
      fetchFlashSaleCampaigns();
    }
  }, [fetchFlashSaleCampaigns]);

  const CRITICAL_FIELDS: (keyof EditForm)[] = [
    "product_original_price",
    "product_condition",
    "product_images",
    "product_description",
  ];

  const handleChange = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (CRITICAL_FIELDS.includes(key)) setWillReset(true);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof EditForm, string>> = {};
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.product_description.trim()) e.product_description = "Description is required";
    if (!form.product_condition) e.product_condition = "Condition is required";
    if (!form.product_original_price || Number(form.product_original_price) <= 0)
      e.product_original_price = "Price must be greater than 0";
    if (
      form.is_on_sale &&
      form.product_discount_price &&
      Number(form.product_discount_price) >= Number(form.product_original_price)
    )
      e.product_discount_price = "Sale price must be less than original";
    if (form.product_images.length === 0)
      (e as any).product_images = "At least one image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyFlashSale = async () => {
    if (!flashSale.enabled) return;
    if (!flashSale.flash_sale_id || !flashSale.flash_price || !flashSale.flash_stock) {
      showToast("Please fill in all flash sale fields.", true);
      return;
    }
    setApplyingFlashSale(true);
    try {
      await apiService.applyProductToFlashSale({
        product_id: productId,
        flash_sale_id: flashSale.flash_sale_id,
        flash_price: Number(flashSale.flash_price),
        flash_stock: Number(flashSale.flash_stock),
      });
      showToast("Flash sale application submitted for admin review!");
      setFlashSale(INITIAL_FLASH_SALE);
    } catch (err: any) {
      showToast(err.message || "Failed to apply for flash sale", true);
    } finally {
      setApplyingFlashSale(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      await apiService.updateProduct(productId, {
        product_name: form.product_name.trim(),
        product_description: form.product_description.trim(),
        product_condition: form.product_condition as any,
        product_original_price: Number(form.product_original_price),
        is_on_sale: form.is_on_sale,
        product_discount_price: form.is_on_sale ? Number(form.product_discount_price) : null,
        stock_quantity: Number(form.stock_quantity),
        is_in_stock: form.is_in_stock,
        is_active: form.is_active,
        brand: form.brand || undefined,
        model: form.model || undefined,
        seo_title: form.seo_title || undefined,
        seo_description: form.seo_description || undefined,
        tags: form.tags,
        product_images: form.product_images,
        product_videos: form.product_videos,
      });

      // Also apply flash sale if enabled
      if (flashSale.enabled && flashSale.flash_sale_id) {
        await handleApplyFlashSale();
      }

      showToast(
        willReset
          ? "Product updated. Sent for re-review due to critical changes."
          : "Product updated successfully!"
      );
      setTimeout(() => router.push("/seller/products"), 1800);
    } catch (err: any) {
      setApiError(err.message ?? "Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <SellerLayout activeNav="products" pageTitle="Edit Product">
        <LoadingSkeleton />
      </SellerLayout>
    );
  }

  if (loadError) {
    return (
      <SellerLayout activeNav="products" pageTitle="Edit Product">
        <LoadError
          message={loadError}
          onRetry={loadProduct}
          onBack={() => router.push("/seller/products")}
        />
      </SellerLayout>
    );
  }

  return (
    <>
      <SellerLayout
        activeNav="products"
        pageTitle="Edit Product"
        headerAction={
          <button
            onClick={() => router.push("/seller/products")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
          >
            <FiChevronLeft size={14} /> Back
          </button>
        }
      >
        <div className="p-5 md:p-7">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Re-review warning */}
            {willReset && (
              <div className="flex items-start gap-3 rounded-2xl px-5 py-4 bg-amber-50 border border-amber-200">
                <FiAlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-sm font-black">Pending Re-Review</p>
                  <p className="text-amber-700 text-xs font-medium mt-0.5">
                    You've changed a critical field (price, condition, images, or description).
                    Saving will reset the product to <strong>pending review</strong> until an admin re-approves.
                  </p>
                </div>
              </div>
            )}

            {apiError && (
              <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
                <FiAlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-700 text-sm font-semibold">{apiError}</p>
              </div>
            )}

            {/* ── Basic Info ── */}
            <Section title="Basic Info" icon="📋">
              <Field label="Product Name" required error={errors.product_name}>
                <input
                  className={inputCls}
                  value={form.product_name}
                  onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
                  maxLength={120}
                />
                <p className="text-[11px] text-slate-400 mt-1">{form.product_name.length}/120</p>
              </Field>

              <Field label="Description" required error={errors.product_description}>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={5}
                  value={form.product_description}
                  onChange={(e) => handleChange("product_description", e.target.value)}
                  maxLength={2000}
                />
                <p className="text-[11px] text-slate-400 mt-1">{form.product_description.length}/2000</p>
              </Field>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Brand">
                  <input
                    className={inputCls}
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  />
                </Field>
                <Field label="Model">
                  <input
                    className={inputCls}
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  />
                </Field>
              </div>
            </Section>

            {/* ── Condition ── */}
            <Section title="Condition" icon="✨">
              <Field label="Item Condition" required error={errors.product_condition}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CONDITIONS.map((c) => {
                    const colors: Record<string, string> = {
                      "Like New": "#059669",
                      Good: "#2563EB",
                      Fair: "#D97706",
                      Poor: "#DC2626",
                    };
                    const active = form.product_condition === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChange("product_condition", c)}
                        className={`py-3 rounded-xl border text-sm font-bold transition ${
                          active ? "text-white shadow-lg" : "border-slate-200 text-slate-600 hover:border-orange-300"
                        }`}
                        style={
                          active
                            ? { background: colors[c], borderColor: colors[c], boxShadow: `0 4px 14px ${colors[c]}40` }
                            : {}
                        }
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </Section>

            {/* ── Pricing & Stock ── */}
            <Section title="Pricing & Stock" icon="💰">
              <div className="grid grid-cols-2 gap-5">
                <Field label="Price (₦)" required error={errors.product_original_price}>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₦</span>
                    <input
                      className={`${inputCls} pl-8`}
                      type="number"
                      min="0"
                      value={form.product_original_price}
                      onChange={(e) => handleChange("product_original_price", e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Stock Qty" required hint="0 = out of stock">
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                  />
                </Field>
              </div>

              <div
                className="rounded-2xl border p-4 transition"
                style={{
                  background: form.is_on_sale ? "#FFF7ED" : "#F8FAFC",
                  borderColor: form.is_on_sale ? "#FED7AA" : "#E2E8F0",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-800">On Sale</p>
                  <Toggle
                    checked={form.is_on_sale}
                    onChange={() => setForm((f) => ({ ...f, is_on_sale: !f.is_on_sale }))}
                  />
                </div>
                {form.is_on_sale && (
                  <Field label="Sale Price (₦)" error={errors.product_discount_price}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₦</span>
                      <input
                        className={`${inputCls} pl-8`}
                        type="number"
                        min="0"
                        value={form.product_discount_price}
                        onChange={(e) => setForm((f) => ({ ...f, product_discount_price: e.target.value }))}
                      />
                    </div>
                  </Field>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "is_active" as keyof EditForm, label: "Active Listing", desc: "Visible on marketplace" },
                  { key: "is_in_stock" as keyof EditForm, label: "In Stock", desc: "Available for purchase" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Toggle
                      checked={form[key] as boolean}
                      onChange={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-700">{label}</p>
                      <p className="text-[10px] text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Images ── */}
            <Section title="Product Images" icon="🖼️">
              <ImageUploader
                images={form.product_images}
                onImagesChange={(urls) => handleChange("product_images", urls)}
                label="Product Images"
                required
                error={(errors as any).product_images}
                productId={productId}
              />
            </Section>

            {/* ── Flash Sale ── */}
            <Section title="Flash Sale" icon="⚡">
              <FlashSaleSection
                flashSale={flashSale}
                onFlashSaleChange={setFlashSale}
                campaigns={flashSaleCampaigns}
                loadingCampaigns={loadingCampaigns}
              />
              {flashSale.enabled && flashSale.flash_sale_id && flashSale.flash_price && flashSale.flash_stock && (
                <button
                  type="button"
                  onClick={handleApplyFlashSale}
                  disabled={applyingFlashSale}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#F97316,#EA580C)", boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
                >
                  {applyingFlashSale ? (
                    <><FiLoader size={13} className="animate-spin" /> Applying…</>
                  ) : (
                    <><FiZap size={13} /> Apply for Flash Sale Now</>
                  )}
                </button>
              )}
            </Section>

            {/* ── Tags & SEO ── */}
            <Section title="Tags & SEO" icon="🏷️">
              <Field label="Tags">
                <div className="flex gap-2 mb-3">
                  <input
                    className={`${inputCls} flex-1`}
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-xs font-bold text-orange-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                          className="text-orange-400 hover:text-orange-700"
                        >
                          <FiX size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="SEO Title">
                <input
                  className={inputCls}
                  value={form.seo_title}
                  onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                  maxLength={120}
                />
              </Field>

              <Field label="SEO Description">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.seo_description}
                  onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                  maxLength={160}
                />
                <p className="text-[11px] text-slate-400 mt-1">{form.seo_description.length}/160</p>
              </Field>
            </Section>

            {/* Submit */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => router.push("/seller/products")}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-70"
                style={{
                  background: submitting ? "#CBD5E1" : "linear-gradient(135deg,#F97316,#EA580C)",
                  boxShadow: submitting ? "none" : "0 4px 14px rgba(249,115,22,0.3)",
                }}
              >
                {submitting ? (
                  <><FiRefreshCw size={14} className="animate-spin" /> Saving…</>
                ) : (
                  <><FiSave size={14} /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </SellerLayout>

      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl"
          style={{ background: toastIsError ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "linear-gradient(135deg,#059669,#047857)" }}
        >
          {toastIsError ? <FiAlertCircle size={15} /> : <FiCheck size={15} />}
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default EditProductPage;