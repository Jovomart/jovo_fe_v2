"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout from "@/components/layout/SellerLayout";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
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
  product_images: string[];
  product_videos: string[];
  tags: string[];
  seo_title: string;
  seo_description: string;
  is_digital: boolean;
  specifications: Record<string, string>;
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
  product_videos: [],
  tags: [],
  seo_title: "",
  seo_description: "",
  is_digital: false,
  specifications: {},
};

const CONDITIONS: ProductCondition[] = ["Like New", "Good", "Fair", "Poor"];

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

/** Collapsible card section used throughout the form */
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

// ─── Toggle switch ────────────────────────────────────────────────────────────

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

// ─── Image Uploader ───────────────────────────────────────────────────────────

const ImageUploader = ({
  images,
  onImagesChange,
  label,
  required,
  error,
}: {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  label: string;
  required?: boolean;
  error?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Reset input so the same file can be re-selected after removal
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

    setUploading(true);
    setUploadProgress(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;

    try {
      intervalId = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await apiService.uploadFiles(files, "product_images");

      clearInterval(intervalId);
      intervalId = null;
      setUploadProgress(100);

      const newUrls: string[] = result.urls ?? [];
      onImagesChange([...images, ...newUrls]);
    } catch (err: any) {
      if (intervalId) clearInterval(intervalId);
      console.error("Upload failed:", err);
      alert(err?.message ?? "Failed to upload images. Please try again.");
    } finally {
      // Small delay so the 100% flash is visible
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

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
              Uploading…
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                background: "linear-gradient(90deg,#F97316,#EA580C)",
              }}
            />
          </div>
        </div>
      )}

      {/* Drop zone / upload button */}
      <label
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer mb-3 ${
          uploading
            ? "border-slate-200 bg-slate-50 opacity-60 pointer-events-none"
            : "border-slate-200 hover:border-orange-400 hover:bg-orange-50"
        }`}
      >
        <FiUpload size={15} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600">
          {uploading ? "Uploading…" : "Click to upload images"}
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

      {images.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <FiImage size={22} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No images yet</p>
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

// ─── Video Uploader ───────────────────────────────────────────────────────────

const VideoUploader = ({
  videos,
  onVideosChange,
}: {
  videos: string[];
  onVideosChange: (urls: string[]) => void;
}) => {
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    try {
      const result = await apiService.uploadFiles(files, "product_videos");
      const newUrls: string[] = result.urls ?? [];
      onVideosChange([...videos, ...newUrls]);
    } catch (err: any) {
      alert(err?.message ?? "Failed to upload videos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
          {uploading ? "Uploading…" : "Click to upload videos"}
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

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((url, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="text-xs font-medium text-slate-500 flex-1 truncate">
                {url}
              </span>
              <button
                type="button"
                onClick={() => onVideosChange(videos.filter((_, j) => j !== i))}
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

// ─── Sticky sidebar progress tracker ─────────────────────────────────────────

const SECTIONS = [
  { id: "sec-category", label: "Category" },
  { id: "sec-details", label: "Details" },
  { id: "sec-condition", label: "Condition" },
  { id: "sec-pricing", label: "Pricing" },
  { id: "sec-media", label: "Photos & Video" },
  { id: "sec-seo", label: "SEO & Tags" },
];

const SidebarNav = ({ activeSection }: { activeSection: string }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="hidden lg:flex flex-col gap-1 sticky top-24 w-44 shrink-0"
    >
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

// ─── Main Component ───────────────────────────────────────────────────────────

const AddProductPage = () => {
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [subcategoryFields, setSubcategoryFields] = useState<SubcategoryField[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState("sec-category");

  const hasFetchedRef = useRef(false);

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

  const showToast = (msg: string) => {
    setToastMsg(msg);
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
        (parents.length > 0 ? parents : all).map((c: any) => ({
          id: c.id,
          name: c.name,
        })),
      );
    } catch {
      setApiError("Failed to load categories. Please refresh the page.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategories();
    }
  }, [fetchCategories]);

  // ── Fetch subcategories ──────────────────────────────────────────────────
  const fetchSubcategories = useCallback(async (categoryId: string) => {
    setSubcategories([]);
    setSubcategoriesLoading(true);
    try {
      const res = await apiService.getAllSubcategories(categoryId);
      setSubcategories(
        extractArray(res).map((s: any) => ({ id: s.id, name: s.name })),
      );
    } catch {
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  }, []);

  // ── Fetch subcategory spec schema ────────────────────────────────────────
  const fetchSubcategorySchema = useCallback(async (subcategoryId: string) => {
    setSchemaLoading(true);
    setSubcategoryFields([]);
    try {
      const res = await apiService.getSubcategoryById(subcategoryId, true);
      const responseData = res?.data ?? res;
      const fields = extractSubcategoryFields(responseData);
      setSubcategoryFields(fields);

      const newSpecs: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.key) newSpecs[f.key] = "";
      });
      setForm((prev) => ({ ...prev, specifications: newSpecs }));
    } catch {
      setSubcategoryFields([]);
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setForm((prev) => ({
        ...prev,
        category_id: categoryId,
        subcategory_id: "",
        specifications: {},
      }));
      setErrors((e) => ({ ...e, category_id: "" }));
      setSubcategoryFields([]);
      fetchSubcategories(categoryId);
    },
    [fetchSubcategories],
  );

  const handleSubcategorySelect = useCallback(
    async (subcategoryId: string) => {
      setForm((prev) => ({
        ...prev,
        subcategory_id: subcategoryId,
        specifications: {},
      }));
      await fetchSubcategorySchema(subcategoryId);
    },
    [fetchSubcategorySchema],
  );

  // ── Tag helpers ──────────────────────────────────────────────────────────
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
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.product_description.trim())
      e.product_description = "Description is required";
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
    if (Object.keys(e).length > 0) {
      // Scroll to first error section
      const firstErrSection = SECTIONS.find((s) => {
        const el = document.getElementById(s.id);
        return el?.querySelector("[data-error]");
      });
      if (firstErrSection) {
        document
          .getElementById(firstErrSection.id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setApiError("");

    try {
      const payload: any = {
        category_id: form.category_id,
        product_name: form.product_name.trim(),
        product_description: form.product_description.trim(),
        product_condition: form.product_condition,
        product_original_price: Number(form.product_original_price),
        product_images: form.product_images,
      };

      if (form.subcategory_id) payload.subcategory_id = form.subcategory_id;
      if (form.is_on_sale) payload.is_on_sale = true;
      if (form.product_discount_price && Number(form.product_discount_price) > 0)
        payload.product_discount_price = Number(form.product_discount_price);
      if (form.stock_quantity && Number(form.stock_quantity) >= 0)
        payload.stock_quantity = Number(form.stock_quantity);
      if (form.brand) payload.brand = form.brand;
      if (form.model) payload.model = form.model;
      if (form.is_digital) payload.is_digital = true;
      if (form.product_videos.length) payload.product_videos = form.product_videos;
      if (form.tags.length) payload.tags = form.tags;
      if (form.seo_title) payload.seo_title = form.seo_title;
      if (form.seo_description) payload.seo_description = form.seo_description;

      const specsToSend: Record<string, string> = {};
      for (const [k, v] of Object.entries(form.specifications)) {
        if (v && typeof v === "string" && v.trim()) specsToSend[k] = v.trim();
      }
      if (Object.keys(specsToSend).length > 0) payload.attributes = specsToSend;

      await apiService.createProduct(payload);
      showToast("Product listed! Pending admin review.");
      setTimeout(() => router.push("/seller/products"), 1600);
    } catch (err: any) {
      setApiError(err.message ?? "Failed to create product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Condition colours ────────────────────────────────────────────────────
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
          ((Number(form.product_original_price) -
            Number(form.product_discount_price)) /
            Number(form.product_original_price)) *
            100,
        )
      : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <SellerLayout
        activeNav="products"
        pageTitle="Add Product"
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
          <div className="flex gap-8 max-w-5xl mx-auto">
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <SidebarNav activeSection={activeSection} />

            {/* ── Main form ───────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-4 pb-10">
              {/* Global API error */}
              {apiError && (
                <div className="flex items-start gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
                  <FiAlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-semibold whitespace-pre-wrap">
                    {apiError}
                  </p>
                </div>
              )}

              {/* ── 1. Category ─────────────────────────────────────────── */}
              <FormSection
                id="sec-category"
                icon={<FiTag size={15} />}
                title="Category"
                badge="Required"
              >
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
                          <Field label="Subcategory" error={errors.subcategory_id}>
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
                        ) : null}

                        {/* Dynamic spec fields from subcategory schema */}
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
                                        specifications: {
                                          ...f.specifications,
                                          [field.key]: e.target.value,
                                        },
                                      }))
                                    }
                                  >
                                    <option value="">Select {field.label}…</option>
                                    {field.options.map((o) => (
                                      <option key={o} value={o}>
                                        {o}
                                      </option>
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
                                        specifications: {
                                          ...f.specifications,
                                          [field.key]: e.target.value,
                                        },
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

              {/* ── 2. Product Details ───────────────────────────────────── */}
              <FormSection
                id="sec-details"
                icon={<FiPackage size={15} />}
                title="Product Details"
                badge="Required"
              >
                <Field label="Product Name" required error={errors.product_name}>
                  <input
                    className={inputCls}
                    placeholder="e.g. iPhone 13 Pro Max 256GB"
                    value={form.product_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product_name: e.target.value }))
                    }
                    maxLength={120}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {form.product_name.length}/120
                  </p>
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
                    placeholder="Describe your product in detail — condition, features, what's included…"
                    value={form.product_description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, product_description: e.target.value }))
                    }
                    maxLength={2000}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {form.product_description.length}/2000
                  </p>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Brand">
                    <input
                      className={inputCls}
                      placeholder="e.g. Apple, Samsung"
                      value={form.brand}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, brand: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Model">
                    <input
                      className={inputCls}
                      placeholder="e.g. Pro Max, Galaxy S24"
                      value={form.model}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, model: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                {/* Digital toggle */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Toggle
                    checked={form.is_digital}
                    onChange={() =>
                      setForm((f) => ({ ...f, is_digital: !f.is_digital }))
                    }
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Digital Product</p>
                    <p className="text-[11px] text-slate-400">
                      Enable if this is a downloadable or digital item
                    </p>
                  </div>
                </div>
              </FormSection>

              {/* ── 3. Condition ─────────────────────────────────────────── */}
              <FormSection
                id="sec-condition"
                icon={<FiSliders size={15} />}
                title="Item Condition"
                badge="Required"
              >
                <Field label="Condition" required error={errors.product_condition}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CONDITIONS.map((c) => {
                      const active = form.product_condition === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, product_condition: c }))
                          }
                          className={`py-3 rounded-xl border text-sm font-bold transition ${
                            active
                              ? "text-white shadow-lg"
                              : "border-slate-200 text-slate-600 hover:border-orange-300"
                          }`}
                          style={
                            active
                              ? {
                                  background: conditionColors[c],
                                  borderColor: conditionColors[c],
                                  boxShadow: `0 4px 14px ${conditionColors[c]}40`,
                                }
                              : {}
                          }
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {/* Condition hints */}
                  {form.product_condition && (
                    <div className="mt-3 text-xs text-slate-500 font-medium px-1">
                      {form.product_condition === "Like New" &&
                        "Barely used, no visible signs of wear. May or may not have original packaging."}
                      {form.product_condition === "Good" &&
                        "Some light scratches or signs of use, but fully functional."}
                      {form.product_condition === "Fair" &&
                        "Noticeable wear or cosmetic issues but works fine."}
                      {form.product_condition === "Poor" &&
                        "Heavy wear, damage, or may need repairs. Clearly describe all issues."}
                    </div>
                  )}
                </Field>
              </FormSection>

              {/* ── 4. Pricing & Stock ───────────────────────────────────── */}
              <FormSection
                id="sec-pricing"
                icon={<FiDollarSign size={15} />}
                title="Pricing & Stock"
                badge="Required"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Price (₦)"
                    required
                    error={errors.product_original_price}
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                        ₦
                      </span>
                      <input
                        className={`${inputCls} pl-8`}
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0.00"
                        value={form.product_original_price}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            product_original_price: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </Field>

                  <Field
                    label="Stock Quantity"
                    required
                    hint="Set to 0 to mark as out of stock"
                  >
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1"
                      value={form.stock_quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stock_quantity: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                {/* Sale toggle card */}
                <div
                  className="rounded-2xl border p-4 transition"
                  style={{
                    background: form.is_on_sale ? "#FFF7ED" : "#F8FAFC",
                    borderColor: form.is_on_sale ? "#FED7AA" : "#E2E8F0",
                  }}
                >
                  <div className="flex items-center justify-between mb-0">
                    <div>
                      <p className="text-sm font-black text-slate-800">Put on Sale</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Offer a discounted price to attract buyers
                      </p>
                    </div>
                    <Toggle
                      checked={form.is_on_sale}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          is_on_sale: !f.is_on_sale,
                          product_discount_price: "",
                        }))
                      }
                    />
                  </div>

                  {form.is_on_sale && (
                    <div className="mt-4 space-y-3">
                      <Field
                        label="Sale Price (₦)"
                        required
                        error={errors.product_discount_price}
                      >
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                            ₦
                          </span>
                          <input
                            className={`${inputCls} pl-8`}
                            type="number"
                            min="0"
                            step="100"
                            placeholder="0.00"
                            value={form.product_discount_price}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                product_discount_price: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </Field>
                      {saleSavings > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                          <FiCheck size={11} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">
                            {saleSavings}% discount
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FormSection>

              {/* ── 5. Photos & Video ────────────────────────────────────── */}
              <FormSection
                id="sec-media"
                icon={<FiImage size={15} />}
                title="Photos & Video"
                badge="Required"
              >
                <ImageUploader
                  images={form.product_images}
                  onImagesChange={(urls) =>
                    setForm((f) => ({ ...f, product_images: urls }))
                  }
                  label="Product Images"
                  required
                  error={errors.product_images}
                />
                <VideoUploader
                  videos={form.product_videos}
                  onVideosChange={(urls) =>
                    setForm((f) => ({ ...f, product_videos: urls }))
                  }
                />
              </FormSection>

              {/* ── 6. SEO & Tags ────────────────────────────────────────── */}
              <FormSection
                id="sec-seo"
                icon={<FiInfo size={15} />}
                title="SEO & Tags"
                defaultOpen={false}
              >
                <Field label="Tags" hint="Up to 10 tags. Press Enter or click Add.">
                  <div className="flex gap-2 mb-3">
                    <input
                      className={`${inputCls} flex-1`}
                      placeholder="e.g. electronics, smartphone, apple"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
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
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                tags: f.tags.filter((t) => t !== tag),
                              }))
                            }
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seo_title: e.target.value }))
                    }
                    maxLength={120}
                  />
                </Field>

                <Field label="SEO Description" hint="Max 160 characters.">
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    placeholder="Short description that appears in search engine results"
                    value={form.seo_description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seo_description: e.target.value }))
                    }
                    maxLength={160}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {form.seo_description.length}/160
                  </p>
                </Field>

                {/* Live preview */}
                <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Search preview
                  </p>
                  <p className="text-blue-600 text-sm font-semibold leading-tight mb-0.5">
                    {form.seo_title || form.product_name || "Your Product Title"}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {form.seo_description ||
                      form.product_description?.slice(0, 120) ||
                      "Your product description will appear here…"}
                  </p>
                </div>
              </FormSection>

              {/* ── Submit bar ───────────────────────────────────────────── */}
              <div
                className="sticky bottom-5 z-10 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between gap-4"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
              >
                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  Review your listing before submitting — it goes live after admin
                  approval.
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition shrink-0 disabled:opacity-70"
                  style={{
                    background: submitting
                      ? "#CBD5E1"
                      : "linear-gradient(135deg,#F97316,#EA580C)",
                    boxShadow: submitting
                      ? "none"
                      : "0 4px 14px rgba(249,115,22,0.3)",
                  }}
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw size={14} className="animate-spin" /> Submitting…
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

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl"
          style={{ background: "linear-gradient(135deg,#059669,#047857)" }}
        >
          <FiCheck size={15} /> {toastMsg}
        </div>
      )}
    </>
  );
};

export default AddProductPage;