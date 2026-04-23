'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from "react";
import apiService from "@/services/apiService";
import Footer from "@/components/layout/Footer";
import {
  FiClock,
  FiCheckCircle,
  FiX,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
  FiHome,
} from "react-icons/fi";
import { FaStore, FaRocket } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

// Types
interface ApplicationData {
  id?: string;
  application_id?: string;
  business_name?: string;
  business_address?: string;
  business_category?: string[];
  seller_document?: string;
  rejection_reason?: string;
  reason?: string;
  reject_reason?: string;
  rejection_message?: string;
  is_rejected?: boolean;
  rejected?: boolean;
  status?: string;
  seller_status?: string;
  application_status?: string;
  state?: string;
  application_state?: string;
  approval_status?: string;
  result?: string;
  decision?: string;
  latest_application?: {
    status?: string;
    seller_status?: string;
    application_status?: string;
    rejection_reason?: string;
    reason?: string;
  };
}

interface ApiResponse {
  data?: ApplicationData;
  status?: string;
  seller_status?: string;
  application_status?: string;
  is_rejected?: boolean;
  rejected?: boolean;
  rejection_reason?: string;
  reason?: string;
}

type StatusType = 'pending' | 'approved' | 'rejected' | 'not_applied' | 'success' | null;

const ApplicationStatus = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justApplied = searchParams.get('justApplied') === 'true';

  const [status, setStatus] = useState<StatusType>(null);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [dismissRedirect, setDismissRedirect] = useState(false);
  const [countdown, setCountdown] = useState(4);

  /* ── Extract rejection reason from any nesting level ── */
  const extractRejectionReason = (res: ApiResponse, d: ApplicationData): string => {
    return (
      d?.rejection_reason ||
      d?.reason ||
      d?.reject_reason ||
      d?.rejection_message ||
      d?.latest_application?.rejection_reason ||
      d?.latest_application?.reason ||
      res?.rejection_reason ||
      res?.reason ||
      (res?.data as any)?.rejection_reason ||
      ""
    );
  };

  const fetchStatus = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      try {
        const res: ApiResponse = await apiService.getApplicationStatus();

        // Unwrap response — handle single or double nesting
        let d: ApplicationData = res?.data || res;
        // Check for nested data property (API response wrapper)
        if (d && (d as any).data && typeof (d as any).data === "object") {
          d = (d as any).data;
        }

        setData(d);

        // Collect all possible status values
        const statusValues = [
          d?.status,
          d?.seller_status,
          d?.application_status,
          d?.state,
          d?.application_state,
          d?.approval_status,
          d?.result,
          d?.decision,
          d?.latest_application?.status,
          d?.latest_application?.seller_status,
          d?.latest_application?.application_status,
          res?.status,
          res?.seller_status,
          res?.application_status,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase().trim());

        const s = statusValues.find((v) => v.length > 0) || "";

        // Check rejection indicators first
        const rejectionReason = extractRejectionReason(res, d);
        const hasRejection =
          rejectionReason ||
          d?.is_rejected === true ||
          res?.is_rejected === true ||
          d?.rejected === true ||
          res?.rejected === true;

        let computed: StatusType = "not_applied";

        if (hasRejection || /rejected|denied|declined|not_approved/.test(s)) {
          computed = "rejected";
        } else if (/approved|accepted|active|verified/.test(s)) {
          computed = "approved";
        } else if (
          /pending|in_review|under_review|submitted|processing|review/.test(s)
        ) {
          computed = "pending";
        } else if (s) {
          computed = s as StatusType;
        } else if (
          d?.application_id ||
          d?.id ||
          d?.business_name ||
          d?.business_address ||
          d?.seller_document ||
          (d && Object.keys(d).length > 0)
        ) {
          // Has data but no recognisable status — assume pending
          computed = "pending";
        }

        // If user just applied in this session, treat empty as pending
        if (computed === "not_applied" && justApplied) {
          computed = "pending";
        }

        // Store rejection reason directly on data for easy access later
        if (computed === "rejected" && rejectionReason) {
          setData((prev) => ({ ...prev, rejection_reason: rejectionReason }));
        }

        setStatus(computed);
      } catch (err: any) {
        const msg = err.message?.toLowerCase() || "";
        if (
          msg.includes("not found") ||
          msg.includes("404") ||
          msg.includes("no application") ||
          msg.includes("no seller")
        ) {
          setStatus("not_applied");
        } else {
          setError(err.message || "Failed to load status. Please try again.");
          setStatus(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [justApplied],
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Countdown + auto-redirect when approved
  useEffect(() => {
    if (status !== "approved" || dismissRedirect) return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push("/seller/dashboard");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, dismissRedirect, router]);

  const configs = {
    pending: {
      gradient: "linear-gradient(135deg,#78350f,#D97706)",
      icon: <FiClock size={36} className="text-amber-400" />,
      ring: "border-amber-300",
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      pill: "bg-amber-100 text-amber-700 border-amber-200",
      pillText: "Under Review",
      title: "Application Being Reviewed",
      desc: "Our team is reviewing your seller application. This usually takes 24–48 hours. You'll receive an email once a decision is made.",
      steps: [
        { done: true,  label: "Application Submitted" },
        { done: false, label: "Under Review by Team",  active: true },
        { done: false, label: "Decision Made" },
        { done: false, label: "Account Activated" },
      ],
    },
    approved: {
      gradient: "linear-gradient(135deg,#064e3b,#059669)",
      icon: <FiCheckCircle size={36} className="text-emerald-400" />,
      ring: "border-emerald-300",
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pillText: "✓ Approved",
      title: "You're a Verified Seller!",
      desc: "Congratulations! Your application has been approved. Your seller dashboard is now active — start listing products and reach thousands of buyers on JOVO.",
      steps: [
        { done: true, label: "Application Submitted" },
        { done: true, label: "Reviewed by Team" },
        { done: true, label: "Application Approved" },
        { done: true, label: "Seller Account Active" },
      ],
    },
    rejected: {
      gradient: "linear-gradient(135deg,#7f1d1d,#DC2626)",
      icon: <FiX size={36} className="text-red-400" />,
      ring: "border-red-300",
      bg: "bg-gradient-to-br from-red-50 to-rose-50",
      pill: "bg-red-100 text-red-700 border-red-200",
      pillText: "✕ Not Approved",
      title: "Application Not Approved",
      desc: "Unfortunately your application was not approved this time. Review the reason below and reapply once you've addressed the issues.",
      steps: [
        { done: true,  label: "Application Submitted" },
        { done: true,  label: "Reviewed by Team" },
        { done: false, label: "Application Rejected", error: true },
        { done: false, label: "Seller Account Active" },
      ],
    },
    not_applied: {
      gradient: "linear-gradient(135deg,#1e1b4b,#4338CA)",
      icon: <FaStore size={32} className="text-indigo-400" />,
      ring: "border-indigo-300",
      bg: "bg-gradient-to-br from-indigo-50 to-violet-50",
      pill: "bg-indigo-100 text-indigo-700 border-indigo-200",
      pillText: "No Application",
      title: "No Application Found",
      desc: "You haven't applied to become a seller on JOVO yet. Apply now — it's free and takes less than 5 minutes.",
      steps: [],
    },
    success: {
      gradient: "linear-gradient(135deg,#1e1b4b,#4338CA)",
      icon: <FaStore size={32} className="text-indigo-400" />,
      ring: "border-indigo-300",
      bg: "bg-gradient-to-br from-indigo-50 to-violet-50",
      pill: "bg-indigo-100 text-indigo-700 border-indigo-200",
      pillText: "No Application",
      title: "No Application Found",
      desc: "You haven't applied to become a seller on JOVO yet. Apply now — it's free and takes less than 5 minutes.",
      steps: [],
    },
  };

  const c = status
    ? configs[status as keyof typeof configs] || configs.not_applied
    : configs.not_applied;

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* Header bar */}
        <div
          className="sticky top-0 z-30 border-b border-white/10"
          style={{ background: c.gradient }}
        >
          <div className="max-w-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
            <Link href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold transition-colors"
            >
              <FiHome size={14} /> Home
            </Link>
            <span className="text-white text-xs font-black tracking-wide">
              Application Status
            </span>
            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />{" "}
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-[#B42225]/20 border-t-[#B42225] rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-semibold">
                Checking your application status...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl px-5 py-5 bg-red-50 border border-red-200">
                <FiAlertCircle
                  size={18}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-black mb-1">
                    Error Loading Status
                  </p>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <ul className="text-xs text-red-600 list-disc pl-4 space-y-1">
                    <li>Make sure you're logged in with the correct account</li>
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => fetchStatus(true)}
                disabled={refreshing}
                className="w-full flex items-center justify-center gap-2 bg-[#B42225] hover:bg-[#9e1e20] text-white py-3 rounded-xl font-black text-sm transition-colors disabled:opacity-50"
              >
                <FiRefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />{" "}
                Try Again
              </button>
            </div>
          )}

          {/* Null status fallback */}
          {!loading && !error && status === null && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FiAlertCircle size={24} className="text-amber-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-700 font-black mb-1">
                  Unable to Load Status
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Please refresh or try again
                </p>
                <button
                  onClick={() => fetchStatus(true)}
                  className="px-6 py-2.5 bg-[#B42225] text-white rounded-xl text-sm font-black hover:bg-[#9e1e20] transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* Main status content */}
          {!loading && !error && status !== null && (
            <div className="space-y-5">
              {/* Main status card */}
              <div
                className={`rounded-3xl ${c.bg} border-2 ${c.ring} p-8 text-center`}
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
              >
                <div
                  className={`w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-5 border-2 ${c.ring}`}
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                  {c.icon}
                </div>

                <span
                  className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${c.pill}`}
                >
                  {c.pillText}
                </span>

                <h2
                  className="text-2xl md:text-3xl font-black text-gray-900 mt-5 mb-3"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  {c.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                  {c.desc}
                </p>

                {/* ── Rejection reason ── */}
                {status === "rejected" && (
                  <div className="mt-5 max-w-md mx-auto">
                    {data?.rejection_reason ? (
                      <div className="bg-red-100 border border-red-200 rounded-2xl px-5 py-4 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <FiAlertCircle
                            size={14}
                            className="text-red-600 shrink-0"
                          />
                          <p className="text-xs font-black text-red-700 uppercase tracking-wide">
                            Reason for Rejection
                          </p>
                        </div>
                        <p className="text-sm text-red-700 leading-relaxed">
                          {data.rejection_reason}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-center">
                        <p className="text-xs text-red-500">
                          No specific reason was provided. Contact support for
                          more details.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved badge */}
                {status === "approved" && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <MdVerified size={18} className="text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700">
                      JOVO Verified Seller
                    </span>
                  </div>
                )}

                {/* Auto-redirect countdown */}
                {status === "approved" && !dismissRedirect && (
                  <div className="mt-5 mx-auto max-w-sm px-4 py-3 rounded-2xl bg-emerald-100 border border-emerald-200">
                    <p className="text-xs font-black text-emerald-700 mb-0.5">
                      Redirecting to your dashboard in{" "}
                      <span className="text-lg">{countdown}</span>s
                    </p>
                    <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex flex-wrap justify-center gap-3 mt-7">
                  {status === "approved" && (
                    <>
                      <button onClick={() => router.push("/seller/dashboard")}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg,#059669,#10B981)", boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}>
                        <FaStore size={14} /> Go to Dashboard <FiArrowRight size={13} />
                      </button>
                      {!dismissRedirect && (
                        <button onClick={() => setDismissRedirect(true)}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all">
                          Stay Here
                        </button>
                      )}
                    </>
                  )}
                  
                  {status === "rejected" && (
                    <button onClick={() => router.push("/seller-application")}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 8px 24px rgba(180,34,37,0.3)" }}>
                      <FaRocket size={14} /> Reapply Now <FiArrowRight size={13} />
                    </button>
                  )}
                  
                  {(status === "not_applied" || status === "success") && (
                    <>
                      <button onClick={() => router.push("/seller-application")}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 8px 24px rgba(180,34,37,0.3)" }}>
                        <FaRocket size={14} /> Start Application <FiArrowRight size={13} />
                      </button>
                      <Link href="/"
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all">
                        Back to Home
                      </Link>
                    </>
                  )}
                  
                  {status === "pending" && (
                    <Link href="/"
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-all">
                      Back to Home
                    </Link>
                  )}
                </div>
              </div>

              {/* Progress steps */}
              {c.steps.length > 0 && (
                <div
                  className="bg-white rounded-3xl p-6 md:p-7 border border-gray-100"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                >
                  <p className="text-xs font-black uppercase tracking-[3px] text-gray-400 mb-5">
                    Application Progress
                  </p>
                  <div className="space-y-4">
                    {c.steps.map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
                            step.error
                              ? "bg-red-100 text-red-600"
                              : step.done
                                ? "text-white"
                                : step.active
                                  ? "text-white"
                                  : "bg-gray-100 text-gray-400"
                          }`}
                          style={
                            step.done && !step.error
                              ? {
                                  background:
                                    "linear-gradient(135deg,#059669,#10B981)",
                                }
                              : step.active
                                ? {
                                    background:
                                      "linear-gradient(135deg,#D97706,#F59E0B)",
                                  }
                                : {}
                          }
                        >
                          {step.error ? "✕" : step.done ? "✓" : i + 1}
                        </div>
                        <p
                          className={`text-sm font-bold flex-1 ${
                            step.error
                              ? "text-red-600"
                              : step.done
                                ? "text-gray-800"
                                : step.active
                                  ? "text-amber-700"
                                  : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.active && (
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application details */}
              {data?.business_name && status !== "not_applied" && (
                <div
                  className="bg-white rounded-3xl p-6 border border-gray-100"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                >
                  <p className="text-xs font-black uppercase tracking-[3px] text-gray-400 mb-4">
                    Your Application
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.business_name && (
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                          Business Name
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {data.business_name}
                        </p>
                      </div>
                    )}
                    {data.business_address && (
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                          Business Address
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {data.business_address}
                        </p>
                      </div>
                    )}
                    {data.business_category && data.business_category.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                          Categories
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {data.business_category.map((cat) => (
                            <span
                              key={cat}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-white"
                              style={{
                                background:
                                  "linear-gradient(135deg,#B42225,#FF6B00)",
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pending tip */}
              {status === "pending" && (
                <div
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                  }}
                >
                  <FiClock
                    size={16}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-bold text-amber-800 mb-0.5">
                      What happens next?
                    </p>
                    <p className="text-xs text-amber-700/70 leading-relaxed">
                      Our team reviews all applications manually. You'll receive
                      an email at your registered address once a decision has
                      been made. Please also check your spam folder.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApplicationStatus;