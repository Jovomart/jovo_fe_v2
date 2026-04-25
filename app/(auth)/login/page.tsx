'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useContext, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import GoogleButton from "@/components/auth/GoogleButton";

// Types
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
  const successMsg = searchParams.get('message') || "";

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
      router.push("/");
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
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: "#F4F5F9" }}
    >
      {/* ══ LEFT PANEL (desktop only) ══ */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] sticky top-0 h-screen flex-col items-center justify-center p-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#0a0a0a 0%,#150505 40%,#2d0808 70%,#B42225 100%)",
        }}
      >
        {/* glow orbs */}
        <div
          className="absolute -top-24 -right-24 w-125 h-125 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#FF6B00,transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#B42225,transparent 70%)",
          }}
        />
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 text-center max-w-sm w-full mx-auto">
          {/* JOVO logo - using public folder image instead of undefined logo1 */}
          <img
            src="/images/Jovo_off_icon.png"
            alt="Jovo"
            className="md:h-35 h-15 md:w-55 w-75 ml-15 object-cover cursor-pointer"
          />

          <h2
            className="text-4xl font-black text-white mb-4 leading-[1.15]"
            style={{ fontFamily: "'Georgia',serif" }}
          >
            Welcome back to
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#fca5a5,#fdba74)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              your marketplace
            </span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10">
            Your campus shopping destination — thousands of products, weekly
            deals, and fast delivery.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              "30,000+ Buyers",
              "5,000+ Sellers",
              "Weekly Deals",
              "Secure Payments",
            ].map((t) => (
              <span
                key={t}
                className="text-xs font-semibold text-white/60 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL (form) ══ */}
      <div className="w-full lg:w-1/2 xl:w-[45%] min-h-screen flex flex-col relative">
        {/* Back to Home Button - Top Right Corner */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-0 right-0 flex items-center gap-2 px-6 py-4 text-sm font-black text-[#B42225] transition-all hover:scale-[1.02] z-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 19l-7-7 7-7m6 0l-7 7 7 7"
            />
          </svg>
          Back to Home
        </button>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-15 md:px-12 lg:px-16">
          <div className="w-full max-w-105">
            <img
              src="/images/Jovo_off_icon.png"
              alt="Jovo"
              className="md:h-25 h-15 md:w-75 w-75 object-cover cursor-pointer"
            />

            {/* Heading */}
            <div className="mb-8">
              <h1
                className="text-3xl font-black text-gray-900 mb-1.5"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Sign In
              </h1>
              <p className="text-sm text-gray-400">
                Welcome back — sign in to your account
              </p>
            </div>

            {/* Alerts */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-5">
                <span className="text-green-500 text-base">✓</span>
                <p className="text-green-700 text-sm font-medium">
                  {successMsg}
                </p>
              </div>
            )}
            {errors.general && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
                <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Email Address
                </label>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                  }`}
                >
                  <FiMail
                    size={16}
                    className={
                      errors.email
                        ? "text-red-400 shrink-0"
                        : "text-gray-400 shrink-0"
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
                    className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Password
                  </label>
                  <Link href="/forgot-password"
                    className="text-xs font-bold hover:underline transition-colors"
                    style={{ color: "#B42225" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                    errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
                  }`}
                >
                  <FiLock
                    size={16}
                    className={
                      errors.password
                        ? "text-red-400 shrink-0"
                        : "text-gray-400 shrink-0"
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
                    className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.005] active:scale-[0.995] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{
                  background: "linear-gradient(135deg,#B42225,#FF6B00)",
                  boxShadow: "0 6px 28px rgba(180,34,37,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <GoogleButton />

            <p className="text-center mt-7 text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register"
                className="font-black hover:underline transition-colors"
                style={{ color: "#B42225" }}
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => (
  <Suspense>
    <LoginInner />
  </Suspense>
);

export default Login;