'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiArrowLeft } from "react-icons/fi";
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

const Login = () => {
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

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("network"))
        setErrors({ general: "Network error. Check your connection." });
      else
        setErrors({
          general: err.message || "Login failed. Please try again.",
        });
    } finally {
      setLoading(false);
    }
  };

  const fieldShell = (field: keyof Errors) =>
    `flex items-center gap-3 rounded-full px-4 py-3.5 transition-all duration-200 ${
      errors[field]
        ? "bg-white ring-1 ring-brand/30"
        : "bg-sand focus-within:bg-white focus-within:ring-1 focus-within:ring-ink/15"
    }`;

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Left panel (desktop only) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:justify-center lg:p-14 xl:w-[52%]">
        <div className="absolute inset-0 bg-gradient-to-br from-lilac via-sky/60 to-cream" />
        <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-peach/60 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex items-center rounded-[18px] bg-white/80 p-3 ring-1 ring-ink/[.05]">
            <img
              src="/images/Jovo_logo.png"
              alt="Jovo"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/40">
            Welcome back
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
            Your campus
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">marketplace.</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-2.5 rounded-full bg-mint" />
            </span>
          </h2>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ink/55">
            Thousands of products, weekly deals and verified sellers - all in one
            place, delivered across campus.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "30,000+ Buyers",
              "5,000+ Sellers",
              "Weekly Deals",
              "Secure Payments",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-medium text-ink/55 ring-1 ring-ink/[.04]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex min-h-screen w-full flex-col lg:w-1/2 xl:w-[48%]">
        <Link
          href="/"
          className="absolute right-0 top-0 z-50 flex items-center gap-2 px-5 py-4 text-[12.5px] font-semibold text-ink/50 transition-colors hover:text-ink md:px-8"
        >
          <FiArrowLeft size={14} />
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center px-5 py-16 md:px-12 lg:px-14">
          <div className="w-full max-w-[400px]">
            <Link href="/" className="mb-8 inline-flex lg:hidden">
              <img
                src="/images/Jovo_logo.png"
                alt="Jovo"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="mb-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/40">
                Account access
              </p>
              <h1 className="mt-2 font-display text-[30px] font-semibold tracking-[-0.03em] text-ink">
                Sign in
              </h1>
              <p className="mt-1.5 text-[13px] text-ink/50">
                Welcome back - sign in to continue shopping
              </p>
            </div>

            {successMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-mint/50 px-4 py-3 ring-1 ring-ink/[.05]">
                <span className="text-[13px] text-ink">✓</span>
                <p className="text-[12.5px] font-medium text-ink/70">
                  {successMsg}
                </p>
              </div>
            )}
            {errors.general && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-brand/25">
                <FiAlertCircle size={15} className="shrink-0 text-brand" />
                <p className="text-[12.5px] text-brand">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                  Email address
                </label>
                <div className={fieldShell("email")}>
                  <FiMail
                    size={16}
                    className={errors.email ? "shrink-0 text-brand" : "shrink-0 text-ink/35"}
                  />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder-ink/30"
                  />
                </div>
                {errors.email && (
                  <p className="ml-1 mt-1.5 text-[11.5px] text-brand">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-ink/45 transition-colors hover:text-ink"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className={fieldShell("password")}>
                  <FiLock
                    size={16}
                    className={errors.password ? "shrink-0 text-brand" : "shrink-0 text-ink/35"}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setErrors((p) => ({ ...p, password: "" }));
                    }}
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder-ink/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="shrink-0 text-ink/35 transition-colors hover:text-ink/70"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="ml-1 mt-1.5 text-[11.5px] text-brand">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[13px] font-semibold text-cream transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />{" "}
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink/10" />
              <span className="whitespace-nowrap text-[11px] font-medium text-ink/35">
                or continue with
              </span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            <GoogleButton />

            <p className="mt-7 text-center text-[12.5px] text-ink/50">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-ink underline decoration-ink/20 decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
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

export default Login;
