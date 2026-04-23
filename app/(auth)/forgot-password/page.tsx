'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// src/pages/forgotPassword.tsx
import { useState, useRef, useEffect, useContext } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { FiMail, FiAlertCircle, FiArrowLeft, FiLock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";

/* ── Logo ─────────────────────────────────────────────────── */
const JovoLogo = () => (
  <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)" }}>
      <span className="text-white font-black text-lg" style={{ fontFamily: "'Georgia',serif" }}>J</span>
    </div>
    <span className="font-black text-2xl text-gray-900 tracking-tight" style={{ fontFamily: "'Georgia',serif" }}>JOVO</span>
  </div>
);

/* ── Shared input wrapper ─────────────────────────────────── */
// ✅ FIX 1: Made `error` optional (error?) so Field can be used with or without it
const Field = ({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) => (
  <div>
    {label && <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-1.5">{label}</label>}
    {children}
    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);

const inputBox = (hasError: boolean) =>
  `flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${
    hasError
      ? "border-red-400 bg-red-50"
      : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
  }`;

/* ════════════════════════════════════════════════════════════
   STEP 1 — Email
═════════════════════════════════════════════════════════════ */
const StepEmail = ({ onNext }: { onNext: (email: string) => void }) => {
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setLoading(true); setError("");
    try {
      await forgotPassword(email.trim().toLowerCase());
      onNext(email.trim().toLowerCase());
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-2">
        <FiMail size={28} style={{ color: "#B42225" }} />
      </div>
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Georgia',serif" }}>Forgot Password?</h1>
        <p className="text-sm text-gray-500">Enter your email and we'll send you a 6-digit reset code.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FiAlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Email Address" error={undefined}>
          <div className={inputBox(!!error)}>
            <FiMail size={15} className="text-gray-400" />
            <input type="email" placeholder="your@email.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400" />
          </div>
        </Field>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 6px 24px rgba(180,34,37,0.3)" }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending code...</>
            : "Send Reset Code"}
        </button>
      </form>

      <p className="text-center text-sm">
        <Link href="/login" className="font-bold hover:underline" style={{ color: "#B42225" }}>← Back to Sign In</Link>
      </p>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   STEP 2 — Enter code
═════════════════════════════════════════════════════════════ */
const StepCode = ({ email, onNext, onBack }: { email: string; onNext: (code: string) => void; onBack: () => void }) => {
  const { forgotPassword } = useContext(AuthContext);
  const [code, setCode]     = useState(["", "", "", "", "", ""]);
  const [error, setError]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code]; next[i] = val; setCode(next); setError("");
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setCode(p.split("")); inputRefs.current[5]?.focus(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setError("Enter the complete 6-digit code."); return; }
    if (timeLeft <= 0)          { setError("Code expired. Please request a new one."); return; }
    setLoading(true); setError("");
    try {
      // We just pass the code forward — backend verifies during reset
      onNext(fullCode);
    } catch (err: any) {
      setError(err.message || "Invalid code.");
      setCode(["", "", "", "", "", ""]); inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true); setError("");
    try {
      await forgotPassword(email);
      setTimeLeft(600); setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) { setError(err.message || "Failed to resend."); }
    finally { setResending(false); }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <FiArrowLeft size={15} /> Back
      </button>

      <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center">
        <FiMail size={28} style={{ color: "#B42225" }} />
      </div>

      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Georgia',serif" }}>Check Your Email</h1>
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to <strong className="text-gray-800">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FiAlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex gap-3 justify-between mb-5" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input key={i}
              // ✅ FIX 2: ref callback must return void, not the assigned value
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-12 h-14 text-center text-xl font-black rounded-2xl border-2 outline-none transition-all ${
                digit
                  ? "border-[#B42225] bg-red-50 text-[#B42225]"
                  : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
              }`}
            />
          ))}
        </div>

        <div className="text-center mb-5">
          {timeLeft > 0
            ? <p className="text-xs text-gray-500">Expires in{" "}
                <span className={`font-black ${timeLeft <= 60 ? "text-red-500" : ""}`}
                  style={timeLeft > 60 ? { color: "#B42225" } : {}}>{fmt(timeLeft)}</span>
              </p>
            : <p className="text-xs text-red-500 font-semibold">Code has expired.</p>
          }
        </div>

        <button type="submit" disabled={loading || code.join("").length !== 6 || timeLeft <= 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 6px 24px rgba(180,34,37,0.3)" }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
            : "Verify Code"}
        </button>
      </form>

      <div className="flex items-center justify-center gap-2">
        <p className="text-sm text-gray-500">Didn't get it?</p>
        <button onClick={handleResend} disabled={resending || timeLeft > 540}
          className="flex items-center gap-1 text-sm font-black hover:underline disabled:opacity-40"
          style={{ color: "#B42225" }}>
          <FiRefreshCw size={13} className={resending ? "animate-spin" : ""} />
          {resending ? "Sending..." : "Resend code"}
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   STEP 3 — New password
═════════════════════════════════════════════════════════════ */

// ✅ FIX 3: Explicit type for errors state so TS knows its valid keys
type PasswordErrors = {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

const StepNewPassword = ({ email, code, onBack, onSuccess }: { email: string; code: string; onBack: () => void; onSuccess: () => void }) => {
  const { resetPassword } = useContext(AuthContext);
  const [form, setForm]           = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors]       = useState<PasswordErrors>({});
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);

  const getStrength = (pw: string) => {
    const s = [pw.length >= 8, /[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw)].filter(Boolean).length;
    if (s <= 1) return { label: "Weak",   color: "#EF4444", w: "25%" };
    if (s <= 2) return { label: "Fair",   color: "#F59E0B", w: "50%" };
    if (s <= 3) return { label: "Good",   color: "#3B82F6", w: "75%" };
    return           { label: "Strong", color: "#10B981", w: "100%" };
  };

  const validate = () => {
    const e: PasswordErrors = {};
    if (!form.newPassword)                              e.newPassword = "Password is required";
    else if (form.newPassword.length < 8)               e.newPassword = "Minimum 8 characters";
    if (!form.confirmPassword)                          e.confirmPassword = "Please confirm password";
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setErrors({});
    try {
      await resetPassword(email, code, form.newPassword, form.confirmPassword);
      onSuccess();
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to reset password." });
    } finally { setLoading(false); }
  };

  const strength = form.newPassword ? getStrength(form.newPassword) : null;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <FiArrowLeft size={15} /> Back
      </button>

      <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center">
        <FiLock size={28} style={{ color: "#B42225" }} />
      </div>

      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Georgia',serif" }}>New Password</h1>
        <p className="text-sm text-gray-500">Create a strong new password for <strong className="text-gray-800">{email}</strong></p>
      </div>

      {errors.general && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FiAlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-1.5">New Password</label>
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${
            errors.newPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
          }`}>
            <FiLock size={15} className="text-gray-400" />
            <input type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={form.newPassword}
              onChange={(e) => { setForm((p) => ({ ...p, newPassword: e.target.value })); setErrors((p) => ({ ...p, newPassword: "" })); }}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400" />
            <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1} className="text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {strength && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: strength.w, background: strength.color }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
          {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-gray-500 mb-1.5">Confirm Password</label>
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all ${
            errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
          }`}>
            <FiLock size={15} className="text-gray-400" />
            <input type={showPw ? "text" : "password"} placeholder="Repeat your password" value={form.confirmPassword}
              onChange={(e) => { setForm((p) => ({ ...p, confirmPassword: e.target.value })); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)", boxShadow: "0 6px 24px rgba(180,34,37,0.3)" }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
            : "Update Password"}
        </button>
      </form>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN
═════════════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const router = useRouter()
  const navigate = (p: string | number) => typeof p === 'number' ? router.back() : router.push(p)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");

  const stepLabels = ["Enter Email", "Verify Code", "New Password"];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F4F5F9" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 md:p-10" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <JovoLogo />

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepLabels.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step > s ? "text-white" : step === s ? "text-white" : "bg-gray-100 text-gray-400"
                  }`} style={step >= s ? { background: "linear-gradient(135deg,#B42225,#FF6B00)" } : {}}>
                    {step > s ? <Check size={12} /> : s}
                  </div>
                  {i < 2 && <div className={`w-8 h-0.5 rounded-full ${step > s ? "" : "bg-gray-200"}`}
                    style={step > s ? { background: "linear-gradient(90deg,#B42225,#FF6B00)" } : {}} />}
                </div>
              );
            })}
          </div>

          {step === 1 && <StepEmail onNext={(e) => { setEmail(e); setStep(2); }} />}
          {step === 2 && <StepCode email={email} onNext={(c) => { setCode(c); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && (
            <StepNewPassword
              email={email} code={code}
              onBack={() => setStep(2)}
              onSuccess={() => router.push("/login?message=Password+updated!+Please+sign+in.")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;