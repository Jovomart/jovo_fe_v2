"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
  FiRefreshCw,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  product_name: string;
  product_description: string;
  product_condition: string;
  product_original_price: number;
  product_discount_price: number | null;
  current_price: number;
  is_on_sale: boolean;
  stock_quantity: number;
  is_in_stock: boolean;
  is_active: boolean;
  is_approved: boolean;
  is_featured: boolean;
  approval_status?: string;
  rejection_reason?: string;
  product_images: string[];
  average_rating: number;
  review_count: number;
  view_count: number;
  sold_count: number;
  subcategory_name: string;
  brand?: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

type ApprovalFilter = "all" | "approved" | "pending" | "rejected";
type ActiveFilter = "all" | "active" | "inactive";

// ─── Sub-components ───────────────────────────────────────────────────────────

const ApprovalBadge = ({ product }: { product: Product }) => {
  if (!product.is_active) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
        Inactive
      </span>
    );
  }
  if (product.is_approved) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        Approved
      </span>
    );
  }
  if (product.rejection_reason) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
        Rejected
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
      Pending Review
    </span>
  );
};

const ConditionBadge = ({ condition }: { condition: string }) => {
  const map: Record<string, string> = {
    "Like New": "bg-emerald-50 text-emerald-700",
    Good: "bg-blue-50 text-blue-600",
    Fair: "bg-amber-50 text-amber-700",
    Poor: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        map[condition] ?? "bg-slate-50 text-slate-600"
      }`}
    >
      {condition}
    </span>
  );
};

const DeleteModal = ({
  product,
  onConfirm,
  onCancel,
  loading,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div
      className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
      style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <FiTrash2 size={20} className="text-red-500" />
      </div>
      <h3 className="text-slate-900 font-black text-lg mb-1">
        Remove Product?
      </h3>
      <p className="text-slate-500 text-sm mb-1">
        <span className="font-semibold text-slate-700">
          {product.product_name}
        </span>{" "}
        will be hidden from the marketplace.
      </p>
      <p className="text-slate-400 text-xs mb-6">
        This is a soft delete — the product is preserved for order history and
        can be re-published anytime.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60"
        >
          {loading ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerProductsPage = () => {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // FIX: Use ref to prevent multiple fetch calls
  const hasFetchedRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const params: any = { page, page_size: 20 };
        if (activeFilter === "active") params.is_active = true;
        if (activeFilter === "inactive") params.is_active = false;
        if (approvalFilter !== "all")
          params.approval_status = approvalFilter;

        const res = await apiService.getMyProducts(params);

        // API response: { status, message, data: { total, page, page_size, total_pages, products: [] } }
        const body = res?.data ?? res;
        const list: Product[] =
          body?.products ??
          body?.data?.products ??
          (Array.isArray(body) ? body : []);

        setProducts(list);
        setPagination({
          page: body?.page ?? page,
          page_size: body?.page_size ?? 20,
          total: body?.total ?? list.length,
          total_pages: body?.total_pages ?? 1,
        });
      } catch (err: any) {
        setError(err.message ?? "Failed to load products.");
      } finally {
        setLoading(false);
      }
    },
    [approvalFilter, activeFilter]
  );

  // FIX: Use ref to ensure fetchProducts is only called once on mount, but still respond to filter changes
  // We want it to run when filters change, but not on every render due to dependency
  // The useCallback already handles the dependencies on approvalFilter and activeFilter
  useEffect(() => {
    // Reset ref when any filter changes to allow re-fetch
    hasFetchedRef.current = false;
  }, [approvalFilter, activeFilter]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProducts(1);
    }
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiService.deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      showToast("Product removed from marketplace.");
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.message ?? "Failed to remove product.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await apiService.updateProduct(product.id, {
        is_active: !product.is_active,
      });
      showToast(
        product.is_active
          ? "Product hidden from marketplace."
          : "Product re-published to marketplace."
      );
      fetchProducts(pagination.page);
    } catch (err: any) {
      showToast(err.message ?? "Failed to update product.");
    }
  };

  // Client-side search filter
  const displayed = search.trim()
    ? products.filter((p) =>
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
        p.subcategory_name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const filterTabs: { key: ApprovalFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "approved", label: "Approved" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <>
      <SellerLayout
        activeNav="products"
        onRefresh={() => fetchProducts(1)}
        isLoading={loading}
        pageTitle="My Products"
        stats={{ totalProducts: pagination.total }}
        headerAction={
          <button
            onClick={() => router.push("/seller/add-product")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg,#F97316,#EA580C)",
              boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
            }}
          >
            <FiPlus size={15} />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        }
      >
        <div className="p-5 md:p-7 space-y-5">
          {/* Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Listed",
                value: pagination.total,
                color: "#6366F1",
                bg: "#EEF2FF",
              },
              {
                label: "Active",
                value: products.filter((p) => p.is_active).length,
                color: "#10B981",
                bg: "#F0FDF4",
              },
              {
                label: "Approved",
                value: products.filter((p) => p.is_approved && p.is_active)
                  .length,
                color: "#F97316",
                bg: "#FFF7ED",
              },
              {
                label: "Pending Review",
                value: products.filter(
                  (p) => !p.is_approved && !p.rejection_reason && p.is_active
                ).length,
                color: "#F59E0B",
                bg: "#FFFBEB",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 border border-slate-100"
                style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: bg }}
                >
                  <MdOutlineInventory2 size={16} style={{ color }} />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "—" : value}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
              <FiAlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-semibold flex-1">
                {error}
              </p>
              <button
                onClick={() => fetchProducts(1)}
                className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <FiRefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* Filters & Search */}
          <div
            className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-1">
                <FiSearch size={14} className="text-slate-400 shrink-0" />
                <input
                  className="bg-transparent text-sm text-slate-700 outline-none flex-1 placeholder-slate-400"
                  placeholder="Search by name, brand, category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Active filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "inactive", label: "Inactive" },
                  ] as { key: ActiveFilter; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeFilter === key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Approval tabs */}
            <div className="flex items-center gap-1 mt-3">
              {filterTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setApprovalFilter(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    approvalFilter === key
                      ? "bg-orange-500 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {[
                      "Product",
                      "Category",
                      "Price",
                      "Stock",
                      "Condition",
                      "Status",
                      "Sales",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-5 py-3.5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(8)].map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-3 rounded bg-slate-100 animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                          <FiPackage size={24} className="text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-600">
                          No products found
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          {search
                            ? "Try a different search term"
                            : "List your first product to start selling"}
                        </p>
                        {!search && (
                          <button
                            onClick={() =>
                              router.push("/seller/add-product")
                            }
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg,#F97316,#EA580C)",
                            }}
                          >
                            <FiPlus size={14} /> Add Product
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    displayed.map((product) => (
                      <tr
                        key={product.id}
                        className="group hover:bg-orange-50/20 transition-colors"
                      >
                        {/* Product - FIX: Replace img with Image */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                              {product.product_images?.[0] ? (
                                <Image
                                  src={product.product_images[0]}
                                  alt={product.product_name}
                                  width={44}
                                  height={44}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FiPackage
                                  size={18}
                                  className="text-slate-300"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate max-w-[160px]">
                                {product.product_name}
                              </p>
                              {product.brand && (
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {product.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-500 font-medium">
                            {product.subcategory_name || "—"}
                          </p>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {fmtCurrency(product.current_price)}
                            </p>
                            {product.is_on_sale &&
                              product.product_discount_price && (
                                <p className="text-[10px] text-slate-400 line-through">
                                  {fmtCurrency(product.product_original_price)}
                                </p>
                              )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.is_in_stock
                                  ? "bg-emerald-500"
                                  : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                product.is_in_stock
                                  ? "text-slate-700"
                                  : "text-red-500"
                              }`}
                            >
                              {product.stock_quantity}
                            </span>
                          </div>
                        </td>

                        {/* Condition */}
                        <td className="px-5 py-4">
                          <ConditionBadge
                            condition={product.product_condition}
                          />
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <ApprovalBadge product={product} />
                        </td>

                        {/* Sales */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {product.sold_count} sold
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {product.view_count} views
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                router.push(
                                  `/seller/products/${product.id}/edit`
                                )
                              }
                              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                              title="Edit product"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(product)}
                              className={`p-2 rounded-lg transition ${
                                product.is_active
                                  ? "bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                              title={
                                product.is_active
                                  ? "Hide product"
                                  : "Re-publish product"
                              }
                            >
                              {product.is_active ? (
                                <FiToggleRight size={13} />
                              ) : (
                                <FiToggleLeft size={13} />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                              title="Remove product"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && pagination.total_pages > 1 && (
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderTop: "1px solid #F8FAFC" }}
              >
                <p className="text-xs text-slate-400 font-medium">
                  Showing {(pagination.page - 1) * pagination.page_size + 1}–
                  {Math.min(
                    pagination.page * pagination.page_size,
                    pagination.total
                  )}{" "}
                  of {pagination.total} products
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fetchProducts(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={14} />
                  </button>
                  {[...Array(pagination.total_pages)].map((_, i) => {
                    const p = i + 1;
                    if (
                      p === 1 ||
                      p === pagination.total_pages ||
                      Math.abs(p - pagination.page) <= 1
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => fetchProducts(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            p === pagination.page
                              ? "bg-orange-500 text-white"
                              : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (Math.abs(p - pagination.page) === 2) {
                      return (
                        <span key={p} className="text-slate-400 text-xs">
                          …
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => fetchProducts(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SellerLayout>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl"
          style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerProductsPage;