"use client";

import { useState, useEffect, useCallback } from "react";
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

interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  skip: number;
  limit: number;
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
  if (s === "pending")
    return <FiClock size={11} className="text-amber-500" />;
  if (s === "failed")
    return <FiAlertCircle size={11} className="text-red-500" />;
  return null;
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

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerWalletPage = () => {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const LIMIT = 20;
  const [total, setTotal] = useState(0);

  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true);
    setError("");
    try {
      const res = await apiService.getSellerWallet();
      const body = res?.data ?? res;
      setWallet(body);
      // Use recent_transactions from wallet summary for sparkbar
    } catch (err: any) {
      setError(err.message ?? "Failed to load wallet.");
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const fetchTransactions = useCallback(
    async (newSkip = 0) => {
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
      } catch (err: any) {
        // silently handle — wallet summary still shows
      } finally {
        setLoadingTx(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchWallet();
    fetchTransactions(0);
  }, [fetchWallet, fetchTransactions]);

  const currentPage = Math.floor(skip / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT);

  const balance = Number(
    wallet?.balance ?? wallet?.available_balance ?? 0
  );
  const pendingBalance = Number(wallet?.pending_balance ?? 0);
  const totalEarned = Number(wallet?.total_earned ?? balance);
  const totalWithdrawn = Number(wallet?.total_withdrawn ?? 0);

  // Combine wallet recent_transactions and fetched transactions
  const allTransactions =
    transactions.length > 0
      ? transactions
      : wallet?.recent_transactions ?? [];

  return (
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
            <p className="text-red-700 text-sm font-semibold flex-1">{error}</p>
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
            background: "linear-gradient(135deg,#0F172A 0%,#1C1917 60%,#1C0A00 100%)",
            minHeight: 180,
          }}
        >
          <div
            className="absolute -left-20 -top-20 w-72 h-72 rounded-full"
            style={{
              background: "radial-gradient(circle,rgba(249,115,22,0.3) 0%,transparent 70%)",
            }}
          />
          <div
            className="absolute right-0 bottom-0 w-60 h-60 rounded-full"
            style={{
              background: "radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)",
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
                <div className="flex items-center gap-2">
                  <FiClock size={12} className="text-amber-400" />
                  <span className="text-amber-300 text-xs font-semibold">
                    {fmtCurrency(pendingBalance)} pending clearance
                  </span>
                </div>
              )}
            </div>

            {/* Sparkbars */}
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

        {/* Transaction Ledger */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.05)" }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid #F8FAFC" }}
          >
            <div>
              <p className="font-black text-slate-900">Transaction History</p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                {total} total transactions
              </p>
            </div>
            <button
              onClick={() => fetchTransactions(skip)}
              className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-slate-500"
            >
              <FiRefreshCw size={14} className={loadingTx ? "animate-spin" : ""} />
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
                <div key={i} className="grid grid-cols-5 gap-3 px-6 py-4">
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
                <p className="font-bold text-slate-600">No transactions yet</p>
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
                    {/* Type */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}
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

                    {/* Description */}
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

                    {/* Amount */}
                    <p
                      className="text-sm font-black"
                      style={{ color: cfg.color }}
                    >
                      {cfg.sign}
                      {fmtCurrency(Number(tx.amount))}
                    </p>

                    {/* Balance After */}
                    <p className="text-sm font-bold text-slate-900">
                      {tx.balance_after != null
                        ? fmtCurrency(Number(tx.balance_after))
                        : "—"}
                    </p>

                    {/* Date */}
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
                Showing {skip + 1}–{Math.min(skip + LIMIT, total)} of {total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fetchTransactions(Math.max(0, skip - LIMIT))}
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
      </div>
    </SellerLayout>
  );
};

export default SellerWalletPage;