"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useContext, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";
import Image from "next/image";

interface FormData {
  email: string;
  password: string;
}
interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginInner = () => {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMsg = searchParams.get("message") || "";

  const [form, setForm] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(form.email, form.password);
      router.push("/shop");
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || "";
      if (
        msg.includes("invalid") ||
        msg.includes("credentials") ||
        msg.includes("incorrect")
      )
        setErrors({ general: "Invalid email or password. Please try again." });
      else if (msg.includes("verify") || msg.includes("not verified"))
        setErrors({ general: "Please verify your email before logging in." });
      else
        setErrors({
          general: err.message || "Login failed. Please try again.",
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes orb-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(15px,-25px) scale(1.08); }
          66%      { transform: translate(-10px,12px) scale(0.95); }
        }
        @keyframes ring-rot {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ring-rot-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badge-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes btn-shine {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .orb-a { animation: orb-drift 9s  ease-in-out infinite; will-change: transform; }
        .orb-b { animation: orb-drift 13s ease-in-out infinite reverse; will-change: transform; }
        .orb-c { animation: orb-drift 7s  ease-in-out infinite 2s; will-change: transform; }
        .ring-a { animation: ring-rot     28s linear infinite; will-change: transform; }
        .ring-b { animation: ring-rot-rev 20s linear infinite; will-change: transform; }
        .fade-up-1 { animation: fade-up 0.55s ease-out 0.05s both; }
        .fade-up-2 { animation: fade-up 0.55s ease-out 0.15s both; }
        .fade-up-3 { animation: fade-up 0.55s ease-out 0.25s both; }
        .fade-up-4 { animation: fade-up 0.55s ease-out 0.35s both; }
        .fade-up-5 { animation: fade-up 0.55s ease-out 0.45s both; }
        .badge-a { animation: badge-float 4s ease-in-out infinite; }
        .badge-b { animation: badge-float 4s ease-in-out infinite 1.3s; }
        .badge-c { animation: badge-float 4s ease-in-out infinite 2.6s; }
        .jovo-btn {
          background: linear-gradient(270deg,#B42225,#FF6B00,#FF9500,#FF6B00,#B42225);
          background-size: 400% 100%;
          transition: background-position 0.6s ease, box-shadow 0.3s ease, transform 0.15s ease;
        }
        .jovo-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 10px 36px rgba(180,34,37,0.5);
          transform: translateY(-1px) scale(1.005);
        }
        .jovo-btn:active:not(:disabled) { transform: scale(0.99); }
        .input-wrap {
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .input-wrap:focus-within {
          border-color: #B42225 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(180,34,37,0.09);
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ background: "#F4F5F9" }}
      >
        {/* ══ LEFT PANEL ══ */}
        <div
          className="hidden lg:flex lg:w-[46%] xl:w-[48%] sticky top-0 h-screen flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg,#080202 0%,#130404 35%,#220808 65%,#B42225 130%)",
          }}
        >
          {/* animated orbs */}
          <div
            className="orb-a absolute top-[-80px] right-[-60px] w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(255,107,0,0.25),transparent 65%)",
            }}
          />
          <div
            className="orb-b absolute bottom-[-100px] left-[-80px] w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(180,34,37,0.3),transparent 65%)",
            }}
          />
          <div
            className="orb-c absolute top-[40%] left-[-40px] w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(255,149,0,0.15),transparent 65%)",
            }}
          />

          {/* rotating rings */}
          <div className="ring-a absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[700px] h-[700px] rounded-full"
              style={{ border: "1px solid rgba(255,255,255,0.04)" }}
            />
          </div>
          <div className="ring-b absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[520px] h-[520px] rounded-full"
              style={{ border: "1px dashed rgba(180,34,37,0.15)" }}
            />
          </div>

          {/* dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.045]"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />

          {/* content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full px-8">
            <Image
              src="/images/Jovo_off_logo2.png"
              alt="Jovo"
              className="w-24 object-cover  drop-shadow-lg"
              width={96}
              height={96}
            />

            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
              Welcome back
            </div>
            <h2
              className="text-[2.1rem] font-black text-white leading-[1.12] mb-4"
              style={{ fontFamily: "'Georgia',serif" }}
            >
              Your campus
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#fca5a5,#fdba74)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                marketplace
              </span>
            </h2>
            <p className="text-white/35 text-[13px] leading-relaxed mb-10">
              Thousands of products, weekly deals and fast campus delivery — all
              in one place.
            </p>

            {/* floating stat badges */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {[
                { label: "30,000+ Buyers", delay: "badge-a" },
                { label: "5,000+ Sellers", delay: "badge-b" },
                { label: "Weekly Deals", delay: "badge-c" },
                { label: "Secure Pay", delay: "badge-a" },
              ].map(({ label, delay }) => (
                <span
                  key={label}
                  className={`${delay} text-[11px] font-bold text-white/55 px-3.5 py-1.5 rounded-full`}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.11)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* glass feature card */}
            <div
              className="w-full rounded-2xl px-5 py-4 text-left"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                Why Jovo?
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: "🛍️", text: "Browse 50,000+ verified products" },
                  { icon: "🚚", text: "Fast same-campus delivery" },
                  { icon: "🔒", text: "Secure SSL-protected payments" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="text-base">{icon}</span>
                    <span className="text-[12.5px] text-white/50">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="w-full lg:w-[54%] xl:w-[52%] min-h-screen flex flex-col relative bg-white">
          {/* back button */}
          <button
            onClick={() => router.push("/shop")}
            className="absolute top-0 right-0 flex items-center gap-1.5 px-6 py-5 text-[13px] font-black text-[#B42225] hover:opacity-75 transition-opacity z-50"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 19l-7-7 7-7m6 0l-7 7 7 7"
              />
            </svg>
            Back to Shop
          </button>

          <div className="flex-1 flex items-center justify-center px-6 py-16 md:px-12 lg:px-14 xl:px-20">
            <div className="w-full max-w-[400px]">
              {/* mobile logo */}
              <Image
                src="/images/Jovo_official_logo.png"
                alt="Jovo"
                className="w-24 object-cover mb-5 lg:hidden"
                width={96}
                height={96}
              />

              {/* heading */}
              <div className="fade-up-1 mb-8">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B42225] mb-3">
                  Sign In
                </div>
                <h1
                  className="text-[2.2rem] font-black text-gray-900 leading-[1.1] mb-2"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Welcome back
                </h1>
                <p className="text-[13.5px] text-gray-400">
                  Sign in to your Jovo account to continue
                </p>
              </div>

              {/* alerts */}
              {successMsg && (
                <div
                  className="fade-up-2 flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 text-sm text-green-700"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <span className="text-green-500 font-black">✓</span>
                  {successMsg}
                </div>
              )}
              {errors.general && (
                <div
                  className="fade-up-2 flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 text-sm text-red-600"
                  style={{ background: "#fff5f5", border: "1px solid #fecaca" }}
                >
                  <FiAlertCircle size={14} className="shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* email */}
                <div className="fade-up-2">
                  <label className="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div
                    className={`input-wrap flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                    style={{ background: errors.email ? "#fff5f5" : "#F8F8F8" }}
                  >
                    <FiMail
                      size={15}
                      className={
                        errors.email
                          ? "text-red-400 shrink-0"
                          : "text-gray-350 shrink-0"
                      }
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        setErrors((p) => ({ ...p, email: "" }));
                      }}
                      className="flex-1 text-[13.5px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* password */}
                <div className="fade-up-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10.5px] font-black uppercase tracking-widest text-gray-400">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11.5px] font-bold hover:opacity-75 transition-opacity"
                      style={{ color: "#B42225" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div
                    className={`input-wrap flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                      errors.password ? "border-red-400" : "border-gray-200"
                    }`}
                    style={{
                      background: errors.password ? "#fff5f5" : "#F8F8F8",
                    }}
                  >
                    <FiLock
                      size={15}
                      className={
                        errors.password
                          ? "text-red-400 shrink-0"
                          : "text-gray-350 shrink-0"
                      }
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        setErrors((p) => ({ ...p, password: "" }));
                      }}
                      className="flex-1 text-[13.5px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* submit */}
                <div className="fade-up-4 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="jovo-btn w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-[14px] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In →"
                    )}
                  </button>
                </div>
              </form>

              {/* divider */}
              <div className="fade-up-4 flex items-center gap-3 my-6">
                <div
                  className="flex-1 h-px bg-gray-150"
                  style={{ background: "#EBEBEB" }}
                />
                <span className="text-[11.5px] text-gray-400 font-semibold whitespace-nowrap px-1">
                  or continue with
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "#EBEBEB" }}
                />
              </div>

              <div className="fade-up-4">
                <GoogleButton />
              </div>

              <p className="fade-up-5 text-center mt-7 text-[13.5px] text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-black hover:opacity-75 transition-opacity"
                  style={{ color: "#B42225" }}
                >
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Login = () => (
  <Suspense>
    <LoginInner />
  </Suspense>
);

export default Login;
