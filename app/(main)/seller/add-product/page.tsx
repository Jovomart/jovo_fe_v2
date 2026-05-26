"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/apiService";
import SellerLayout from "@/components/layout/SellerLayout";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronRight,
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
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";

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

type StepId = "category" | "specs" | "details" | "pricing" | "media" | "seo";

const ALL_STEPS: { id: StepId; label: string; icon: React.ReactNode }[] = [
  { id: "category", label: "Category", icon: <FiTag size={15} /> },
  { id: "specs", label: "Specs", icon: <FiSliders size={15} /> },
  { id: "details", label: "Details", icon: <FiPackage size={15} /> },
  { id: "pricing", label: "Pricing", icon: <FiDollarSign size={15} /> },
  { id: "media", label: "Media", icon: <FiImage size={15} /> },
  { id: "seo", label: "SEO & Tags", icon: <FiInfo size={15} /> },
];

function extractArray(res: any): any[] {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.subcategories)) return data.subcategories;
  return [];
}

function extractSubcategoryFields(subcategoryData: any): SubcategoryField[] {
  console.log("Full subcategory data:", JSON.stringify(subcategoryData, null, 2));

  let schema = null;

  if (subcategoryData?.effective_attribute_schema) {
    schema = subcategoryData.effective_attribute_schema;
    console.log("Found effective_attribute_schema");
  } else if (subcategoryData?.attribute_schema) {
    schema = subcategoryData.attribute_schema;
    console.log("Found attribute_schema");
  } else if (subcategoryData?.data?.effective_attribute_schema) {
    schema = subcategoryData.data.effective_attribute_schema;
    console.log("Found data.effective_attribute_schema");
  } else if (subcategoryData?.data?.attribute_schema) {
    schema = subcategoryData.data.attribute_schema;
    console.log("Found data.attribute_schema");
  }

  if (!schema) {
    console.log("No schema found in response");
    return [];
  }

  console.log("Schema:", schema);

  const fields: SubcategoryField[] = [];

  // ✅ FIX: Handle ARRAY format — [{key: "storage_capacity", label: "...", ...}, ...]
  // The old code called Object.entries() on an array which produces ["0", item], ["1", item]
  // causing specs to be stored as {"0": "128GB"} instead of {"storage_capacity": "128GB"}
  if (Array.isArray(schema)) {
    console.log("Schema is an ARRAY — extracting key from each item");
    for (const item of schema) {
      // The named key may live under different property names depending on the API
      const key =
        item.key ||
        item.name ||
        item.field_name ||
        item.field_key ||
        item.attribute_key;

      if (!key || typeof key !== "string") {
        console.warn("Skipping schema item — no usable key found:", item);
        continue;
      }

      fields.push({
        key,
        label:
          item.label ||
          key.replace(/_/g, " ").replace(/\b\w/g, (c: string) =>
            c.toUpperCase()
          ),
        required: item.required === true,
        type:
          item.type === "select"
            ? "select"
            : item.type === "number"
            ? "number"
            : "text",
        options: item.options || [],
      });

      console.log(`Added field from array item: key="${key}"`);
    }
  } else if (typeof schema === "object") {
    // Handle OBJECT format — {storage_capacity: {label: "...", ...}}
    console.log("Schema is an OBJECT — using Object.entries()");
    for (const [key, config] of Object.entries(schema)) {
      const fieldConfig = config as any;
      fields.push({
        key,
        label:
          fieldConfig.label ||
          key.replace(/_/g, " ").replace(/\b\w/g, (c: string) =>
            c.toUpperCase()
          ),
        required: fieldConfig.required === true,
        type:
          fieldConfig.type === "select"
            ? "select"
            : fieldConfig.type === "number"
            ? "number"
            : "text",
        options: fieldConfig.options || [],
      });

      console.log(`Added field from object key: key="${key}"`);
    }
  }

  console.log(
    "Final extracted fields:",
    fields.map((f) => ({ key: f.key, label: f.label }))
  );
  return fields;
}

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

const StepCategory = ({
  form,
  onCategorySelect,
  onSubcategorySelect,
  categories,
  subcategories,
  categoriesLoading,
  subcategoriesLoading,
  errors,
}: any) => {
  if (categoriesLoading)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FiLoader size={32} className="text-orange-500 animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading categories…</p>
      </div>
    );

  if (!categories.length)
    return (
      <div className="text-center py-12">
        <FiAlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No categories available</p>
        <p className="text-slate-400 text-sm mt-1">Please contact support</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <Field label="Category" required error={errors.category_id}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategorySelect(cat.id)}
              className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-all ${
                form.category_id === cat.id
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
                  : "border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Field>

      {form.category_id && subcategories.length > 0 && (
        <div className="space-y-3">
          {subcategoriesLoading ? (
            <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
              <FiLoader size={16} className="animate-spin text-orange-400" />
              Loading subcategories…
            </div>
          ) : (
            <Field label="Subcategory" required error={errors.subcategory_id}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subcategories.map((sub: any) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSubcategorySelect(sub.id)}
                    className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-all ${
                      form.subcategory_id === sub.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
                        : "border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </Field>
          )}
        </div>
      )}
    </div>
  );
};

const StepSpecs = ({
  form,
  setForm,
  fields,
  errors,
  loading,
}: any) => {
  const update = (key: string, value: string) => {
    console.log(`Updating spec: key="${key}" value="${value}"`);
    setForm({
      ...form,
      specifications: { ...form.specifications, [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FiLoader size={32} className="text-orange-500 animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading specification fields…</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-12">
        <FiCheck size={48} className="text-emerald-500 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">
          No additional specifications required
        </p>
        <p className="text-slate-400 text-sm mt-1">
          You can continue to the next step
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 bg-orange-50 border border-orange-100 flex items-start gap-3">
        <FiInfo size={15} className="text-orange-500 mt-0.5 shrink-0" />
        <p className="text-sm text-orange-700 font-medium leading-relaxed">
          This subcategory requires additional specifications. Please fill in
          all required fields below before listing.
        </p>
      </div>

      {fields.map((field: any) => (
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
              onChange={(e) => update(field.key, e.target.value)}
            >
              <option value="">Select {field.label}…</option>
              {field.options.map((o: string) => (
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
              onChange={(e) => update(field.key, e.target.value)}
            />
          )}
        </Field>
      ))}
    </div>
  );
};

const StepDetails = ({ form, setForm, errors }: any) => (
  <div className="space-y-5">
    <Field label="Product Name" required error={errors.product_name}>
      <input
        className={inputCls}
        placeholder="e.g. iPhone 13 Pro Max 256GB"
        value={form.product_name}
        onChange={(e) => setForm({ ...form, product_name: e.target.value })}
        maxLength={120}
      />
      <p className="text-[11px] text-slate-400 mt-1">
        {form.product_name.length}/120
      </p>
    </Field>

    <Field label="Description" required error={errors.product_description}>
      <textarea
        className={`${inputCls} resize-none`}
        rows={5}
        placeholder="Describe your product in detail — condition, features, what's included…"
        value={form.product_description}
        onChange={(e) =>
          setForm({ ...form, product_description: e.target.value })
        }
        maxLength={2000}
      />
      <p className="text-[11px] text-slate-400 mt-1">
        {form.product_description.length}/2000
      </p>
    </Field>

    <Field label="Condition" required error={errors.product_condition}>
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
              onClick={() => setForm({ ...form, product_condition: c })}
              className={`py-3 rounded-xl border text-sm font-bold transition ${
                active
                  ? "text-white shadow-lg"
                  : "border-slate-200 text-slate-600 hover:border-orange-300"
              }`}
              style={
                active
                  ? {
                      background: colors[c],
                      borderColor: colors[c],
                      boxShadow: `0 4px 14px ${colors[c]}40`,
                    }
                  : {}
              }
            >
              {c}
            </button>
          );
        })}
      </div>
    </Field>

    <div className="grid grid-cols-2 gap-5">
      <Field label="Brand">
        <input
          className={inputCls}
          placeholder="e.g. Apple, Samsung"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />
      </Field>
      <Field label="Model">
        <input
          className={inputCls}
          placeholder="e.g. Pro Max, Galaxy S24"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
        />
      </Field>
    </div>

    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <button
        type="button"
        onClick={() => setForm({ ...form, is_digital: !form.is_digital })}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          form.is_digital ? "bg-orange-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            form.is_digital ? "translate-x-4" : ""
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-bold text-slate-700">Digital Product</p>
        <p className="text-[11px] text-slate-400">
          Enable if this is a downloadable or digital item
        </p>
      </div>
    </div>
  </div>
);

const StepPricing = ({ form, setForm, errors }: any) => {
  const original = Number(form.product_original_price) || 0;
  const discounted = Number(form.product_discount_price) || 0;
  const savings =
    form.is_on_sale && discounted > 0 && original > discounted
      ? Math.round(((original - discounted) / original) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Original Price (₦)"
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
                setForm({ ...form, product_original_price: e.target.value })
              }
            />
          </div>
        </Field>

        <Field
          label="Stock Quantity"
          required
          error={errors.stock_quantity}
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
              setForm({ ...form, stock_quantity: e.target.value })
            }
          />
        </Field>
      </div>

      <div
        className="rounded-2xl border p-5 transition"
        style={{
          background: form.is_on_sale ? "#FFF7ED" : "#F8FAFC",
          borderColor: form.is_on_sale ? "#FED7AA" : "#E2E8F0",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-black text-slate-800">Put on Sale</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Set a discounted sale price
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                is_on_sale: !form.is_on_sale,
                product_discount_price: "",
              })
            }
            className={`relative w-12 h-6 rounded-full transition-colors ${
              form.is_on_sale ? "bg-orange-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                form.is_on_sale ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {form.is_on_sale && (
          <div className="space-y-4">
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
                    setForm({
                      ...form,
                      product_discount_price: e.target.value,
                    })
                  }
                />
              </div>
            </Field>
            {savings > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <FiCheck size={12} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">
                  {savings}% discount
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StepMedia = ({ form, setForm, errors }: any) => {
  const [imgInput, setImgInput] = useState("");
  const [vidInput, setVidInput] = useState("");

  const addImage = () => {
    const url = imgInput.trim();
    if (url && !form.product_images.includes(url)) {
      setForm({ ...form, product_images: [...form.product_images, url] });
      setImgInput("");
    }
  };

  const addVideo = () => {
    const url = vidInput.trim();
    if (url && !form.product_videos.includes(url)) {
      setForm({ ...form, product_videos: [...form.product_videos, url] });
      setVidInput("");
    }
  };

  return (
    <div className="space-y-6">
      <Field
        label="Product Images"
        required
        error={errors.product_images}
        hint="Paste image URLs. Add at least 1 image."
      >
        <div className="flex gap-2 mb-3">
          <input
            className={`${inputCls} flex-1`}
            placeholder="https://res.cloudinary.com/…/image.jpg"
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addImage()}
          />
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition flex items-center gap-1.5"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
        {form.product_images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {form.product_images.map((url: string, i: number) => (
              <div key={i} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`Product image ${i + 1}`}
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
                  onClick={() =>
                    setForm({
                      ...form,
                      product_images: form.product_images.filter(
                        (_: any, idx: number) => idx !== i
                      ),
                    })
                  }
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field
        label="Product Videos (Optional)"
        hint="Paste video URLs — Cloudinary, YouTube, or direct links."
      >
        <div className="flex gap-2 mb-3">
          <input
            className={`${inputCls} flex-1`}
            placeholder="https://…/video.mp4"
            value={vidInput}
            onChange={(e) => setVidInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addVideo()}
          />
          <button
            type="button"
            onClick={addVideo}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
        {form.product_videos.length > 0 && (
          <div className="space-y-2">
            {form.product_videos.map((url: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="text-xs font-bold text-slate-500 flex-1 truncate">
                  {url}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      product_videos: form.product_videos.filter(
                        (_: any, idx: number) => idx !== i
                      ),
                    })
                  }
                  className="text-red-400 hover:text-red-600 transition"
                >
                  <FiX size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>
    </div>
  );
};

const StepSEO = ({ form, setForm }: any) => {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  };

  return (
    <div className="space-y-5">
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
            {form.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-xs font-bold text-orange-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      tags: form.tags.filter((t: string) => t !== tag),
                    })
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
          placeholder="Optimized title for search engines"
          value={form.seo_title}
          onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
          maxLength={120}
        />
      </Field>

      <Field label="SEO Description" hint="Max 160 chars.">
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="Short description that appears in search engine results"
          value={form.seo_description}
          onChange={(e) =>
            setForm({ ...form, seo_description: e.target.value })
          }
          maxLength={160}
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {form.seo_description.length}/160
        </p>
      </Field>

      <div
        className="rounded-2xl p-5 border"
        style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Listing Preview
        </p>
        <div className="space-y-1">
          <p className="text-blue-600 text-sm font-semibold leading-tight">
            {form.seo_title || form.product_name || "Your Product Title"}
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {form.seo_description ||
              form.product_description?.slice(0, 120) ||
              "Your product description will appear here…"}
          </p>
        </div>
      </div>
    </div>
  );
};

const AddProductPage = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  const [subcategoryFields, setSubcategoryFields] = useState<
    SubcategoryField[]
  >([]);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const visibleSteps =
    subcategoryFields.length > 0
      ? ALL_STEPS
      : ALL_STEPS.filter((s) => s.id !== "specs");

  const currentStepDef = visibleSteps[step - 1];
  const isLastStep = step === visibleSteps.length;

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await apiService.getPublicCategories("PRODUCT");
      const all = extractArray(res);
      const parents = all
        .filter((c: any) => !c.parent_id)
        .map((c: any) => ({ id: c.id, name: c.name }));
      setCategories(
        parents.length > 0
          ? parents
          : all.map((c: any) => ({ id: c.id, name: c.name }))
      );
    } catch {
      setApiError("Failed to load categories. Please refresh the page.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchSubcategories = useCallback(async (categoryId: string) => {
    setSubcategories([]);
    setSubcategoriesLoading(true);
    try {
      const res = await apiService.getAllSubcategories(categoryId);
      setSubcategories(
        extractArray(res).map((s: any) => ({ id: s.id, name: s.name }))
      );
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
      console.log("Subcategory API response:", res);

      const responseData = res?.data ?? res;
      const fields = extractSubcategoryFields(responseData);

      console.log("Extracted fields count:", fields.length);
      console.log("Field keys:", fields.map((f) => f.key));

      setSubcategoryFields(fields);

      // ✅ Initialize specs using the real named keys from fields
      const newSpecs: Record<string, string> = {};
      fields.forEach((field) => {
        if (field.key && typeof field.key === "string" && field.key !== "") {
          newSpecs[field.key] = "";
          console.log(`Initialized spec key: "${field.key}"`);
        }
      });

      console.log("Initialized specification keys:", Object.keys(newSpecs));
      setForm((prev) => ({ ...prev, specifications: newSpecs }));
    } catch (err) {
      console.error("Failed to fetch subcategory schema:", err);
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
      setErrors({});
      setSubcategoryFields([]);
      fetchSubcategories(categoryId);
    },
    [fetchSubcategories]
  );

  const handleSubcategorySelect = useCallback(
    async (subcategoryId: string) => {
      setForm((prev) => ({
        ...prev,
        subcategory_id: subcategoryId,
        specifications: {},
      }));
      setErrors((prev) => ({ ...prev, subcategory_id: undefined }));
      await fetchSubcategorySchema(subcategoryId);
    },
    [fetchSubcategorySchema]
  );

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string | undefined> = {};
    const stepId = visibleSteps[currentStep - 1]?.id;

    if (stepId === "category") {
      if (!form.category_id) newErrors.category_id = "Please select a category";
    }

    if (stepId === "specs") {
      subcategoryFields.forEach((field) => {
        if (field.required && !form.specifications[field.key]?.trim())
          newErrors[`spec_${field.key}`] = `${field.label} is required`;
      });
    }

    if (stepId === "details") {
      if (!form.product_name.trim())
        newErrors.product_name = "Product name is required";
      if (!form.product_description.trim())
        newErrors.product_description = "Description is required";
      if (!form.product_condition)
        newErrors.product_condition = "Please select a condition";
    }

    if (stepId === "pricing") {
      if (
        !form.product_original_price ||
        Number(form.product_original_price) <= 0
      )
        newErrors.product_original_price = "Price must be greater than 0";
      if (
        form.is_on_sale &&
        (!form.product_discount_price ||
          Number(form.product_discount_price) >=
            Number(form.product_original_price))
      )
        newErrors.product_discount_price =
          "Sale price must be less than original price";
    }

    if (stepId === "media") {
      if (form.product_images.length === 0)
        newErrors.product_images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < visibleSteps.length) setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

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

      if (form.subcategory_id) {
        payload.subcategory_id = form.subcategory_id;
      }

      if (form.is_on_sale) {
        payload.is_on_sale = form.is_on_sale;
      }

      if (
        form.product_discount_price &&
        Number(form.product_discount_price) > 0
      ) {
        payload.product_discount_price = Number(form.product_discount_price);
      }

      if (form.stock_quantity && Number(form.stock_quantity) >= 0) {
        payload.stock_quantity = Number(form.stock_quantity);
      }

      if (form.brand) payload.brand = form.brand;
      if (form.model) payload.model = form.model;
      if (form.is_digital) payload.is_digital = form.is_digital;
      if (form.product_videos.length)
        payload.product_videos = form.product_videos;
      if (form.tags.length) payload.tags = form.tags;
      if (form.seo_title) payload.seo_title = form.seo_title;
      if (form.seo_description) payload.seo_description = form.seo_description;

      // ✅ Nest specs under a "specifications" object — the API does not accept
      // them as top-level fields even though the keys are correct.
      // Correct shape: { specifications: { storage_capacity: "128GB", ... } }
      console.log("Current specifications:", form.specifications);
      console.log("Specification keys:", Object.keys(form.specifications));

      const specsToSend: Record<string, string> = {};
      for (const [key, value] of Object.entries(form.specifications)) {
        if (value && typeof value === "string" && value.trim()) {
          specsToSend[key] = value.trim();
          console.log(`Added to specifications: ${key} = ${value}`);
        }
      }

      if (Object.keys(specsToSend).length > 0) {
        payload.attributes = specsToSend;
      }

      console.log("Final payload:", JSON.stringify(payload, null, 2));

      await apiService.createProduct(payload);
      showToast("Product listed successfully! Pending admin review.");
      setTimeout(() => router.push("/seller/products"), 1500);
    } catch (err: any) {
      console.error("Full error object:", err);
      const message: string =
        err.message ?? "Failed to create product. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStepDef?.id) {
      case "category":
        return (
          <StepCategory
            form={form}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            categories={categories}
            subcategories={subcategories}
            categoriesLoading={categoriesLoading}
            subcategoriesLoading={subcategoriesLoading}
            errors={errors}
          />
        );
      case "specs":
        return (
          <StepSpecs
            form={form}
            setForm={setForm}
            fields={subcategoryFields}
            errors={errors}
            loading={schemaLoading}
          />
        );
      case "details":
        return <StepDetails form={form} setForm={setForm} errors={errors} />;
      case "pricing":
        return <StepPricing form={form} setForm={setForm} errors={errors} />;
      case "media":
        return <StepMedia form={form} setForm={setForm} errors={errors} />;
      case "seo":
        return <StepSEO form={form} setForm={setForm} />;
      default:
        return null;
    }
  };

  const isContinueDisabled =
    (currentStepDef?.id === "category" && subcategoriesLoading) ||
    (currentStepDef?.id === "specs" && schemaLoading);

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
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
              {visibleSteps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => i + 1 < step && setStep(i + 1)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition flex-1 justify-center ${
                      step === i + 1
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                        : step > i + 1
                        ? "bg-emerald-50 text-emerald-700 cursor-pointer"
                        : "bg-slate-50 text-slate-400 cursor-default"
                    }`}
                  >
                    {step > i + 1 ? <FiCheck size={12} /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < visibleSteps.length - 1 && (
                    <div
                      className={`w-3 h-0.5 shrink-0 ${
                        step > i + 1 ? "bg-emerald-300" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }}
            >
              <div
                className="px-7 py-5"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#FFF7ED,#FEF3C7)",
                    }}
                  >
                    <span className="text-orange-500">
                      {currentStepDef?.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Step {step} of {visibleSteps.length}
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {currentStepDef?.label}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-7 py-6">{renderStepContent()}</div>

              {apiError && (
                <div className="mx-7 mb-4 flex items-center gap-3 rounded-xl px-4 py-3.5 bg-red-50 border border-red-200">
                  <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-red-700 text-sm font-semibold whitespace-pre-wrap">
                    {apiError}
                  </p>
                </div>
              )}

              <div
                className="flex items-center justify-between px-7 py-5"
                style={{ borderTop: "1px solid #F8FAFC" }}
              >
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={14} /> Back
                </button>

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isContinueDisabled}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg,#F97316,#EA580C)",
                      boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
                    }}
                  >
                    {isContinueDisabled ? (
                      <>
                        <FiLoader size={14} className="animate-spin" />{" "}
                        Loading…
                      </>
                    ) : (
                      <>
                        Continue <FiChevronRight size={14} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-70"
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
                        <FiRefreshCw size={14} className="animate-spin" />{" "}
                        Submitting…
                      </>
                    ) : (
                      <>
                        <MdOutlineInventory2 size={16} /> List Product
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>

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