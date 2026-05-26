"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

const CONDITIONS = ["Like New", "Good", "Fair", "Poor"] as const;

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder-slate-400 bg-white";

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

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = (params?.id ?? params?.product_id) as string;

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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [apiError, setApiError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [willReset, setWillReset] = useState(false);

  const [imgInput, setImgInput] = useState("");
  const [vidInput, setVidInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Load product
  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await apiService.getMyProductById(productId);
        const p = res?.data ?? res;
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
        setApiError(err.message ?? "Failed to load product.");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // Fields that trigger re-review
  const CRITICAL_FIELDS: (keyof EditForm)[] = [
    "product_original_price",
    "product_condition",
    "product_images",
    "product_description",
  ];

  const handleChange = <K extends keyof EditForm>(
    key: K,
    value: EditForm[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (CRITICAL_FIELDS.includes(key)) setWillReset(true);
  };

  const addImage = () => {
    const url = imgInput.trim();
    if (url && !form.product_images.includes(url)) {
      handleChange("product_images", [...form.product_images, url]);
      setImgInput("");
    }
  };

  const addVideo = () => {
    const url = vidInput.trim();
    if (url && !form.product_videos.includes(url)) {
      setForm((f) => ({ ...f, product_videos: [...f.product_videos, url] }));
      setVidInput("");
    }
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
    if (!form.product_name.trim())
      e.product_name = "Product name is required";
    if (!form.product_description.trim())
      e.product_description = "Description is required";
    if (!form.product_condition)
      e.product_condition = "Condition is required";
    if (!form.product_original_price || Number(form.product_original_price) <= 0)
      e.product_original_price = "Price must be greater than 0";
    if (
      form.is_on_sale &&
      form.product_discount_price &&
      Number(form.product_discount_price) >=
        Number(form.product_original_price)
    )
      e.product_discount_price = "Sale price must be less than original";
    if (form.product_images.length === 0)
      (e as any).product_images = "At least one image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
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
        product_discount_price: form.is_on_sale
          ? Number(form.product_discount_price)
          : null,
        stock_quantity: Number(form.stock_quantity),
        is_in_stock: form.is_in_stock,
        is_active: form.is_active,
        brand: form.brand || undefined,
        model: form.model || undefined,
        seo_title: form.seo_title || undefined,
        seo_description: form.seo_description || undefined,
        tags: form.tags,
        product_videos: form.product_videos,
      });
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

  if (loading) {
    return (
      <SellerLayout activeNav="products" pageTitle="Edit Product">
        <div className="p-7 max-w-2xl mx-auto space-y-5">
          {[180, 120, 90, 120, 60].map((h, i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse bg-slate-100"
              style={{ height: h }}
            />
          ))}
        </div>
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
                <FiAlertCircle
                  size={16}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-amber-800 text-sm font-black">
                    Pending Re-Review
                  </p>
                  <p className="text-amber-700 text-xs font-medium mt-0.5">
                    You've changed a critical field (price, condition, images,
                    or description). Saving will reset the product to{" "}
                    <strong>pending review</strong> until an admin re-approves.
                  </p>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
                <FiAlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-700 text-sm font-semibold">{apiError}</p>
              </div>
            )}

            {/* ── Section: Basics ─────────────────────────────────────────── */}
            <Section title="Basic Info" icon="📋">
              <Field
                label="Product Name"
                required
                error={errors.product_name}
              >
                <input
                  className={inputCls}
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
              >
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={5}
                  value={form.product_description}
                  onChange={(e) =>
                    handleChange("product_description", e.target.value)
                  }
                  maxLength={2000}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {form.product_description.length}/2000
                </p>
              </Field>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Brand">
                  <input
                    className={inputCls}
                    value={form.brand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Model">
                  <input
                    className={inputCls}
                    value={form.model}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, model: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </Section>

            {/* ── Section: Condition ───────────────────────────────────────── */}
            <Section title="Condition" icon="✨">
              <Field
                label="Item Condition"
                required
                error={errors.product_condition}
              >
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
            </Section>

            {/* ── Section: Pricing ─────────────────────────────────────────── */}
            <Section title="Pricing & Stock" icon="💰">
              <div className="grid grid-cols-2 gap-5">
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
                      value={form.product_original_price}
                      onChange={(e) =>
                        handleChange("product_original_price", e.target.value)
                      }
                    />
                  </div>
                </Field>

                <Field label="Stock Qty" required hint="0 = out of stock">
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock_quantity: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              {/* Sale */}
              <div
                className="rounded-2xl border p-4 transition"
                style={{
                  background: form.is_on_sale ? "#FFF7ED" : "#F8FAFC",
                  borderColor: form.is_on_sale ? "#FED7AA" : "#E2E8F0",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-800">On Sale</p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, is_on_sale: !f.is_on_sale }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.is_on_sale ? "bg-orange-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        form.is_on_sale ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
                {form.is_on_sale && (
                  <Field
                    label="Sale Price (₦)"
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
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: "is_active" as keyof EditForm,
                    label: "Active Listing",
                    desc: "Visible on marketplace",
                  },
                  {
                    key: "is_in_stock" as keyof EditForm,
                    label: "In Stock",
                    desc: "Available for purchase",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, [key]: !f[key] }))
                      }
                      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                        form[key] ? "bg-orange-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          form[key] ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Section: Images ──────────────────────────────────────────── */}
            <Section title="Product Images" icon="🖼️">
              <div className="flex gap-2 mb-4">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Paste image URL"
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
              {form.product_images.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <FiImage size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">
                    No images — paste a URL above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {form.product_images.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`img-${i}`}
                        className="w-full h-full object-cover rounded-xl border border-slate-200"
                        onError={(e) =>
                          (
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23F1F5F9'/%3E%3C/svg%3E"
                          )
                        }
                      />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-md">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            "product_images",
                            form.product_images.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Section: Tags & SEO ──────────────────────────────────────── */}
            <Section title="Tags & SEO" icon="🏷️">
              {/* Tags */}
              <Field label="Tags">
                <div className="flex gap-2 mb-3">
                  <input
                    className={`${inputCls} flex-1`}
                    placeholder="Add tag"
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
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              tags: f.tags.filter((t) => t !== tag),
                            }))
                          }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seo_title: e.target.value }))
                  }
                  maxLength={120}
                />
              </Field>

              <Field label="SEO Description">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.seo_description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      seo_description: e.target.value,
                    }))
                  }
                  maxLength={160}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {form.seo_description.length}/160
                </p>
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
                    <FiRefreshCw size={14} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <FiSave size={14} /> Save Changes
                  </>
                )}
              </button>
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
    <div
      className="flex items-center gap-3 px-6 py-4"
      style={{ borderBottom: "1px solid #F8FAFC" }}
    >
      <span className="text-xl">{icon}</span>
      <p className="font-black text-slate-900">{title}</p>
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

export default EditProductPage;