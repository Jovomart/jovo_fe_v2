"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "@/services/apiService";
import SellerLayout, { fmtCurrency } from "@/components/layout/SellerLayout";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiCheck,
  FiMinus,
  FiX,
  FiEdit2,
} from "react-icons/fi";
import { HiWallet } from "react-icons/hi2";
import { MdOutlineSwapHoriz } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletSummary {
  balance?: number;
  available_balance?: number;
  pending_balance?: number;
  total_earned?: number;
  total_withdrawn?: number;
  currency?: string;
  recent_transactions?: Transaction[];
}

interface Transaction {
  id: string;
  type: "credit" | "debit" | "withdrawal" | string;
  amount: number;
  description?: string;
  reference?: string;
  status?: string;
  created_at: string;
  balance_after?: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "completed" | "rejected" | string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code?: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const txConfig = (type: string) => {
  const t = type?.toLowerCase();
  if (t === "credit")
    return {
      label: "Credit",
      icon: <FiArrowDownLeft size={14} />,
      color: "#059669",
      bg: "#F0FDF4",
      sign: "+",
    };
  if (t === "withdrawal")
    return {
      label: "Withdrawal",
      icon: <FiArrowUpRight size={14} />,
      color: "#DC2626",
      bg: "#FEF2F2",
      sign: "-",
    };
  if (t === "debit")
    return {
      label: "Debit",
      icon: <FiMinus size={14} />,
      color: "#D97706",
      bg: "#FFFBEB",
      sign: "-",
    };
  return {
    label: type || "Transaction",
    icon: <MdOutlineSwapHoriz size={14} />,
    color: "#6366F1",
    bg: "#EEF2FF",
    sign: "",
  };
};

const statusIcon = (status?: string) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "success")
    return <FiCheck size={11} className="text-emerald-500" />;
  if (s === "pending") return <FiClock size={11} className="text-amber-500" />;
  if (s === "failed" || s === "rejected")
    return <FiAlertCircle size={11} className="text-red-500" />;
  return null;
};

const withdrawalStatusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  completed: {
    label: "Completed",
    color: "#059669",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  rejected: {
    label: "Rejected",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};

// ─── Mini Sparkbar ────────────────────────────────────────────────────────────

const Sparkbars = ({ transactions }: { transactions: Transaction[] }) => {
  const credits = transactions
    .filter((t) => t.type === "credit")
    .slice(0, 12)
    .reverse();
  if (credits.length < 2) return null;
  const max = Math.max(...credits.map((t) => t.amount), 1);
  return (
    <div className="flex items-end gap-1 h-8">
      {credits.map((t, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-500"
          style={{
            height: `${Math.max((t.amount / max) * 100, 8)}%`,
            background:
              i === credits.length - 1
                ? "#F97316"
                : "rgba(249,115,22,0.25)",
          }}
        />
      ))}
    </div>
  );
};

// ─── Withdrawal Modal ─────────────────────────────────────────────────────────

interface WithdrawalModalProps {
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
  editWithdrawal?: Withdrawal | null;
}

const WithdrawalModal = ({
  availableBalance,
  onClose,
  onSuccess,
  editWithdrawal,
}: WithdrawalModalProps) => {
  const [form, setForm] = useState({
    amount: editWithdrawal?.amount?.toString() ?? "",
    bank_name: editWithdrawal?.bank_name ?? "",
    account_number: editWithdrawal?.account_number ?? "",
    account_name: editWithdrawal?.account_name ?? "",
    bank_code: editWithdrawal?.bank_code ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editWithdrawal;

  const handleSubmit = async () => {
    setError("");
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!isEdit && amount > availableBalance) {
      setError("Amount exceeds available balance.");
      return;
    }
    if (!form.bank_name.trim()) {
      setError("Bank name is required.");
      return;
    }
    if (!form.account_number.trim()) {
      setError("Account number is required.");
      return;
    }
    if (!form.account_name.trim()) {
      setError("Account name is required.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await apiService.updateWithdrawalRequest(editWithdrawal!.id, {
          amount,
          bank_name: form.bank_name.trim(),
          account_number: form.account_number.trim(),
          account_name: form.account_name.trim(),
          bank_code: form.bank_code.trim() || undefined,
        });
      } else {
        await apiService.submitWithdrawalRequest({
          amount,
          bank_name: form.bank_name.trim(),
          account_number: form.account_number.trim(),
          account_name: form.account_name.trim(),
          bank_code: form.bank_code.trim(),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Failed to submit withdrawal request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEdit ? "Edit Withdrawal" : "Request Withdrawal"}
            </h2>
            {!isEdit && (
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Available: {fmtCurrency(availableBalance)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-500"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <FiAlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Amount (₦)
            </label>
            <input
              type="number"
              min="1"
              max={!isEdit ? availableBalance : undefined}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-semibold outline-none focus:border-orange-400 transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Bank Name
            </label>
            <input
              type="text"
              value={form.bank_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, bank_name: e.target.value }))
              }
              placeholder="e.g. First Bank Nigeria"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={form.account_number}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    account_number: e.target.value,
                  }))
                }
                placeholder="0123456789"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Bank Code
              </label>
              <input
                type="text"
                value={form.bank_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bank_code: e.target.value }))
                }
                placeholder="011"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              value={form.account_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, account_name: e.target.value }))
              }
              placeholder="Full account holder name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg,#F97316,#EA580C)",
              boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
            }}
          >
            {loading
              ? "Processing…"
              : isEdit
              ? "Update Request"
              : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerWalletPage = () => {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">(
    "transactions"
  );
  const [skip, setSkip] = useState(0);
  const LIMIT = 20;
  const [total, setTotal] = useState(0);
  const [withdrawalTotal, setWithdrawalTotal] = useState(0);
  const [withdrawalSkip, setWithdrawalSkip] = useState(0);
  const [withdrawalFilter, setWithdrawalFilter] = useState<
    "all" | "pending" | "completed" | "rejected"
  >("all");

  // Modal state
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [editWithdrawal, setEditWithdrawal] = useState<Withdrawal | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // Refs to track if data has been fetched
  const walletFetchedRef = useRef(false);
  const txFetchedRef = useRef(false);
  const withdrawalsFetchedRef = useRef(false);
  const prevFilterRef = useRef(withdrawalFilter);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true);
    setError("");
    try {
      const res = await apiService.getSellerWallet();
      const body = res?.data ?? res;
      setWallet(body);
    } catch (err: any) {
      setError(err.message ?? "Failed to load wallet.");
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (newSkip = 0) => {
    setLoadingTx(true);
    try {
      const res = await apiService.getSellerWalletTransactions({
        skip: newSkip,
        limit: LIMIT,
      });
      const body = res?.data ?? res;
      const list: Transaction[] =
        body?.transactions ??
        body?.items ??
        (Array.isArray(body) ? body : []);
      setTransactions(list);
      setTotal(body?.total ?? list.length);
      setSkip(newSkip);
    } catch {
      // silently handle
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(
    async (newSkip = 0) => {
      setLoadingWithdrawals(true);
      try {
        const res = await apiService.getSellerWithdrawals({
          status_filter:
            withdrawalFilter === "all" ? null : withdrawalFilter,
          skip: newSkip,
          limit: LIMIT,
        });
        const body = res?.data ?? res;
        const list: Withdrawal[] =
          body?.withdrawals ??
          body?.items ??
          (Array.isArray(body) ? body : []);
        setWithdrawals(list);
        setWithdrawalTotal(body?.total ?? list.length);
        setWithdrawalSkip(newSkip);
      } catch {
        // silently handle
      } finally {
        setLoadingWithdrawals(false);
      }
    },
    [withdrawalFilter]
  );

  // Initial data fetching effects
  useEffect(() => {
    if (!walletFetchedRef.current) {
      walletFetchedRef.current = true;
      fetchWallet();
    }
  }, [fetchWallet]);

  useEffect(() => {
    if (!txFetchedRef.current) {
      txFetchedRef.current = true;
      fetchTransactions(0);
    }
  }, [fetchTransactions]);

  // Withdrawals effect - fetches when tab becomes active
  useEffect(() => {
    if (activeTab === "withdrawals" && !withdrawalsFetchedRef.current) {
      withdrawalsFetchedRef.current = true;
      fetchWithdrawals(0);
    }
  }, [activeTab, fetchWithdrawals]);

  // Reset and refetch when filter changes
  useEffect(() => {
    if (activeTab === "withdrawals" && prevFilterRef.current !== withdrawalFilter) {
      prevFilterRef.current = withdrawalFilter;
      withdrawalsFetchedRef.current = false;
      fetchWithdrawals(0);
    }
  }, [withdrawalFilter, activeTab, fetchWithdrawals]);

  const currentPage = Math.floor(skip / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT);
  const withdrawalCurrentPage = Math.floor(withdrawalSkip / LIMIT) + 1;
  const withdrawalTotalPages = Math.ceil(withdrawalTotal / LIMIT);

  const balance = Number(wallet?.balance ?? wallet?.available_balance ?? 0);
  const pendingBalance = Number(wallet?.pending_balance ?? 0);
  const totalEarned = Number(wallet?.total_earned ?? balance);
  const totalWithdrawn = Number(wallet?.total_withdrawn ?? 0);

  const allTransactions =
    transactions.length > 0
      ? transactions
      : wallet?.recent_transactions ?? [];

  const handleWithdrawalSuccess = () => {
    setShowWithdrawalModal(false);
    setEditWithdrawal(null);
    showToast(
      editWithdrawal
        ? "Withdrawal request updated."
        : "Withdrawal request submitted successfully."
    );
    fetchWallet();
    withdrawalsFetchedRef.current = false;
    fetchWithdrawals(0);
  };

  return (
    <>
      <SellerLayout
        activeNav="wallet"
        onRefresh={() => {
          fetchWallet();
          fetchTransactions(0);
        }}
        isLoading={loadingWallet}
        pageTitle="Wallet"
      >
        <div className="p-5 md:p-7 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
              <FiAlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-semibold flex-1">
                {error}
              </p>
              <button
                onClick={fetchWallet}
                className="text-xs font-bold text-red-600 flex items-center gap-1"
              >
                <FiRefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* Wallet Hero */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#0F172A 0%,#1C1917 60%,#1C0A00 100%)",
              minHeight: 180,
            }}
          >
            <div
              className="absolute -left-20 -top-20 w-72 h-72 rounded-full"
              style={{
                background:
                  "radial-gradient(circle,rgba(249,115,22,0.3) 0%,transparent 70%)",
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-60 h-60 rounded-full"
              style={{
                background:
                  "radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="relative z-10 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(249,115,22,0.2)" }}
                  >
                    <HiWallet size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold">
                      Available Balance
                    </p>
                    <p className="text-white text-3xl font-black leading-none mt-0.5">
                      {loadingWallet ? "…" : fmtCurrency(balance)}
                    </p>
                  </div>
                </div>
                {pendingBalance > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <FiClock size={12} className="text-amber-400" />
                    <span className="text-amber-300 text-xs font-semibold">
                      {fmtCurrency(pendingBalance)} pending clearance
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={balance <= 0 || loadingWallet}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg,#F97316,#EA580C)",
                    boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                  }}
                >
                  <FiArrowUpRight size={14} /> Withdraw Funds
                </button>
              </div>

              {allTransactions.length > 1 && (
                <div className="w-full sm:w-48">
                  <Sparkbars transactions={allTransactions} />
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                    Recent credits
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Earned",
                value: totalEarned,
                icon: <FiTrendingUp size={17} />,
                color: "#059669",
                bg: "#F0FDF4",
              },
              {
                label: "Available",
                value: balance,
                icon: <HiWallet size={17} />,
                color: "#F97316",
                bg: "#FFF7ED",
              },
              {
                label: "Withdrawn",
                value: totalWithdrawn,
                icon: <FiArrowUpRight size={17} />,
                color: "#6366F1",
                bg: "#EEF2FF",
              },
            ].map(({ label, value, icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 border border-slate-100"
                style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>
                <p className="text-xl font-black text-slate-900">
                  {loadingWallet ? "—" : fmtCurrency(value)}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
            {(["transactions", "withdrawals"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition capitalize ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transaction Ledger */}
          {activeTab === "transactions" && (
            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div>
                  <p className="font-black text-slate-900">
                    Transaction History
                  </p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    {total} total transactions
                  </p>
                </div>
                <button
                  onClick={() => fetchTransactions(skip)}
                  className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500"
                >
                  <FiRefreshCw
                    size={14}
                    className={loadingTx ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Table Header */}
              <div
                className="grid grid-cols-5 gap-3 px-6 py-3"
                style={{ background: "#F8FAFC" }}
              >
                {["Type", "Description", "Amount", "Balance After", "Date"].map(
                  (h) => (
                    <p
                      key={h}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </p>
                  )
                )}
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {loadingTx ? (
                  [...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 gap-3 px-6 py-4"
                    >
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="h-3 rounded bg-slate-100 animate-pulse"
                        />
                      ))}
                    </div>
                  ))
                ) : allTransactions.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      <FiDollarSign size={22} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">
                      No transactions yet
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Transactions will appear here once orders are fulfilled
                    </p>
                  </div>
                ) : (
                  allTransactions.map((tx, i) => {
                    const cfg = txConfig(tx.type);
                    return (
                      <div
                        key={tx.id ?? i}
                        className="grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                            }}
                          >
                            {cfg.icon}
                          </div>
                          <span
                            className="text-[11px] font-bold hidden sm:block"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {tx.description || "—"}
                          </p>
                          {tx.reference && (
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              Ref: {tx.reference}
                            </p>
                          )}
                        </div>

                        <p
                          className="text-sm font-black"
                          style={{ color: cfg.color }}
                        >
                          {cfg.sign}
                          {fmtCurrency(Number(tx.amount))}
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {tx.balance_after != null
                            ? fmtCurrency(Number(tx.balance_after))
                            : "—"}
                        </p>

                        <div className="flex items-center gap-1.5">
                          {statusIcon(tx.status)}
                          <p className="text-[10px] text-slate-400 font-medium">
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleDateString(
                                  "en-NG",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {!loadingTx && totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderTop: "1px solid #F8FAFC" }}
                >
                  <p className="text-xs text-slate-400 font-medium">
                    Showing {skip + 1}–{Math.min(skip + LIMIT, total)} of{" "}
                    {total}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        fetchTransactions(Math.max(0, skip - LIMIT))
                      }
                      disabled={skip === 0}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
                    >
                      <FiChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => fetchTransactions(skip + LIMIT)}
                      disabled={skip + LIMIT >= total}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
                    >
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div>
                  <p className="font-black text-slate-900">
                    Withdrawal Requests
                  </p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    {withdrawalTotal} total requests
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Filter */}
                  <select
                    value={withdrawalFilter}
                    onChange={(e) =>
                      setWithdrawalFilter(
                        e.target.value as typeof withdrawalFilter
                      )
                    }
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 outline-none bg-white"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => {
                      withdrawalsFetchedRef.current = false;
                      fetchWithdrawals(withdrawalSkip);
                    }}
                    className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500"
                  >
                    <FiRefreshCw
                      size={14}
                      className={loadingWithdrawals ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div
                className="grid grid-cols-5 gap-3 px-6 py-3"
                style={{ background: "#F8FAFC" }}
              >
                {["Amount", "Bank Details", "Status", "Date", "Action"].map(
                  (h) => (
                    <p
                      key={h}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </p>
                  )
                )}
              </div>

              <div className="divide-y divide-slate-50">
                {loadingWithdrawals ? (
                  [...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 gap-3 px-6 py-4"
                    >
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="h-3 rounded bg-slate-100 animate-pulse"
                        />
                      ))}
                    </div>
                  ))
                ) : withdrawals.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      <FiArrowUpRight size={22} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-600">
                      No withdrawal requests
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Your withdrawal requests will appear here
                    </p>
                  </div>
                ) : (
                  withdrawals.map((wd) => {
                    const cfg =
                      withdrawalStatusConfig[wd.status?.toLowerCase()] ??
                      withdrawalStatusConfig.pending;
                    const isPending =
                      wd.status?.toLowerCase() === "pending";
                    return (
                      <div
                        key={wd.id}
                        className="grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
                      >
                        <p className="text-sm font-black text-slate-900">
                          {fmtCurrency(Number(wd.amount))}
                        </p>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {wd.bank_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {wd.account_number} · {wd.account_name}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border w-fit"
                          style={{
                            color: cfg.color,
                            background: cfg.bg,
                            borderColor: cfg.border,
                          }}
                        >
                          {statusIcon(wd.status)}
                          {cfg.label}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {wd.created_at
                            ? new Date(wd.created_at).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </p>
                        <div>
                          {isPending && (
                            <button
                              onClick={() => {
                                setEditWithdrawal(wd);
                                setShowWithdrawalModal(true);
                              }}
                              className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-700 transition"
                            >
                              <FiEdit2 size={11} /> Edit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Withdrawals Pagination */}
              {!loadingWithdrawals && withdrawalTotalPages > 1 && (
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderTop: "1px solid #F8FAFC" }}
                >
                  <p className="text-xs text-slate-400 font-medium">
                    Showing {withdrawalSkip + 1}–
                    {Math.min(withdrawalSkip + LIMIT, withdrawalTotal)} of{" "}
                    {withdrawalTotal}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        fetchWithdrawals(
                          Math.max(0, withdrawalSkip - LIMIT)
                        )
                      }
                      disabled={withdrawalSkip === 0}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
                    >
                      <FiChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-2">
                      {withdrawalCurrentPage} / {withdrawalTotalPages}
                    </span>
                    <button
                      onClick={() => {
                        fetchWithdrawals(withdrawalSkip + LIMIT);
                      }}
                      disabled={withdrawalSkip + LIMIT >= withdrawalTotal}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
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

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          availableBalance={balance}
          onClose={() => {
            setShowWithdrawalModal(false);
            setEditWithdrawal(null);
          }}
          onSuccess={handleWithdrawalSuccess}
          editWithdrawal={editWithdrawal}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl"
          style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}
        >
          <FiCheck size={15} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerWalletPage;