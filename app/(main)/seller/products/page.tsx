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
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock,
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
  approval_state?: string;
  status?: string;
  rejection_reason?: string | null;
  product_images: string[];
  average_rating: number;
  review_count: number;
  view_count: number;
  sold_count: number;
  subcategory_name: string;
  brand?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

type ApprovalFilter = "all" | "approved" | "pending" | "rejected";
type ActiveFilter = "all" | "active" | "inactive";

// ─── Helper function to get approval status ───────────────────────────────────

const getApprovalStatus = (product: Product): string => {
  if (!product.is_active) {
    return "inactive";
  }
  
  if (product.rejection_reason) {
    return "rejected";
  }
  
  const status = product.approval_status || product.approval_state || product.status;
  
  if (status === "pending" || status === "Pending") {
    return "pending";
  }
  
  if (status === "approved" || status === "Approved") {
    return "approved";
  }
  
  if (status === "rejected" || status === "Rejected") {
    return "rejected";
  }
  
  if (product.reviewed_at && !product.is_approved) {
    return "pending";
  }
  
  const updatedAt = new Date(product.updated_at);
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate < 1 && !product.reviewed_at) {
    return "pending";
  }
  
  if (product.is_approved === false) {
    return "pending";
  }
  
  if (product.is_approved === true) {
    return "approved";
  }
  
  return "pending";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ApprovalBadge = ({ product }: { product: Product }) => {
  const approvalStatus = getApprovalStatus(product);
  
  if (approvalStatus === "inactive") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
        Inactive
      </span>
    );
  }
  
  if (approvalStatus === "pending") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
        Pending Review
      </span>
    );
  }
  
  if (approvalStatus === "rejected") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
        Rejected
      </span>
    );
  }
  
  if (approvalStatus === "approved") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        Approved
      </span>
    );
  }
  
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
      Unknown
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
      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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

  useEffect(() => {
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

  const getStats = () => {
    const total = pagination.total;
    const active = products.filter((p) => p.is_active).length;
    const approved = products.filter((p) => getApprovalStatus(p) === "approved" && p.is_active).length;
    const pending = products.filter((p) => getApprovalStatus(p) === "pending" && p.is_active).length;
    const rejected = products.filter((p) => getApprovalStatus(p) === "rejected" && p.is_active).length;
    return { total, active, approved, pending, rejected };
  };

  const stats = getStats();

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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
              boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
            }}
          >
            <FiPlus size={15} />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        }
      >
        <div className="p-4 sm:p-5 md:p-7 space-y-5 sm:space-y-6">
          {/* Luxurious Hero Banner */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
              minHeight: 120,
            }}
          >
            <div
              className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, #B42225 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8">
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                  Product Inventory
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  Manage and monitor all your product listings
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Total Products
                  </p>
                  <p className="text-white font-black text-xl mt-0.5">
                    {pagination.total}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    Active
                  </p>
                  <p className="text-white font-black text-xl mt-0.5">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Total Listed",
                value: stats.total,
                color: "#6366F1",
                bg: "#EEF2FF",
                icon: <MdOutlineInventory2 size={16} />,
              },
              {
                label: "Active",
                value: stats.active,
                color: "#10B981",
                bg: "#F0FDF4",
                icon: <FiCheckCircle size={16} />,
              },
              {
                label: "Approved",
                value: stats.approved,
                color: "#F97316",
                bg: "#FFF7ED",
                icon: <FiCheckCircle size={16} />,
              },
              {
                label: "Pending Review",
                value: stats.pending,
                color: "#F59E0B",
                bg: "#FFFBEB",
                icon: <FiClock size={16} />,
              },
            ].map(({ label, value, color, bg, icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 border border-slate-100/80 transition-all duration-300 hover:shadow-lg"
                style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: bg }}
                >
                  <span style={{ color }}>{icon}</span>
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

          {/* Info Banner */}
          {stats.pending > 0 && (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/50">
              <FiAlertCircle size={16} className="text-amber-600 shrink-0" />
              <p className="text-amber-700 text-xs font-medium flex-1">
                <strong>{stats.pending} product{stats.pending !== 1 ? 's are' : ' is'} pending review.</strong> Your recent changes are being reviewed by our admin team.
              </p>
            </div>
          )}

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

          {/* Filters & Search - Redesigned */}
          <div
            className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5"
            style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
          >
            <div className="flex flex-col gap-4">
              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder-slate-400"
                    placeholder="Search by name, brand, or category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition ${
                        viewMode === "list"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <FiList size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition ${
                        viewMode === "grid"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <FiGrid size={16} />
                    </button>
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
              </div>

              {/* Approval tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {filterTabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setApprovalFilter(key)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                      approvalFilter === key
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products - Grid View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                    <div className="w-full h-48 rounded-xl bg-slate-100 mb-4" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-4 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))
              ) : displayed.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <FiPackage size={24} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-600">No products found</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {search ? "Try a different search term" : "List your first product to start selling"}
                  </p>
                  {!search && (
                    <button
                      onClick={() => router.push("/seller/add-product")}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-2xl"
                      style={{
                        background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
                        boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
                      }}
                    >
                      <FiPlus size={14} /> Add Product
                    </button>
                  )}
                </div>
              ) : (
                displayed.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
                  >
                    <div className="relative w-full h-48 bg-slate-50">
                      {product.product_images?.[0] ? (
                        <Image
                          src={product.product_images[0]}
                          alt={product.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage size={32} className="text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <ApprovalBadge product={product} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {product.product_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {product.subcategory_name}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-lg font-black text-slate-900">
                            {fmtCurrency(product.current_price)}
                          </p>
                          {product.is_on_sale && product.product_discount_price && (
                            <p className="text-[10px] text-slate-400 line-through">
                              {fmtCurrency(product.product_original_price)}
                            </p>
                          )}
                        </div>
                        <ConditionBadge condition={product.product_condition} />
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${product.is_in_stock ? "bg-emerald-500" : "bg-red-400"}`} />
                          <span className="text-xs font-medium text-slate-600">
                            {product.stock_quantity} in stock
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {product.sold_count} sold
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <FiEdit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                            product.is_active
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {product.is_active ? <FiToggleRight size={13} /> : <FiToggleLeft size={13} />}
                          {product.is_active ? "Hide" : "Publish"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* List View - Responsive Table */
            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-50">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="px-4 py-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-100" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : displayed.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      <FiPackage size={24} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">No products found</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {search ? "Try a different search term" : "List your first product to start selling"}
                    </p>
                  </div>
                ) : (
                  displayed.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-4 hover:bg-orange-50/30 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0">
                          {product.product_images?.[0] ? (
                            <Image
                              src={product.product_images[0]}
                              alt={product.product_name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage size={20} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.subcategory_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-black text-slate-900">
                              {fmtCurrency(product.current_price)}
                            </p>
                            <ApprovalBadge product={product} />
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500">
                              Stock: {product.stock_quantity}
                            </span>
                            <span className="text-xs text-slate-500">
                              {product.sold_count} sold
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(product)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                product.is_active
                                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                            >
                              {product.is_active ? "Hide" : "Publish"}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
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
                              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-2xl"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
                                boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
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
                          {/* Product */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
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
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4"
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
                                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
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
          )}
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
          style={{ background: "linear-gradient(145deg, #0F0A1A, #1A0F1F)" }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerProductsPage;