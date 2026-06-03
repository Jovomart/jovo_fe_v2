"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout from "@/components/layout/SellerLayout";
import {
  FiAlertCircle,
  FiCheck,
  FiPlus,
  FiX,
  FiImage,
  FiInfo,
  FiTag,
  FiPackage,
  FiDollarSign,
  FiRefreshCw,
  FiLoader,
  FiSliders,
  FiUpload,
  FiTrash2,
  FiChevronDown,
  FiZap,
  FiClock,
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductCondition = "Like New" | "Good" | "Fair" | "Poor";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface SubcategoryField {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "select" | "number";
  options?: string[];
}

interface FlashSaleCampaign {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface ProductForm {
  category_id: string;
  subcategory_id: string;
  product_name: string;
  product_description: string;
  product_condition: ProductCondition | "";
  product_original_price: string;
  is_on_sale: boolean;
  product_discount_price: string;
  stock_quantity: string;
  brand: string;
  model: string;
  product_images: File[];
  product_image_previews: string[];
  product_videos: File[];
  product_video_previews: string[];
  tags: string[];
  seo_title: string;
  seo_description: string;
  is_digital: boolean;
  specifications: Record<string, string>;
}

interface FlashSaleApply {
  enabled: boolean;
  flash_sale_id: string;
  flash_price: string;
  flash_stock: string;
}

const INITIAL_FORM: ProductForm = {
  category_id: "",
  subcategory_id: "",
  product_name: "",
  product_description: "",
  product_condition: "",
  product_original_price: "",
  is_on_sale: false,
  product_discount_price: "",
  stock_quantity: "1",
  brand: "",
  model: "",
  product_images: [],
  product_image_previews: [],
  product_videos: [],
  product_video_previews: [],
  tags: [],
  seo_title: "",
  seo_description: "",
  is_digital: false,
  specifications: {},
};

const INITIAL_FLASH_SALE: FlashSaleApply = {
  enabled: false,
  flash_sale_id: "",
  flash_price: "",
  flash_stock: "",
};

const CONDITIONS: ProductCondition[] = ["Like New", "Good", "Fair", "Poor"];

// ─── Direct upload helper (bypasses apiService to control headers precisely) ──

/**
 * Upload files directly, attaching the bearer token from localStorage.
 * This bypasses the apiService.makeRequest wrapper to rule out any token
 * handling bug there.
 */
async function uploadFilesDirect(
  files: File[],
  uploadType: string,
  entityId: string | undefined,
  baseURL: string,
): Promise<{ urls: string[]; files: any[]; primary_url: string }> {
  // 1. Get the freshest possible token
  let token = localStorage.getItem("access_token");
  if (!token) throw new Error("No access token found. Please log in again.");

  // 2. Check if expired; if so, try to refresh
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp < Math.floor(Date.now() / 1000);
    if (isExpired) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("Session expired. Please log in again.");
      const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!refreshRes.ok) throw new Error("Session expired. Please log in again.");
      const refreshData = await refreshRes.json();
      token = refreshData.access_token;
      if (token) localStorage.setItem("access_token", token);
    }
  } catch (jwtErr: any) {
    if (jwtErr.message.includes("Session expired") || jwtErr.message.includes("log in")) {
      throw jwtErr;
    }
    // JWT parse error — continue with the token we have
  }

  // 3. Build FormData
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("upload_type", uploadType);
  if (entityId && entityId.trim()) {
    formData.append("entity_id", entityId.trim());
  }

  // 4. Fire the request — NO Content-Type header; browser sets multipart boundary
  const response = await fetch(`${baseURL}/upload/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const msg =
      data?.detail?.message ||
      data?.detail ||
      data?.message ||
      data?.error ||
      `Upload failed with status ${response.status}`;
    throw new Error(msg);
  }

  const result = data?.data ?? data;
  return {
    urls: result?.urls ?? [],
    files: result?.files ?? [],
    primary_url: result?.primary_url ?? result?.urls?.[0] ?? "",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractArray(res: any): any[] {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.subcategories)) return data.subcategories;
  return [];
}

function extractSubcategoryFields(subcategoryData: any): SubcategoryField[] {
  let schema = null;

  if (subcategoryData?.effective_attribute_schema)
    schema = subcategoryData.effective_attribute_schema;
  else if (subcategoryData?.attribute_schema)
    schema = subcategoryData.attribute_schema;
  else if (subcategoryData?.data?.effective_attribute_schema)
    schema = subcategoryData.data.effective_attribute_schema;
  else if (subcategoryData?.data?.attribute_schema)
    schema = subcategoryData.data.attribute_schema;

  if (!schema) return [];

  const fields: SubcategoryField[] = [];

  if (Array.isArray(schema)) {
    for (const item of schema) {
      const key =
        item.key || item.name || item.field_name || item.field_key || item.attribute_key;
      if (!key || typeof key !== "string") continue;
      fields.push({
        key,
        label:
          item.label ||
          key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        required: item.required === true,
        type:
          item.type === "select" ? "select" : item.type === "number" ? "number" : "text",
        options: item.options || [],
      });
    }
  } else if (typeof schema === "object") {
    for (const [key, config] of Object.entries(schema)) {
      const fieldConfig = config as any;
      fields.push({
        key,
        label:
          fieldConfig.label ||
          key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        required: fieldConfig.required === true,
        type:
          fieldConfig.type === "select"
            ? "select"
            : fieldConfig.type === "number"
            ? "number"
            : "text",
        options: fieldConfig.options || [],
      });
    }
  }

  return fields;
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder-slate-400 bg-white";

const Field = ({
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
  <div>
    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] text-slate-400 mt-1 font-medium">{hint}</p>
    )}
    {error && (
      <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
        <FiAlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

const FormSection = ({
  id,
  icon,
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-slate-50/60 transition"
        style={{ borderBottom: open ? "1px solid #F1F5F9" : "none" }}
      >
        <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
          {icon}
        </span>
        <span className="font-black text-slate-900 flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-600">
            {badge}
          </span>
        )}
        <FiChevronDown
          size={15}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-6 py-5 space-y-5">{children}</div>}
    </div>
  );
};

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
      checked ? "bg-orange-500" : "bg-slate-300"
    }`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-4" : ""
      }`}
    />
  </button>
);

// ─── Image Uploader ─────────────────────────────────────────────────────────

const ImageUploader = ({
  images,
  previews,
  onImagesChange,
  label,
  required,
  error,
  uploading,
}: {
  images: File[];
  previews: string[];
  onImagesChange: (files: File[], previews: string[]) => void;
  label: string;
  required?: boolean;
  error?: string;
  uploading?: boolean;
}) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalid = files.filter((f) => !f.type.startsWith("image/"));
    if (invalid.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      alert("Some files exceed 10 MB. Please choose smaller images.");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    onImagesChange([...images, ...files], [...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    if (previews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(previews[index]);
    }
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onImagesChange(newImages, newPreviews);
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>

      {uploading && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-2">
              <FiLoader size={13} className="animate-spin text-orange-500" />
              Uploading images…
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 animate-pulse"
              style={{ width: "50%", background: "linear-gradient(90deg,#F97316,#EA580C)" }}
            />
          </div>
        </div>
      )}

      <label
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer mb-3 ${
          uploading
            ? "border-slate-200 bg-slate-50 opacity-60 pointer-events-none"
            : "border-slate-200 hover:border-orange-400 hover:bg-orange-50"
        }`}
      >
        <FiUpload size={15} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600">
          {uploading ? "Uploading…" : "Click to select images"}
        </span>
        <span className="text-xs text-slate-400">JPEG · PNG · WebP · max 10 MB</span>
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

      {previews.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <FiImage size={22} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {previews.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-xl border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23F1F5F9'/%3E%3C/svg%3E";
                }}
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-md">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <FiTrash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Video Uploader ─────────────────────────────────────────────────────────

const VideoUploader = ({
  videos,
  previews,
  onVideosChange,
  uploading,
}: {
  videos: File[];
  previews: string[];
  onVideosChange: (files: File[], previews: string[]) => void;
  uploading?: boolean;
}) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalid = files.filter((f) => !f.type.startsWith("video/"));
    if (invalid.length > 0) {
      alert("Please select only video files (MP4, MOV, WebM)");
      return;
    }
    const oversized = files.filter((f) => f.size > 50 * 1024 * 1024);
    if (oversized.length > 0) {
      alert("Some videos exceed 50 MB limit.");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    onVideosChange([...videos, ...files], [...previews, ...newPreviews]);
  };

  const removeVideo = (index: number) => {
    if (previews[index]?.startsWith("blob:")) URL.revokeObjectURL(previews[index]);
    const newVideos = videos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onVideosChange(newVideos, newPreviews);
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
        Product Videos{" "}
        <span className="normal-case font-medium text-slate-400">(optional)</span>
      </label>

      <label
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer mb-3 ${
          uploading
            ? "border-slate-200 bg-slate-50 opacity-60 pointer-events-none"
            : "border-slate-200 hover:border-orange-400 hover:bg-orange-50"
        }`}
      >
        <FiUpload size={15} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600">
          {uploading ? "Uploading…" : "Click to select videos"}
        </span>
        <span className="text-xs text-slate-400">MP4 · MOV · WebM · max 50 MB</span>
        <input
          type="file"
          multiple
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </label>

      {previews.length > 0 && (
        <div className="space-y-2">
          {previews.map((url, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
            >
              <video src={url} className="w-16 h-12 object-cover rounded" controls={false} />
              <span className="text-xs font-medium text-slate-500 flex-1 truncate">
                Video {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="text-red-400 hover:text-red-600 transition"
              >
                <FiX size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Flash Sale Section ──────────────────────────────────────────────────────

const FlashSaleSection = ({
  flashSale,
  onFlashSaleChange,
  campaigns,
  loadingCampaigns,
  productCreated,
}: {
  flashSale: FlashSaleApply;
  onFlashSaleChange: (data: FlashSaleApply) => void;
  campaigns: FlashSaleCampaign[];
  loadingCampaigns: boolean;
  productCreated: boolean;
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

  if (!productCreated) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center">
        <FiZap size={24} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">
          Save product first to apply for flash sales
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Submit your product, then come back to apply for flash sale campaigns
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FiZap size={14} className="text-orange-500" />
            Apply to Flash Sale Campaign
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Submit your product for platform-wide flash sales
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
                  onChange={(e) =>
                    onFlashSaleChange({ ...flashSale, flash_sale_id: e.target.value })
                  }
                >
                  <option value="">Select a flash sale campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} — {formatDate(campaign.start_date)} to{" "}
                      {formatDate(campaign.end_date)}
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
                    onChange={(e) =>
                      onFlashSaleChange({ ...flashSale, flash_price: e.target.value })
                    }
                  />
                </Field>
                <Field label="Flash Sale Stock" required hint="Limited quantity for the flash sale">
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Units to allocate"
                    value={flashSale.flash_stock}
                    onChange={(e) =>
                      onFlashSaleChange({ ...flashSale, flash_stock: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="flex items-start gap-2 py-2 px-3 rounded-xl bg-amber-50 border border-amber-100">
                <FiInfo size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Admin approval is required before your product's discounted price activates.
                  Applying doesn't guarantee acceptance.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Sidebar nav ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "sec-category", label: "Category" },
  { id: "sec-details", label: "Details" },
  { id: "sec-condition", label: "Condition" },
  { id: "sec-pricing", label: "Pricing" },
  { id: "sec-media", label: "Photos & Video" },
  { id: "sec-flashsale", label: "Flash Sale" },
  { id: "sec-seo", label: "SEO & Tags" },
];

const SidebarNav = ({ activeSection }: { activeSection: string }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="hidden lg:flex flex-col gap-1 sticky top-24 w-44 shrink-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">
        Sections
      </p>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => scrollTo(s.id)}
          className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSection === s.id
              ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

// ─── Submit steps ─────────────────────────────────────────────────────────────

type SubmitStep =
  | "idle"
  | "creating"
  | "uploading_images"
  | "uploading_videos"
  | "updating"
  | "flash_sale"
  | "done";

const STEP_LABELS: Record<SubmitStep, string> = {
  idle: "",
  creating: "Creating product…",
  uploading_images: "Uploading images…",
  uploading_videos: "Uploading videos…",
  updating: "Saving media…",
  flash_sale: "Applying flash sale…",
  done: "Done!",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AddProductPage = () => {
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [flashSale, setFlashSale] = useState<FlashSaleApply>(INITIAL_FLASH_SALE);
  const [flashSaleCampaigns, setFlashSaleCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [productCreated, setProductCreated] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [subcategoryFields, setSubcategoryFields] = useState<SubcategoryField[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [apiError, setApiError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastIsError, setToastIsError] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState("sec-category");

  const hasFetchedRef = useRef(false);
  const isSubmitting = submitStep !== "idle" && submitStep !== "done";

  // Derive base URL once
  const baseURL = (() => {
    const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  })();

  // ── Intersection observer for sidebar highlight ──────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const showToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastIsError(isError);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ── Fetch categories ─────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await apiService.getPublicCategories("PRODUCT");
      const all = extractArray(res);
      const parents = all.filter((c: any) => !c.parent_id);
      setCategories(
        (parents.length > 0 ? parents : all).map((c: any) => ({ id: c.id, name: c.name })),
      );
    } catch {
      setApiError("Failed to load categories. Please refresh the page.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ── Fetch flash sale campaigns ────────────────────────────────────────────
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
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategories();
      fetchFlashSaleCampaigns();
    }
  }, [fetchCategories, fetchFlashSaleCampaigns]);

  // ── Subcategories ────────────────────────────────────────────────────────
  const fetchSubcategories = useCallback(async (categoryId: string) => {
    setSubcategories([]);
    setSubcategoriesLoading(true);
    try {
      const res = await apiService.getAllSubcategories(categoryId);
      setSubcategories(extractArray(res).map((s: any) => ({ id: s.id, name: s.name })));
    } catch {
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  }, []);

  const fetchSubcategorySchema = useCallback(async (subcategoryId: string) => {
    setSchemaLoading(true);
    setSubcategoryFields([]);
    try {
      const res = await apiService.getSubcategoryById(subcategoryId, true);
      const fields = extractSubcategoryFields(res?.data ?? res);
      setSubcategoryFields(fields);
      const newSpecs: Record<string, string> = {};
      fields.forEach((f) => { if (f.key) newSpecs[f.key] = ""; });
      setForm((prev) => ({ ...prev, specifications: newSpecs }));
    } catch {
      setSubcategoryFields([]);
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setForm((prev) => ({ ...prev, category_id: categoryId, subcategory_id: "", specifications: {} }));
      setErrors((e) => ({ ...e, category_id: "" }));
      setSubcategoryFields([]);
      fetchSubcategories(categoryId);
    },
    [fetchSubcategories],
  );

  const handleSubcategorySelect = useCallback(
    async (subcategoryId: string) => {
      setForm((prev) => ({ ...prev, subcategory_id: subcategoryId, specifications: {} }));
      await fetchSubcategorySchema(subcategoryId);
    },
    [fetchSubcategorySchema],
  );

  // ── Tags ─────────────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.category_id) e.category_id = "Please select a category";
    if (!form.subcategory_id) e.subcategory_id = "Please select a subcategory";
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.product_description.trim()) e.product_description = "Description is required";
    if (!form.product_condition) e.product_condition = "Please select a condition";
    if (!form.product_original_price || Number(form.product_original_price) <= 0)
      e.product_original_price = "Price must be greater than 0";
    if (
      form.is_on_sale &&
      (!form.product_discount_price ||
        Number(form.product_discount_price) >= Number(form.product_original_price))
    )
      e.product_discount_price = "Sale price must be less than original price";
    if (form.product_images.length === 0)
      e.product_images = "At least one image is required";
    subcategoryFields.forEach((field) => {
      if (field.required && !form.specifications[field.key]?.trim())
        e[`spec_${field.key}`] = `${field.label} is required`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Flash sale apply ─────────────────────────────────────────────────────
  const applyToFlashSale = async (pid: string): Promise<void> => {
    if (!flashSale.enabled) return;
    if (!flashSale.flash_sale_id || !flashSale.flash_price || !flashSale.flash_stock) {
      showToast("Flash sale fields incomplete — skipped.", true);
      return;
    }
    setSubmitStep("flash_sale");
    try {
      await apiService.applyProductToFlashSale({
        product_id: pid,
        flash_sale_id: flashSale.flash_sale_id,
        flash_price: Number(flashSale.flash_price),
        flash_stock: Number(flashSale.flash_stock),
      });
      showToast("Flash sale application submitted for admin review!");
    } catch (err: any) {
      showToast(err.message || "Failed to apply for flash sale", true);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  /**
   * Upload flow:
   *
   * The backend's /upload/files endpoint requires:
   *   1. A valid Bearer token for a user with seller role.
   *   2. upload_type = "product_images" / "product_videos"
   *   3. entity_id = the product's ID (so the backend can verify ownership)
   *
   * We therefore:
   *   Step 1 — Create the product (with a temporary placeholder image).
   *   Step 2 — Upload real images via uploadFilesDirect(), which handles
   *             token refresh inline and bypasses apiService to avoid any
   *             token-caching bug.
   *   Step 3 — (Optional) Upload videos the same way.
   *   Step 4 — PATCH the product with the real image URLs.
   *   Step 5 — (Optional) Apply flash sale.
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    setApiError("");
    setSubmitStep("creating");

    let newProductId: string | null = null;

    try {
      // ── STEP 1: Create product with placeholder image ─────────────────────
        const payload: any = {
        product_original_price: Number(form.product_original_price),
        product_images: ["https://placehold.co/400x400/F97316/FFFFFF?text=Uploading"],
      };

      payload.subcategory_id = form.subcategory_id; // required by backend
      if (form.is_on_sale) payload.is_on_sale = true;
      if (form.product_discount_price && Number(form.product_discount_price) > 0)
        payload.product_discount_price = Number(form.product_discount_price);
      if (form.stock_quantity) payload.stock_quantity = Number(form.stock_quantity);
      if (form.brand) payload.brand = form.brand;
      if (form.model) payload.model = form.model;
      if (form.is_digital) payload.is_digital = true;
      if (form.tags.length) payload.tags = form.tags;
      if (form.seo_title) payload.seo_title = form.seo_title;
      if (form.seo_description) payload.seo_description = form.seo_description;

      const specs: Record<string, string> = {};
      for (const [k, v] of Object.entries(form.specifications)) {
        if (v?.trim()) specs[k] = v.trim();
      }
      if (Object.keys(specs).length > 0) payload.attributes = specs;

      const productResponse = await apiService.createProduct(payload);
      newProductId = productResponse?.data?.id ?? productResponse?.id ?? null;

      if (!newProductId) {
        throw new Error("Product created but no ID returned. Please check your products list.");
      }

      setProductId(newProductId);
      setProductCreated(true);

      // ── STEP 2: Upload images (with entity_id = newProductId) ─────────────
      setSubmitStep("uploading_images");

      let imageUrls: string[] = [];
      try {
        const result = await uploadFilesDirect(
          form.product_images,
          "product_images",
          newProductId,
          baseURL,
        );
        imageUrls = result.urls;
      } catch (uploadErr: any) {
        // Clean up the orphan product
        try { await apiService.deleteProduct(newProductId); } catch (_) {}
        throw uploadErr;
      }

      if (imageUrls.length === 0) {
        try { await apiService.deleteProduct(newProductId); } catch (_) {}
        throw new Error("Upload succeeded but no image URLs were returned. Please try again.");
      }

      // ── STEP 3: Upload videos (optional, non-fatal) ───────────────────────
      setSubmitStep("uploading_videos");

      let videoUrls: string[] = [];
      if (form.product_videos.length > 0) {
        try {
          const result = await uploadFilesDirect(
            form.product_videos,
            "product_videos",
            newProductId,
            baseURL,
          );
          videoUrls = result.urls;
        } catch (videoErr) {
          console.warn("Video upload failed (non-fatal):", videoErr);
        }
      }

      // ── STEP 4: PATCH product with real media URLs ────────────────────────
      setSubmitStep("updating");

      try {
        const updatePayload: Record<string, any> = { product_images: imageUrls };
        if (videoUrls.length > 0) updatePayload.product_videos = videoUrls;
        await apiService.updateProduct(newProductId, updatePayload);
      } catch (patchErr) {
        // Images are already linked via entity_id — non-fatal
        console.warn("PATCH media URLs failed (non-fatal):", patchErr);
      }

      // ── STEP 5: Flash sale ────────────────────────────────────────────────
      if (flashSale.enabled) {
        await applyToFlashSale(newProductId);
      }

      setSubmitStep("done");
      showToast("Product listed! Pending admin review.");
      setTimeout(() => router.push("/seller/products"), 1600);
    } catch (err: any) {
      console.error("Product creation error:", err);
      setApiError(err.message ?? "Failed to create product. Please try again.");
      setSubmitStep("idle");
    }
  };

  const handleImagesChange = (files: File[], previews: string[]) => {
    setForm((f) => ({ ...f, product_images: files, product_image_previews: previews }));
    if (errors.product_images) setErrors((e) => ({ ...e, product_images: "" }));
  };

  const handleVideosChange = (files: File[], previews: string[]) => {
    setForm((f) => ({ ...f, product_videos: files, product_video_previews: previews }));
  };

  const conditionColors: Record<string, string> = {
    "Like New": "#059669",
    Good: "#2563EB",
    Fair: "#D97706",
    Poor: "#DC2626",
  };

  const saleSavings =
    form.is_on_sale &&
    Number(form.product_discount_price) > 0 &&
    Number(form.product_original_price) > Number(form.product_discount_price)
      ? Math.round(
          ((Number(form.product_original_price) - Number(form.product_discount_price)) /
            Number(form.product_original_price)) * 100,
        )
      : 0;

  return (
    <>
      <SellerLayout activeNav="products" pageTitle="Add Product">
        <div className="p-5 md:p-7">
          <div className="flex gap-8 max-w-5xl mx-auto">
            <SidebarNav activeSection={activeSection} />

            <div className="flex-1 min-w-0 space-y-4 pb-10">
              {apiError && (
                <div className="flex items-start gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
                  <FiAlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-semibold whitespace-pre-wrap">
                    {apiError}
                  </p>
                </div>
              )}

              {isSubmitting && (
                <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-orange-50 border border-orange-200">
                  <FiLoader size={15} className="text-orange-500 animate-spin shrink-0" />
                  <div className="flex-1">
                    <p className="text-orange-800 text-sm font-bold">{STEP_LABELS[submitStep]}</p>
                    <p className="text-orange-600 text-xs mt-0.5">Please don't close this page…</p>
                  </div>
                </div>
              )}

              {/* ── Category ── */}
              <FormSection id="sec-category" icon={<FiTag size={15} />} title="Category" badge="Required">
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 py-6 text-slate-400 text-sm">
                    <FiLoader size={16} className="animate-spin text-orange-400" />
                    Loading categories…
                  </div>
                ) : (
                  <>
                    <Field label="Category" required error={errors.category_id}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-bold text-left transition-all ${
                              form.category_id === cat.id
                                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                                : "border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {form.category_id && (
                      <>
                        {subcategoriesLoading ? (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <FiLoader size={14} className="animate-spin text-orange-400" />
                            Loading subcategories…
                          </div>
                        ) : subcategories.length > 0 ? (
                          <Field label="Subcategory" required error={errors.subcategory_id}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {subcategories.map((sub) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => handleSubcategorySelect(sub.id)}
                                  className={`px-4 py-2.5 rounded-xl border text-sm font-bold text-left transition-all ${
                                    form.subcategory_id === sub.id
                                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                                      : "border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                                  }`}
                                >
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          </Field>
                        ) : (
                          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-amber-50 border border-amber-100">
                            <span className="text-xs text-amber-700 font-medium">No subcategories available for this category — this category may not be supported for product listing.</span>
                          </div>
                        )}

                        {schemaLoading && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <FiLoader size={14} className="animate-spin text-orange-400" />
                            Loading spec fields…
                          </div>
                        )}

                        {!schemaLoading && subcategoryFields.length > 0 && (
                          <div className="space-y-4 pt-2 border-t border-slate-100">
                            <div className="flex items-start gap-2 py-3 px-4 rounded-xl bg-orange-50 border border-orange-100">
                              <FiInfo size={14} className="text-orange-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-orange-700 font-medium">
                                Fill in the additional specs below for this subcategory.
                              </p>
                            </div>
                            {subcategoryFields.map((field) => (
                              <Field
                                key={field.key}
                                label={field.label}
                                required={field.required}
                                error={errors[`spec_${field.key}`]}
                              >
                                {field.type === "select" && field.options?.length ? (
                                  <select
                                    className={inputCls}
                                    value={form.specifications[field.key] || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        specifications: { ...f.specifications, [field.key]: e.target.value },
                                      }))
                                    }
                                  >
                                    <option value="">Select {field.label}…</option>
                                    {field.options.map((o) => (
                                      <option key={o} value={o}>{o}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={field.type === "number" ? "number" : "text"}
                                    className={inputCls}
                                    placeholder={`Enter ${field.label}`}
                                    value={form.specifications[field.key] || ""}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        specifications: { ...f.specifications, [field.key]: e.target.value },
                                      }))
                                    }
                                  />
                                )}
                              </Field>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </FormSection>

              {/* ── Details ── */}
              <FormSection id="sec-details" icon={<FiPackage size={15} />} title="Product Details" badge="Required">
                <Field label="Product Name" required error={errors.product_name}>
                  <input
                    className={inputCls}
                    placeholder="e.g. iPhone 13 Pro Max 256GB"
                    value={form.product_name}
                    onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
                    maxLength={120}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">{form.product_name.length}/120</p>
                </Field>

                <Field
                  label="Description"
                  required
                  error={errors.product_description}
                  hint="Be specific — mention what's included, any defects, and key features."
                >
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={5}
                    placeholder="Describe your product in detail…"
                    value={form.product_description}
                    onChange={(e) => setForm((f) => ({ ...f, product_description: e.target.value }))}
                    maxLength={2000}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">{form.product_description.length}/2000</p>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Brand">
                    <input
                      className={inputCls}
                      placeholder="e.g. Apple, Samsung"
                      value={form.brand}
                      onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    />
                  </Field>
                  <Field label="Model">
                    <input
                      className={inputCls}
                      placeholder="e.g. Pro Max, Galaxy S24"
                      value={form.model}
                      onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    />
                  </Field>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Toggle
                    checked={form.is_digital}
                    onChange={() => setForm((f) => ({ ...f, is_digital: !f.is_digital }))}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Digital Product</p>
                    <p className="text-[11px] text-slate-400">
                      Enable if this is a downloadable or digital item
                    </p>
                  </div>
                </div>
              </FormSection>

              {/* ── Condition ── */}
              <FormSection id="sec-condition" icon={<FiSliders size={15} />} title="Item Condition" badge="Required">
                <Field label="Condition" required error={errors.product_condition}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CONDITIONS.map((c) => {
                      const active = form.product_condition === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, product_condition: c }))}
                          className={`py-3 rounded-xl border text-sm font-bold transition ${
                            active ? "text-white shadow-lg" : "border-slate-200 text-slate-600 hover:border-orange-300"
                          }`}
                          style={active ? { background: conditionColors[c], borderColor: conditionColors[c], boxShadow: `0 4px 14px ${conditionColors[c]}40` } : {}}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {form.product_condition && (
                    <div className="mt-3 text-xs text-slate-500 font-medium px-1">
                      {form.product_condition === "Like New" && "Barely used, no visible signs of wear. May or may not have original packaging."}
                      {form.product_condition === "Good" && "Some light scratches or signs of use, but fully functional."}
                      {form.product_condition === "Fair" && "Noticeable wear or cosmetic issues but works fine."}
                      {form.product_condition === "Poor" && "Heavy wear, damage, or may need repairs. Clearly describe all issues."}
                    </div>
                  )}
                </Field>
              </FormSection>

              {/* ── Pricing ── */}
              <FormSection id="sec-pricing" icon={<FiDollarSign size={15} />} title="Pricing & Stock" badge="Required">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (₦)" required error={errors.product_original_price}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₦</span>
                      <input
                        className={`${inputCls} pl-8`}
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0.00"
                        value={form.product_original_price}
                        onChange={(e) => setForm((f) => ({ ...f, product_original_price: e.target.value }))}
                      />
                    </div>
                  </Field>

                  <Field label="Stock Quantity" required hint="Set to 0 to mark as out of stock">
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1"
                      value={form.stock_quantity}
                      onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                    />
                  </Field>
                </div>

                <div
                  className="rounded-2xl border p-4 transition"
                  style={{ background: form.is_on_sale ? "#FFF7ED" : "#F8FAFC", borderColor: form.is_on_sale ? "#FED7AA" : "#E2E8F0" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-800">Put on Sale</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Offer a discounted price to attract buyers</p>
                    </div>
                    <Toggle
                      checked={form.is_on_sale}
                      onChange={() => setForm((f) => ({ ...f, is_on_sale: !f.is_on_sale, product_discount_price: "" }))}
                    />
                  </div>

                  {form.is_on_sale && (
                    <div className="mt-4 space-y-3">
                      <Field label="Sale Price (₦)" required error={errors.product_discount_price}>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₦</span>
                          <input
                            className={`${inputCls} pl-8`}
                            type="number"
                            min="0"
                            step="100"
                            placeholder="0.00"
                            value={form.product_discount_price}
                            onChange={(e) => setForm((f) => ({ ...f, product_discount_price: e.target.value }))}
                          />
                        </div>
                      </Field>
                      {saleSavings > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                          <FiCheck size={11} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">{saleSavings}% discount</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FormSection>

              {/* ── Media ── */}
              <FormSection id="sec-media" icon={<FiImage size={15} />} title="Photos & Video" badge="Required">
                <ImageUploader
                  images={form.product_images}
                  previews={form.product_image_previews}
                  onImagesChange={handleImagesChange}
                  label="Product Images"
                  required
                  error={errors.product_images}
                  uploading={submitStep === "uploading_images"}
                />
                <VideoUploader
                  videos={form.product_videos}
                  previews={form.product_video_previews}
                  onVideosChange={handleVideosChange}
                  uploading={submitStep === "uploading_videos"}
                />
              </FormSection>

              {/* ── Flash Sale ── */}
              <FormSection id="sec-flashsale" icon={<FiZap size={15} />} title="Flash Sale" defaultOpen={false}>
                <FlashSaleSection
                  flashSale={flashSale}
                  onFlashSaleChange={setFlashSale}
                  campaigns={flashSaleCampaigns}
                  loadingCampaigns={loadingCampaigns}
                  productCreated={productCreated}
                />
              </FormSection>

              {/* ── SEO ── */}
              <FormSection id="sec-seo" icon={<FiInfo size={15} />} title="SEO & Tags" defaultOpen={false}>
                <Field label="Tags" hint="Up to 10 tags. Press Enter or click Add.">
                  <div className="flex gap-2 mb-3">
                    <input
                      className={`${inputCls} flex-1`}
                      placeholder="e.g. electronics, smartphone, apple"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={form.tags.length >= 10}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FiPlus size={14} /> Add
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
                            className="text-orange-400 hover:text-orange-700 transition"
                          >
                            <FiX size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>

                <Field label="SEO Title" hint="Leave blank to use product name.">
                  <input
                    className={inputCls}
                    placeholder="Optimised title for search engines"
                    value={form.seo_title}
                    onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                    maxLength={120}
                  />
                </Field>

                <Field label="SEO Description" hint="Max 160 characters.">
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    placeholder="Short description that appears in search engine results"
                    value={form.seo_description}
                    onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                    maxLength={160}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">{form.seo_description.length}/160</p>
                </Field>

                <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Search preview</p>
                  <p className="text-blue-600 text-sm font-semibold leading-tight mb-0.5">
                    {form.seo_title || form.product_name || "Your Product Title"}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {form.seo_description || form.product_description?.slice(0, 120) || "Your product description will appear here…"}
                  </p>
                </div>
              </FormSection>

              {/* ── Submit bar ── */}
              <div
                className="sticky bottom-5 z-10 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between gap-4"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
              >
                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  Review your listing before submitting — it goes live after admin approval.
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition shrink-0 disabled:opacity-70"
                  style={{
                    background: isSubmitting ? "#CBD5E1" : "linear-gradient(135deg,#F97316,#EA580C)",
                    boxShadow: isSubmitting ? "none" : "0 4px 14px rgba(249,115,22,0.3)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <FiRefreshCw size={14} className="animate-spin" />
                      {STEP_LABELS[submitStep]}
                    </>
                  ) : (
                    <>
                      <MdOutlineInventory2 size={16} /> List Product
                    </>
                  )}
                </button>
              </div>
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

export default AddProductPage;