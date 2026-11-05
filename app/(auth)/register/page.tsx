'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useContext, useEffect } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiMapPin,
  FiAlertCircle,
  FiChevronRight,
  FiChevronLeft,
  FiBookOpen,
  FiSearch,
  FiX,
  FiCheck as FiCheckIcon,
  FiPhone,
} from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import GoogleButton from "@/components/auth/GoogleButton";

// Types
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  address: string;
  schoolId: string;
  phone: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  schoolId?: string;
  phone?: string;
  general?: string;
}

interface School {
  id?: string;
  _id?: string;
  school_name?: string;
  name?: string;
  school_code?: string;
}

// Phone number validation for Nigerian numbers
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  // Nigerian phone numbers: 11 digits starting with 0 (e.g., 08012345678)
  // Or with country code: +2348012345678
  const phoneRegex = /^(0[789][01]\d{8})$|^(\+234[789][01]\d{8})$/;
  return phoneRegex.test(phone);
};

const getStrength = (pw: string) => {
  const score = [
    pw.length >= 8,
    /[a-z]/.test(pw),
    /[A-Z]/.test(pw),
    /\d/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ].filter(Boolean).length;
  if (score <= 2) return { label: "Weak", color: "#EF4444", width: "20%" };
  if (score <= 3) return { label: "Fair", color: "#F59E0B", width: "50%" };
  if (score <= 4) return { label: "Good", color: "#3B82F6", width: "75%" };
  return { label: "Strong", color: "#10B981", width: "100%" };
};

const GENDER_OPTIONS = ["MALE", "FEMALE"];

const Register = () => {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    address: "",
    schoolId: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Schools state
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState<boolean>(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState<boolean>(false);
  const [schoolSearch, setSchoolSearch] = useState<string>("");

  // Filtered schools based on search
  const filteredSchools = schools.filter(school => {
    const searchTerm = schoolSearch.toLowerCase();
    const schoolName = (school.school_name || school.name || "").toLowerCase();
    const schoolCode = (school.school_code || "").toLowerCase();
    return schoolName.includes(searchTerm) || schoolCode.includes(searchTerm);
  });

  // Fetch all schools when step 2 is reached
  useEffect(() => {
    const fetchSchools = async () => {
      if (step !== 2) return;
      
      setLoadingSchools(true);
      try {
        const response = await ApiService.getAvailableSchools();
        
        let schoolsArray: School[] = [];
        if (response?.data?.schools && Array.isArray(response.data.schools)) {
          schoolsArray = response.data.schools;
        } else if (Array.isArray(response)) {
          schoolsArray = response;
        } else if (response?.data && Array.isArray(response.data)) {
          schoolsArray = response.data;
        } else if (response?.schools && Array.isArray(response.schools)) {
          schoolsArray = response.schools;
        }
        
        setSchools(schoolsArray);
      } catch (err) {
        console.error("Failed to fetch schools:", err);
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    
    fetchSchools();
  }, [step]);

  const set = (field: keyof FormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "", general: "" }));
  };

  const validateStep1 = (): boolean => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    // Phone validation in step 1
    if (!form.phone) {
      e.phone = "Phone number is required";
    } else if (!validatePhoneNumber(form.phone)) {
      e.phone = "Enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    if (!form.gender) e.gender = "Please select your gender";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.schoolId) e.schoolId = "Please select your school";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        gender: form.gender,
        country: form.country.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        schoolId: form.schoolId,
        phone: form.phone.trim(),
      });
      // Changed: Use query parameter instead of state for Next.js App Router
      router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || "";
      if (
        msg.includes("already exists") ||
        msg.includes("already registered")
      ) {
        setErrors({
          email: "An account with this email or username already exists.",
          general: "",
        });
        setStep(1);
      } else if (msg.includes("password") && msg.includes("do not match")) {
        setErrors({ confirmPassword: "Passwords do not match.", general: "" });
        setStep(1);
      } else if (msg.includes("username")) {
        setErrors({ username: "This username is already taken.", general: "" });
        setStep(1);
      } else {
        setErrors({
          general: err.message || "Registration failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const strength = form.password ? getStrength(form.password) : null;

  const inputBox = (field: keyof FormData): string =>
    `flex items-center gap-3 rounded-full px-4 py-3.5 transition-all duration-200 ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "bg-sand focus-within:bg-white focus-within:ring-1 focus-within:ring-ink/15"
    }`;

  const leftContent =
    step === 1
      ? {
          headline: "Join thousands of campus shoppers",
          sub: "Create your free account and start shopping or selling today. No hidden fees.",
          points: [
            { icon: "🛍️", text: "Browse 50,000+ products" },
            { icon: "🚚", text: "Fast campus delivery" },
            { icon: "💳", text: "Secure weekly payouts" },
            { icon: "🎓", text: "Student-first platform" },
          ],
        }
      : {
          headline: "Almost there! Just a few more details",
          sub: "Tell us where you're based so we can show you relevant sellers and delivery options.",
          points: [
            { icon: "📍", text: "Localised product listings" },
            { icon: "🏫", text: "Campus pickup available" },
            { icon: "🔒", text: "Your data is private & secure" },
            { icon: "⚡", text: "Account ready in seconds" },
          ],
        };

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      {/* LEFT PANEL */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-lilac via-sky/60 to-cream p-14 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-1/2 lg:flex-col lg:justify-center xl:w-[45%]">
        <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-peach/60 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-sm">
          <img
            src="/images/Jovo_off_logo2.png"
            alt="Jovo"
            className="h-10 w-auto object-contain"
          />

          <h2
            className="mt-8 font-display text-3xl font-semibold leading-[1.15] tracking-[-0.03em] text-ink"
          >
            {leftContent.headline}
          </h2>
          <p className="mb-8 mt-4 text-sm leading-relaxed text-ink/55">
            {leftContent.sub}
          </p>

          <div className="space-y-2.5 text-left">
            {leftContent.points.map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-2xl bg-white/65 px-4 py-3 ring-1 ring-ink/[.04]"
              >
                <span className="shrink-0 text-base">{icon}</span>
                <span className="text-[12.5px] font-medium text-ink/60">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 xl:w-[55%] min-h-screen flex flex-col relative">
        <button
          onClick={() => router.push("/")}
          className="absolute top-0 right-0 flex items-center gap-2 px-6 py-4 text-sm font-semibold text-ink transition-all hover:scale-[1.02] z-50"
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

        <div className="flex-1 flex items-center justify-center px-6 py-15 md:px-12 lg:px-16">
          <div className="w-full max-w-115">
            <img
              src="/images/Jovo_off_icon.png"
              alt="Jovo"
              className="md:w-75 w-auto object-cover cursor-pointer"
            />

            <div className="mb-7">
              <h1
                className="text-3xl font-semibold text-ink mb-1.5"
                style={{ fontFamily: "'Instrument Sans',sans-serif" }}
              >
                {step === 1 ? "Create Account" : "Where are you based?"}
              </h1>
              <p className="text-sm text-ink/40">
                {step === 1
                  ? "Free to join - takes less than 2 minutes"
                  : "Help us personalise your experience"}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-7">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      step > s
                        ? "text-cream"
                        : step === s
                          ? "text-cream"
                          : "bg-ink/10 text-ink/50"
                    }`}
                    style={
                      step >= s
                        ? {
                            background:
                              "#0E0E10",
                          }
                        : {}
                    }
                  >
                    {step > s ? <Check size={13} /> : s}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:block ${step === s ? "text-ink" : "text-ink/40"}`}
                  >
                    {s === 1 ? "Your Details" : "Location & School"}
                  </span>
                  {s < 2 && (
                    <FiChevronRight size={13} className="text-ink/25" />
                  )}
                </div>
              ))}
              <div className="flex-1 h-1 rounded-full bg-sand ml-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: step === 1 ? "50%" : "100%",
                    background: "#0E0E10",
                  }}
                />
              </div>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
                <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                      First Name
                    </label>
                    <div className={inputBox("firstName")}>
                      <FiUser
                        size={15}
                        className={
                          errors.firstName
                            ? "text-red-400 shrink-0"
                            : "text-ink/40 shrink-0"
                        }
                      />
                      <input
                        type="text"
                        placeholder="First"
                        value={form.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                      Last Name
                    </label>
                    <div className={inputBox("lastName")}>
                      <FiUser
                        size={15}
                        className={
                          errors.lastName
                            ? "text-red-400 shrink-0"
                            : "text-ink/40 shrink-0"
                        }
                      />
                      <input
                        type="text"
                        placeholder="Last"
                        value={form.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Email Address
                  </label>
                  <div className={inputBox("email")}>
                    <FiMail
                      size={15}
                      className={
                        errors.email
                          ? "text-red-400 shrink-0"
                          : "text-ink/40 shrink-0"
                      }
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Phone Number
                  </label>
                  <div className={inputBox("phone")}>
                    <FiPhone
                      size={15}
                      className={
                        errors.phone
                          ? "text-red-400 shrink-0"
                          : "text-ink/40 shrink-0"
                      }
                    />
                    <input
                      type="tel"
                      placeholder="08012345678 or +2348012345678"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                  <p className="text-[10px] text-ink/40 mt-1.5">
                    Enter a valid Nigerian phone number for delivery updates.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Username
                  </label>
                  <div className={inputBox("username")}>
                    <span className="text-ink/40 text-sm font-semibold shrink-0">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="choose a username"
                      value={form.username}
                      onChange={(e) =>
                        set("username", e.target.value.replace(/\s/g, ""))
                      }
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Password
                  </label>
                  <div className={inputBox("password")}>
                    <FiLock
                      size={15}
                      className={
                        errors.password
                          ? "text-red-400 shrink-0"
                          : "text-ink/40 shrink-0"
                      }
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="text-ink/40 hover:text-ink transition-colors shrink-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: strength.width,
                            background: strength.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-semibold w-10 text-right"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  )}
                  {form.password && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {[
                        {
                          label: "8+ characters",
                          ok: form.password.length >= 8,
                        },
                        { label: "Uppercase", ok: /[A-Z]/.test(form.password) },
                        { label: "Lowercase", ok: /[a-z]/.test(form.password) },
                        { label: "Number", ok: /\d/.test(form.password) },
                      ].map(({ label, ok }) => (
                        <div
                          key={label}
                          className={`flex items-center gap-1 text-[10px] transition-colors ${ok ? "text-green-600" : "text-ink/40"}`}
                        >
                          {ok ? (
                            <Check size={10} />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block shrink-0" />
                          )}
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Confirm Password
                  </label>
                  <div className={inputBox("confirmPassword")}>
                    <FiLock
                      size={15}
                      className={
                        errors.confirmPassword
                          ? "text-red-400 shrink-0"
                          : "text-ink/40 shrink-0"
                      }
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                    {form.confirmPassword &&
                      form.password === form.confirmPassword && (
                        <Check size={15} className="text-green-500 shrink-0" />
                      )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold text-sm text-cream transition-all duration-200 hover:opacity-90 hover:scale-[1.005] active:scale-[0.995] mt-1"
                  style={{
                    background: "#0E0E10",
                    boxShadow: "none",
                  }}
                >
                  Continue <FiChevronRight size={16} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-ink/10" />
                  <span className="text-xs text-ink/40 font-semibold whitespace-nowrap">
                    or sign up with
                  </span>
                  <div className="flex-1 h-px bg-ink/10" />
                </div>

                <GoogleButton isSignUp />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set("gender", g)}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-full border text-sm font-semibold transition-all duration-200 ${
                          form.gender === g
                            ? "border-[#0E0E10] text-ink"
                            : "border-ink/10 bg-sand text-ink/60 hover:border-ink/20 hover:bg-white"
                        }`}
                        style={
                          form.gender === g
                            ? { background: "rgba(180,34,37,0.06)" }
                            : {}
                        }
                      >
                        <span className="text-lg">
                          {g === "MALE" ? "👨" : "👩"}
                        </span>
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Country
                  </label>
                  <div className={inputBox("country")}>
                    <FiMapPin
                      size={15}
                      className={
                        errors.country
                          ? "text-red-400 shrink-0"
                          : "text-ink/40 shrink-0"
                      }
                    />
                    <input
                      type="text"
                      placeholder="e.g. Nigeria"
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                  </div>
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                      State
                    </label>
                    <div className={inputBox("state")}>
                      <input
                        type="text"
                        placeholder="e.g. Imo"
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                        className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                      />
                    </div>
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                      City
                    </label>
                    <div className={inputBox("city")}>
                      <input
                        type="text"
                        placeholder="e.g. Owerri"
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                      />
                    </div>
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    School / Institution <span className="text-ink">*</span>
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                      className={`w-full flex items-center justify-between gap-3 rounded-full px-4 py-3.5 transition-all duration-200 ${
                        errors.schoolId
                          ? "border-red-400 bg-red-50"
                          : "border-ink/10 bg-sand hover:border-ink/20 focus-within:border-[#0E0E10]"
                      }`}
                      disabled={loadingSchools}
                    >
                      <div className="flex items-center gap-3">
                        <FiBookOpen size={18} className={errors.schoolId ? "text-red-400" : "text-ink/40"} />
                        <span className={`text-sm ${form.schoolId ? "text-ink font-medium" : "text-ink/40"}`}>
                          {form.schoolId 
                            ? schools.find(s => (s.id || s._id) === form.schoolId)?.school_name || 
                              schools.find(s => (s.id || s._id) === form.schoolId)?.name || 
                              "Select your school"
                            : "Select your school"}
                        </span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${schoolDropdownOpen ? "rotate-180" : ""}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {schoolDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
                          onClick={() => setSchoolDropdownOpen(false)}
                        />
                        
                        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-ink/10 bg-white shadow-xl overflow-hidden sm:max-h-80 sm:overflow-y-auto
                                      sm:rounded-2xl sm:shadow-lift bottom-0 rounded-b-none rounded-t-2xl sm:relative
                                      transform transition-transform duration-300 ease-in-out
                                      sm:transform-none">
                          
                          <div className="flex items-center justify-between p-4 border-b border-ink/10 sm:hidden">
                            <h3 className="font-semibold text-ink">Select School</h3>
                            <button 
                              onClick={() => setSchoolDropdownOpen(false)}
                              className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-ink/60"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="p-3 border-b border-ink/10">
                            <div className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 bg-sand">
                              <FiSearch size={14} className="text-ink/40" />
                              <input
                                type="text"
                                placeholder="Search school..."
                                value={schoolSearch}
                                onChange={(e) => setSchoolSearch(e.target.value)}
                                className="flex-1 text-sm text-ink outline-none bg-transparent"
                                autoFocus
                              />
                              {schoolSearch && (
                                <button onClick={() => setSchoolSearch("")} className="text-ink/40 hover:text-ink">
                                  <FiX size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto sm:max-h-56">
                            {loadingSchools ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-ink rounded-full animate-spin" />
                                <span className="ml-2 text-sm text-ink/50">Loading schools...</span>
                              </div>
                            ) : filteredSchools.length === 0 ? (
                              <div className="text-center py-8">
                                <FiBookOpen size={32} className="text-ink/25 mx-auto mb-2" />
                                <p className="text-sm text-ink/50">No schools found</p>
                                <p className="text-xs text-ink/40 mt-1">Try a different search or contact support</p>
                              </div>
                            ) : (
                              filteredSchools.map((school) => {
                                const isSelected = (school.id || school._id) === form.schoolId;
                                return (
                                  <button
                                    key={school.id || school._id}
                                    type="button"
                                    onClick={() => {
                                      set("schoolId", school.id || school._id || "");
                                      setSchoolDropdownOpen(false);
                                      setSchoolSearch("");
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-ink/5 ${
                                      isSelected ? "bg-ink/5" : ""
                                    }`}
                                  >
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${isSelected ? "text-ink" : "text-ink"}`}>
                                        {school.school_name || school.name}
                                      </p>
                                      {school.school_code && (
                                        <p className="text-xs text-ink/40 mt-0.5">Code: {school.school_code}</p>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <FiCheckIcon size={16} className="text-ink shrink-0" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          
                          <div className="p-4 border-t border-ink/10 sm:hidden">
                            <button
                              onClick={() => setSchoolDropdownOpen(false)}
                              className="w-full py-3 rounded-xl font-semibold text-sm text-cream bg-[#0E0E10]"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {errors.schoolId && (
                    <p className="text-xs text-red-500 mt-1">{errors.schoolId}</p>
                  )}
                  <p className="text-[10px] text-ink/40 mt-1.5">
                    Select your school to connect with campus-specific deals and sellers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1.5">
                    Address{" "}
                    <span className="text-ink/40 font-normal normal-case tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <div className={inputBox("address")}>
                    <FiMapPin size={15} className="text-ink/40 shrink-0" />
                    <input
                      type="text"
                      placeholder="Street address"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink/30 min-w-0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-5 py-4 rounded-full font-semibold text-sm text-ink/60 bg-sand hover:bg-ink/10 transition-all duration-200 shrink-0"
                  >
                    <FiChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-semibold text-sm text-cream transition-all duration-200 hover:opacity-90 hover:scale-[1.005] active:scale-[0.995] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "#0E0E10",
                      boxShadow: "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center mt-6 text-sm text-ink/50">
              Already have an account?{" "}
              <Link href="/login"
                className="font-semibold hover:underline transition-colors"
                style={{ color: "#0E0E10" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;