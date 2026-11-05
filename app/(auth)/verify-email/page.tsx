'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, useContext } from "react";
import {
  FiMail,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";

const VerifyEmail = () => {
  const { verifyEmail, resendVerificationCode } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || "";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 min
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const fmt = (s: number): string =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    setError("");
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    if (timeLeft <= 0) {
      setError("Code has expired. Please request a new one.");
      return;
    }
    if (!email) {
      setError("Email not found. Please go back and register again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyEmail(email, fullCode);
      setSuccess("Email verified! Redirecting to login...");
      setTimeout(
        () =>
          router.push(`/login?message=${encodeURIComponent("Email verified! Please sign in.")}`),
        2000,
      );
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email not found.");
      return;
    }
    setResending(true);
    setError("");
    try {
      await resendVerificationCode(email);
      setTimeLeft(600);
      setCode(["", "", "", "", "", ""]);
      setSuccess("New code sent! Check your email.");
      setTimeout(() => setSuccess(""), 3000);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "#F4F5F9" }}
    >
      <div className="w-full max-w-md px-2 sm:px-0">
        {/* Card */}
        <div
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
        >
          <img
            src="/images/Jovo_off_icon.png"
            alt="Jovo"
            className="md:h-25 h-15 md:w-75 w-75 object-cover cursor-pointer"
          />

          {/* Icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-red-50 flex items-center justify-center mb-4 sm:mb-5">
            <FiMail
              size={22}
              className="sm:w-7 sm:h-7"
              style={{ color: "#0E0E10" }}
            />
          </div>

          <h1
            className="text-xl sm:text-2xl font-semibold text-ink mb-2"
            style={{ fontFamily: "'Instrument Sans',sans-serif" }}
          >
            Verify Your Email
          </h1>
          <p className="text-xs sm:text-sm text-ink/50 mb-1">
            We sent a 6-digit code to
          </p>
          <p className="text-xs sm:text-sm font-semibold text-ink mb-4 sm:mb-6 break-all">
            {email || "your email address"}
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-5">
              <FiAlertCircle
                size={14}
                className="sm:w-3.75 sm:h-3.75 text-red-500 shrink-0"
              />
              <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-5">
              <FiCheckCircle
                size={14}
                className="sm:w-3.75 sm:h-3.75 text-green-500 shrink-0"
              />
              <p className="text-green-700 text-xs sm:text-sm font-medium">
                {success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Code inputs - responsive gap and sizing */}
            <div
              className="flex gap-2 sm:gap-3 justify-between mb-4"
              onPaste={handlePaste}
            >
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-xl sm:rounded-2xl border-2 outline-none transition-all ${
                    digit
                      ? "bg-red-50 ring-1 ring-brand/30 text-ink"
                      : "bg-sand text-ink/70 focus:bg-white focus:ring-1 focus:ring-ink/15"
                  }`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-4 sm:mb-5">
              {timeLeft > 0 ? (
                <p className="text-[11px] sm:text-xs text-ink/50">
                  Code expires in{" "}
                  <span
                    className={`font-semibold ${timeLeft <= 60 ? "text-red-500" : ""}`}
                    style={timeLeft > 60 ? { color: "#0E0E10" } : {}}
                  >
                    {fmt(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs text-red-500 font-semibold">
                  Code has expired.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.join("").length !== 6 || timeLeft <= 0}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm text-cream transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "#0E0E10",
                boxShadow: "none",
              }}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
            <p className="text-xs sm:text-sm text-ink/50">
              Didn't receive it?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || timeLeft > 540}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ color: "#0E0E10" }}
            >
              <FiRefreshCw
                size={11}
                className={`sm:w-3.25 sm:h-3.25 ${resending ? 'animate-spin' : ''}`}
              />
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link href="/login"
              className="text-[11px] sm:text-xs text-ink/40 hover:text-ink transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;