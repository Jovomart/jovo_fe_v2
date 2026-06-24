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
  FiShield,
  FiLock,
  FiCreditCard,
  FiSend,
  FiBriefcase,
} from "react-icons/fi";
import { HiWallet } from "react-icons/hi2";
import { MdOutlineSwapHoriz, MdOutlinePending } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  seller_order_id?: string;
  transaction_type: string;
  amount: number;
  description: string;
  reference: string;
  flow: string;
  indicator: string;
  created_at: string;
}

interface WalletData {
  id: string;
  seller_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  pending_withdrawal_balance: number;
  pending_withdrawals_count: number;
  total_transactions_count: number;
  total_credits_count: number;
  total_debits_count: number;
  withdrawal_success_rate_percent: number;
  recent_transactions: Transaction[];
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

// ─── Transaction Config ──────────────────────────────────────────────────────

const txConfig = (type: string, flow?: string) => {
  const t = type?.toLowerCase();
  const isPending = t === "pending_credit";
  
  if (isPending) {
    return {
      label: "Pending Credit",
      icon: <FiClock size={14} />,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      sign: "+",
      description: "Escrow Hold",
    };
  }
  
  if (t === "credit" || flow === "in") {
    return {
      label: "Credit",
      icon: <FiArrowDownLeft size={14} />,
      color: "#059669",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      sign: "+",
      description: "Credit",
    };
  }
  
  if (t === "withdrawal" || t === "debit" || flow === "out") {
    return {
      label: "Debit",
      icon: <FiArrowUpRight size={14} />,
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      sign: "-",
      description: "Withdrawal",
    };
  }
  
  return {
    label: type || "Transaction",
    icon: <MdOutlineSwapHoriz size={14} />,
    color: "#6366F1",
    bg: "#EEF2FF",
    border: "#DDD6FE",
    sign: "",
    description: "Transaction",
  };
};

const statusIcon = (type?: string) => {
  const t = type?.toLowerCase();
  if (t === "completed" || t === "success") {
    return <FiCheck size={11} className="text-emerald-500" />;
  }
  if (t === "pending" || t === "pending_credit") {
    return <FiClock size={11} className="text-amber-500" />;
  }
  if (t === "failed" || t === "rejected") {
    return <FiAlertCircle size={11} className="text-red-500" />;
  }
  return null;
};

const withdrawalStatusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: <FiClock size={12} />,
  },
  completed: {
    label: "Completed",
    color: "#059669",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: <FiCheck size={12} />,
  },
  rejected: {
    label: "Rejected",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <FiX size={12} />,
  },
};

// ─── Mini Sparkbar ──────────────────────────────────────────────────────────

const Sparkbars = ({ transactions }: { transactions: Transaction[] }) => {
  const credits = transactions
    .filter((t) => t.transaction_type === "pending_credit")
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

// ─── Mini Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon,
  color,
  bg,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  subtitle?: string;
}) => (
  <div
    className="bg-white rounded-2xl p-5 border border-slate-100/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
    </div>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
      {label}
    </p>
    {subtitle && (
      <p className="text-[10px] text-slate-400 font-medium mt-1">{subtitle}</p>
    )}
  </div>
);

// ─── Withdrawal Modal ────────────────────────────────────────────────────────

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
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {isEdit ? "Edit Withdrawal" : "Request Withdrawal"}
              </h2>
              {!isEdit && (
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Available Balance: {fmtCurrency(availableBalance)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
            >
              <FiX size={18} />
            </button>
          </div>
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
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Amount (₦)
            </label>
            <input
              type="number"
              min="1"
              max={!isEdit ? availableBalance : undefined}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Bank Name
            </label>
            <input
              type="text"
              value={form.bank_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, bank_name: e.target.value }))
              }
              placeholder="e.g. First Bank Nigeria"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                Bank Code
              </label>
              <input
                type="text"
                value={form.bank_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bank_code: e.target.value }))
                }
                placeholder="011"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              value={form.account_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, account_name: e.target.value }))
              }
              placeholder="Full account holder name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
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
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#F97316,#EA580C)",
              boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
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

// ─── Main Component ──────────────────────────────────────────────────────────

const SellerWalletPage = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
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

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [editWithdrawal, setEditWithdrawal] = useState<Withdrawal | null>(null);
  const [toastMsg, setToastMsg] = useState("");

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

  useEffect(() => {
    if (activeTab === "withdrawals" && !withdrawalsFetchedRef.current) {
      withdrawalsFetchedRef.current = true;
      fetchWithdrawals(0);
    }
  }, [activeTab, fetchWithdrawals]);

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

  const balance = Number(wallet?.available_balance ?? 0);
  const pendingBalance = Number(wallet?.pending_balance ?? 0);
  const totalEarned = Number(wallet?.total_earned ?? 0);
  const totalWithdrawn = Number(wallet?.total_withdrawn ?? 0);
  const pendingWithdrawals = Number(wallet?.pending_withdrawals_count ?? 0);
  const successRate = Number(wallet?.withdrawal_success_rate_percent ?? 0);

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
        <div className="p-4 sm:p-5 md:p-7 space-y-5 sm:space-y-6">
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

          {/* Luxurious Wallet Hero */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0F0A1A 0%, #1A0F1F 40%, #2D1810 100%)",
              minHeight: 200,
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-25"
              style={{
                background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #B42225 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
              style={{
                background: "radial-gradient(circle, #F97316 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, rgba(180, 34, 37, 0.06) 0%, transparent 50%)
                `,
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

            <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(249,115,22,0.2)",
                      border: "1px solid rgba(249,115,22,0.2)",
                    }}
                  >
                    <HiWallet size={22} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                      Available Balance
                    </p>
                    <p className="text-white text-3xl sm:text-4xl font-black leading-none mt-0.5">
                      {loadingWallet ? "…" : fmtCurrency(balance)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {pendingBalance > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <FiClock size={12} className="text-amber-400" />
                      <span className="text-amber-300 text-xs font-semibold">
                        {fmtCurrency(pendingBalance)} pending
                      </span>
                    </div>
                  )}
                  {pendingWithdrawals > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <MdOutlinePending size={12} className="text-blue-400" />
                      <span className="text-blue-300 text-xs font-semibold">
                        {pendingWithdrawals} withdrawal{pendingWithdrawals !== 1 ? 's' : ''} pending
                      </span>
                    </div>
                  )}
                  {successRate > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <RiSecurePaymentLine size={12} className="text-emerald-400" />
                      <span className="text-emerald-300 text-xs font-semibold">
                        {successRate}% success rate
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {allTransactions.length > 1 && (
                  <div className="w-full sm:w-40 bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                    <Sparkbars transactions={allTransactions} />
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 text-center">
                      Recent earnings
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={balance <= 0 || loadingWallet}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #F97316, #EA580C, #B42225)",
                    boxShadow: "0 4px 25px rgba(249,115,22,0.4)",
                  }}
                >
                  <FiSend size={16} /> Withdraw Funds
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Total Earned",
                value: fmtCurrency(totalEarned),
                icon: <FiTrendingUp size={17} />,
                color: "#059669",
                bg: "#F0FDF4",
                subtitle: "Lifetime earnings",
              },
              {
                label: "Available",
                value: fmtCurrency(balance),
                icon: <FiCreditCard size={17} />,
                color: "#F97316",
                bg: "#FFF7ED",
                subtitle: "Ready for withdrawal",
              },
              {
                label: "Withdrawn",
                value: fmtCurrency(totalWithdrawn),
                icon: <FiArrowUpRight size={17} />,
                color: "#6366F1",
                bg: "#EEF2FF",
                subtitle: "Total withdrawn",
              },
              {
                label: "Pending Balance",
                value: fmtCurrency(pendingBalance),
                icon: <FiClock size={17} />,
                color: "#D97706",
                bg: "#FFFBEB",
                subtitle: "In escrow",
              },
            ].map(({ label, value, icon, color, bg, subtitle }) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                icon={icon}
                color={color}
                bg={bg}
                subtitle={subtitle}
              />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
            {(["transactions", "withdrawals"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition capitalize ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transactions Tab - Redesigned */}
          {activeTab === "transactions" && (
            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div>
                  <p className="font-black text-slate-900 text-sm sm:text-base">
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

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-50">
                {loadingTx ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="px-4 py-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100" />
                        <div className="flex-1">
                          <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                          <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
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
                      Transactions will appear once orders are fulfilled
                    </p>
                  </div>
                ) : (
                  allTransactions.map((tx, i) => {
                    const cfg = txConfig(tx.transaction_type, tx.flow);
                    const isPending = tx.transaction_type === "pending_credit";
                    return (
                      <div key={tx.id ?? i} className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-700">
                                {isPending ? "Pending Credit" : cfg.label}
                              </p>
                              {isPending && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  Escrow
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {tx.description || "—"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
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
                          <div className="text-right">
                            <p
                              className="text-sm font-black"
                              style={{ color: cfg.color }}
                            >
                              {cfg.sign}
                              {fmtCurrency(Number(tx.amount))}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {tx.reference || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto scrollbar-hide">
                <div className="min-w-[768px]">
                  <div
                    className="grid grid-cols-5 gap-3 px-6 py-3"
                    style={{ background: "#F8FAFC" }}
                  >
                    {["Type", "Description", "Amount", "Reference", "Date"].map(
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
                          Transactions will appear once orders are fulfilled
                        </p>
                      </div>
                    ) : (
                      allTransactions.map((tx, i) => {
                        const cfg = txConfig(tx.transaction_type, tx.flow);
                        const isPending = tx.transaction_type === "pending_credit";
                        return (
                          <div
                            key={tx.id ?? i}
                            className="grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-orange-50/20 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: cfg.bg, color: cfg.color }}
                              >
                                {cfg.icon}
                              </div>
                              <div>
                                <span
                                  className="text-[11px] font-bold block"
                                  style={{ color: cfg.color }}
                                >
                                  {isPending ? "Pending Credit" : cfg.label}
                                </span>
                                {isPending && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    Escrow
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">
                                {tx.description || "—"}
                              </p>
                            </div>

                            <p
                              className="text-sm font-black"
                              style={{ color: cfg.color }}
                            >
                              {cfg.sign}
                              {fmtCurrency(Number(tx.amount))}
                            </p>

                            <p className="text-[11px] font-mono text-slate-500 truncate">
                              {tx.reference || "—"}
                            </p>

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
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {!loadingTx && totalPages > 1 && (
                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4"
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

          {/* Withdrawals Tab - Redesigned */}
          {activeTab === "withdrawals" && (
            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
            >
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div>
                  <p className="font-black text-slate-900 text-sm sm:text-base">
                    Withdrawal Requests
                  </p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    {withdrawalTotal} total requests
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={withdrawalFilter}
                    onChange={(e) =>
                      setWithdrawalFilter(
                        e.target.value as typeof withdrawalFilter
                      )
                    }
                    className="flex-1 sm:flex-none text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 outline-none bg-white focus:border-orange-400"
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

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-50">
                {loadingWithdrawals ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="px-4 py-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                      </div>
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
                    const cfg = withdrawalStatusConfig[wd.status?.toLowerCase()] ??
                      withdrawalStatusConfig.pending;
                    const isPending = wd.status?.toLowerCase() === "pending";
                    return (
                      <div key={wd.id} className="px-4 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-black text-slate-900">
                            {fmtCurrency(Number(wd.amount))}
                          </p>
                          <span
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                            style={{
                              color: cfg.color,
                              background: cfg.bg,
                              borderColor: cfg.border,
                            }}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          {wd.bank_name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {wd.account_number} · {wd.account_name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
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

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto scrollbar-hide">
                <div className="min-w-[768px]">
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
                        const cfg = withdrawalStatusConfig[wd.status?.toLowerCase()] ??
                          withdrawalStatusConfig.pending;
                        const isPending = wd.status?.toLowerCase() === "pending";
                        return (
                          <div
                            key={wd.id}
                            className="grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-orange-50/20 transition-colors"
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
                              {cfg.icon}
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
                </div>
              </div>

              {/* Withdrawals Pagination */}
              {!loadingWithdrawals && withdrawalTotalPages > 1 && (
                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4"
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
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl animate-fade-in"
          style={{ background: "linear-gradient(145deg, #0F0A1A, #1A0F1F)" }}
        >
          <FiCheck size={15} className="text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerWalletPage;