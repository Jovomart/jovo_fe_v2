'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useContext, useEffect } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import {
  FiUser, FiMail, FiLock, FiMapPin, FiAlertCircle,
  FiChevronRight, FiChevronLeft, FiBookOpen, FiSearch,
  FiX, FiCheck as FiCheckIcon, FiPhone,
} from "react-icons/fi";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import GoogleButton from "@/components/auth/GoogleButton";

interface FormData {
  firstName: string; lastName: string; email: string; username: string;
  password: string; confirmPassword: string; gender: string; country: string;
  state: string; city: string; address: string; schoolId: string; phone: string;
}
interface Errors {
  firstName?: string; lastName?: string; email?: string; username?: string;
  password?: string; confirmPassword?: string; gender?: string; country?: string;
  state?: string; city?: string; schoolId?: string; phone?: string; general?: string;
}
interface School { id?: string; _id?: string; school_name?: string; name?: string; school_code?: string; }

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^(0[789][01]\d{8})$|^(\+234[789][01]\d{8})$/;
  return phoneRegex.test(phone);
};

const getStrength = (pw: string) => {
  const score = [pw.length >= 8, /[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 2) return { label: "Weak",   color: "#EF4444", width: "20%" };
  if (score <= 3) return { label: "Fair",   color: "#F59E0B", width: "50%" };
  if (score <= 4) return { label: "Good",   color: "#3B82F6", width: "75%" };
  return             { label: "Strong", color: "#10B981", width: "100%" };
};

const GENDER_OPTIONS = ["MALE", "FEMALE"];

const Register = () => {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "", username: "", password: "",
    confirmPassword: "", gender: "", country: "", state: "", city: "",
    address: "", schoolId: "", phone: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState<boolean>(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState<boolean>(false);
  const [schoolSearch, setSchoolSearch] = useState<string>("");

  const filteredSchools = schools.filter(school => {
    const searchTerm = schoolSearch.toLowerCase();
    const schoolName = (school.school_name || school.name || "").toLowerCase();
    const schoolCode = (school.school_code || "").toLowerCase();
    return schoolName.includes(searchTerm) || schoolCode.includes(searchTerm);
  });

  useEffect(() => {
    const fetchSchools = async () => {
      if (step !== 2) return;
      setLoadingSchools(true);
      try {
        const response = await ApiService.getAvailableSchools();
        let schoolsArray: School[] = [];
        if (response?.data?.schools && Array.isArray(response.data.schools)) schoolsArray = response.data.schools;
        else if (Array.isArray(response)) schoolsArray = response;
        else if (response?.data && Array.isArray(response.data)) schoolsArray = response.data;
        else if (response?.schools && Array.isArray(response.schools)) schoolsArray = response.schools;
        setSchools(schoolsArray);
      } catch (err) { console.error("Failed to fetch schools:", err); setSchools([]); }
      finally { setLoadingSchools(false); }
    };
    fetchSchools();
  }, [step]);

  const set = (field: keyof FormData, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "", general: "" }));
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
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.phone) e.phone = "Phone number is required";
    else if (!validatePhoneNumber(form.phone)) e.phone = "Enter a valid Nigerian phone number (e.g., 08012345678)";
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

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), username: form.username.trim(),
        password: form.password, confirmPassword: form.confirmPassword,
        gender: form.gender, country: form.country.trim(), state: form.state.trim(),
        city: form.city.trim(), address: form.address.trim(),
        schoolId: form.schoolId, phone: form.phone.trim(),
      });
      router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("already exists") || msg.includes("already registered")) {
        setErrors({ email: "An account with this email or username already exists.", general: "" }); setStep(1);
      } else if (msg.includes("password") && msg.includes("do not match")) {
        setErrors({ confirmPassword: "Passwords do not match.", general: "" }); setStep(1);
      } else if (msg.includes("username")) {
        setErrors({ username: "This username is already taken.", general: "" }); setStep(1);
      } else {
        setErrors({ general: err.message || "Registration failed. Please try again." });
      }
    } finally { setLoading(false); }
  };

  const strength = form.password ? getStrength(form.password) : null;

  const inputBox = (field: keyof FormData): string =>
    `input-wrap flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;
  const inputBg = (field: keyof FormData) =>
    ({ background: errors[field] ? "#fff5f5" : "#F8F8F8" } as React.CSSProperties);
  const iconColor = (field: keyof FormData) =>
    errors[field] ? "text-red-400 shrink-0" : "text-gray-400 shrink-0";

  const leftContent = step === 1
    ? { headline: "Join Nigeria's #1 campus marketplace", sub: "Free to join. Thousands of students already shopping and selling every day.", points: [{ icon: "🛍️", text: "50,000+ products" }, { icon: "🚚", text: "Fast campus delivery" }, { icon: "💳", text: "Secure payments" }, { icon: "🎓", text: "Student-first platform" }] }
    : { headline: "Almost there — just a few more details", sub: "Help us personalise your experience with local sellers and delivery options.", points: [{ icon: "📍", text: "Localised listings" }, { icon: "🏫", text: "Campus pickup available" }, { icon: "🔒", text: "Your data is private" }, { icon: "⚡", text: "Account ready instantly" }] };

  return (
    <>
      <style>{`
        @keyframes orb-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(15px,-25px) scale(1.08); }
          66%      { transform: translate(-10px,12px) scale(0.95); }
        }
        @keyframes ring-rot     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ring-rot-rev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes step-pop {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .orb-a { animation: orb-drift 9s  ease-in-out infinite; will-change: transform; }
        .orb-b { animation: orb-drift 13s ease-in-out infinite reverse; will-change: transform; }
        .orb-c { animation: orb-drift 7s  ease-in-out infinite 2s; will-change: transform; }
        .ring-a { animation: ring-rot     28s linear infinite; will-change: transform; }
        .ring-b { animation: ring-rot-rev 20s linear infinite; will-change: transform; }
        .fade-up-1 { animation: fade-up 0.5s ease-out 0.05s both; }
        .fade-up-2 { animation: fade-up 0.5s ease-out 0.12s both; }
        .fade-up-3 { animation: fade-up 0.5s ease-out 0.20s both; }
        .fade-up-4 { animation: fade-up 0.5s ease-out 0.28s both; }
        .fade-up-5 { animation: fade-up 0.5s ease-out 0.36s both; }
        .step-pop  { animation: step-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .input-wrap { transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
        .input-wrap:focus-within {
          border-color: #B42225 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(180,34,37,0.09);
        }
        .jovo-btn {
          background: linear-gradient(270deg,#B42225,#FF6B00,#FF9500,#FF6B00,#B42225);
          background-size: 400% 100%;
          transition: background-position 0.6s ease, box-shadow 0.3s ease, transform 0.15s ease;
        }
        .jovo-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 10px 36px rgba(180,34,37,0.45);
          transform: translateY(-1px) scale(1.005);
        }
        .jovo-btn:active:not(:disabled) { transform: scale(0.99); }
        .school-option:hover { background: #fdf5f5; }
        .school-option.selected { background: rgba(180,34,37,0.05); }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#F4F5F9" }}>

        {/* ══ LEFT PANEL ══ */}
        <div className="hidden lg:flex lg:w-[42%] xl:w-[44%] sticky top-0 h-screen flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(145deg,#080202 0%,#130404 35%,#220808 65%,#B42225 130%)" }}>
          <div className="orb-a absolute top-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,107,0,0.25),transparent 65%)" }} />
          <div className="orb-b absolute bottom-[-100px] left-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(180,34,37,0.3),transparent 65%)" }} />
          <div className="orb-c absolute top-[40%] left-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,149,0,0.15),transparent 65%)" }} />
          <div className="ring-a absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[680px] h-[680px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.04)" }} />
          </div>
          <div className="ring-b absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full" style={{ border: "1px dashed rgba(180,34,37,0.14)" }} />
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-[0.045]"
            style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />

          <div className="relative z-10 flex flex-col items-center text-center max-w-[280px] w-full px-6">
            <img src="/images/Jovo_off_logo2.png" alt="Jovo" className="w-24 object-cover" />
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-2">
              {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
            </div>
            <h2 className="text-[1.85rem] font-black text-white leading-[1.15] mb-3"
              style={{ fontFamily: "'Georgia',serif" }}>
              <span style={{ background: "linear-gradient(90deg,#fca5a5,#fdba74)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {leftContent.headline}
              </span>
            </h2>
            <p className="text-white/35 text-[12.5px] leading-relaxed mb-8">{leftContent.sub}</p>
            <div className="w-full space-y-2.5">
              {leftContent.points.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <span className="text-base shrink-0">{icon}</span>
                  <span className="text-[12px] text-white/50 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="w-full lg:w-[58%] xl:w-[56%] min-h-screen flex flex-col relative bg-white">
          <button onClick={() => router.push("/")}
            className="absolute top-0 right-0 flex items-center gap-1.5 px-6 py-5 text-[13px] font-black text-[#B42225] hover:opacity-75 transition-opacity z-50">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 19l-7-7 7-7m6 0l-7 7 7 7" />
            </svg>
            Back to Home
          </button>

          <div className="flex-1 flex items-center justify-center px-6 py-16 md:px-12 lg:px-14">
            <div className="w-full max-w-[440px]">

              {/* mobile logo */}
              <img src="/images/Jovo_official_logo.png" alt="Jovo" className="w-24 object-cover mb-5 lg:hidden" />

              {/* heading */}
              <div className="fade-up-1 mb-6">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B42225] mb-2.5">
                  Create Account
                </div>
                <h1 className="text-[2rem] font-black text-gray-900 leading-[1.1] mb-1.5"
                  style={{ fontFamily: "'Georgia',serif" }}>
                  {step === 1 ? "Let's get started" : "Where are you based?"}
                </h1>
                <p className="text-[13px] text-gray-400">
                  {step === 1 ? "Free to join — takes less than 2 minutes" : "Help us personalise your experience"}
                </p>
              </div>

              {/* step indicator */}
              <div className="fade-up-2 flex items-center gap-3 mb-7">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <div className={`step-pop w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black transition-all duration-300 ${
                      step > s ? "text-white" : step === s ? "text-white" : "text-gray-400"
                    }`} style={step >= s ? { background: "linear-gradient(135deg,#B42225,#FF6B00)" } : { background: "#F0F0F0" }}>
                      {step > s ? <Check size={13} /> : s}
                    </div>
                    <span className={`text-[12px] font-bold hidden sm:block transition-colors ${step === s ? "text-gray-800" : "text-gray-350"}`}
                      style={{ color: step === s ? "#1a1a1a" : "#C0C0C0" }}>
                      {s === 1 ? "Your Details" : "Location & School"}
                    </span>
                    {s < 2 && <FiChevronRight size={12} style={{ color: "#DEDEDE" }} />}
                  </div>
                ))}
                <div className="flex-1 h-1 rounded-full ml-2 overflow-hidden" style={{ background: "#F0F0F0" }}>
                  <div className="h-full rounded-full transition-all duration-600"
                    style={{ width: step === 1 ? "50%" : "100%", background: "linear-gradient(90deg,#B42225,#FF6B00)" }} />
                </div>
              </div>

              {errors.general && (
                <div className="fade-up-2 flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 text-sm text-red-600"
                  style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
                  <FiAlertCircle size={14} className="shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="fade-up-2 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">First Name</label>
                      <div className={inputBox("firstName")} style={inputBg("firstName")}>
                        <FiUser size={14} className={iconColor("firstName")} />
                        <input type="text" placeholder="First" value={form.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                          className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                      </div>
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Last Name</label>
                      <div className={inputBox("lastName")} style={inputBg("lastName")}>
                        <FiUser size={14} className={iconColor("lastName")} />
                        <input type="text" placeholder="Last" value={form.lastName}
                          onChange={(e) => set("lastName", e.target.value)}
                          className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                      </div>
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="fade-up-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
                    <div className={inputBox("email")} style={inputBg("email")}>
                      <FiMail size={14} className={iconColor("email")} />
                      <input type="email" placeholder="your@email.com" value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="fade-up-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Phone Number</label>
                    <div className={inputBox("phone")} style={inputBg("phone")}>
                      <FiPhone size={14} className={iconColor("phone")} />
                      <input type="tel" placeholder="08012345678 or +2348012345678" value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    <p className="text-[10px] text-gray-400 mt-1.5">Valid Nigerian number for delivery updates.</p>
                  </div>

                  <div className="fade-up-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Username</label>
                    <div className={inputBox("username")} style={inputBg("username")}>
                      <span className="text-gray-400 text-sm font-black shrink-0">@</span>
                      <input type="text" placeholder="choose a username" value={form.username}
                        onChange={(e) => set("username", e.target.value.replace(/\s/g, ""))}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                    </div>
                    {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                  </div>

                  <div className="fade-up-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Password</label>
                    <div className={inputBox("password")} style={inputBg("password")}>
                      <FiLock size={14} className={iconColor("password")} />
                      <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {strength && (
                      <div className="mt-2 flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EBEBEB" }}>
                          <div className="h-full rounded-full transition-all duration-400"
                            style={{ width: strength.width, background: strength.color }} />
                        </div>
                        <span className="text-[10px] font-black w-10 text-right" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    )}
                    {form.password && (
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {[
                          { label: "8+ characters", ok: form.password.length >= 8 },
                          { label: "Uppercase",     ok: /[A-Z]/.test(form.password) },
                          { label: "Lowercase",     ok: /[a-z]/.test(form.password) },
                          { label: "Number",        ok: /\d/.test(form.password) },
                        ].map(({ label, ok }) => (
                          <div key={label} className={`flex items-center gap-1 text-[10px] transition-colors ${ok ? "text-green-600" : "text-gray-400"}`}>
                            {ok ? <Check size={10} /> : <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block shrink-0" />}
                            {label}
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <div className="fade-up-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Confirm Password</label>
                    <div className={inputBox("confirmPassword")} style={inputBg("confirmPassword")}>
                      <FiLock size={14} className={iconColor("confirmPassword")} />
                      <input type={showPassword ? "text" : "password"} placeholder="Repeat your password" value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                      {form.confirmPassword && form.password === form.confirmPassword && (
                        <Check size={14} className="text-green-500 shrink-0" />
                      )}
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="fade-up-5 pt-1">
                    <button type="button" onClick={handleNext}
                      className="jovo-btn w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[14px] text-white">
                      Continue <FiChevronRight size={16} />
                    </button>
                  </div>

                  <div className="fade-up-5 flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: "#EBEBEB" }} />
                    <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap px-1">or sign up with</span>
                    <div className="flex-1 h-px" style={{ background: "#EBEBEB" }} />
                  </div>

                  <div className="fade-up-5"><GoogleButton isSignUp /></div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* gender */}
                  <div className="fade-up-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                      {GENDER_OPTIONS.map((g) => (
                        <button key={g} type="button" onClick={() => set("gender", g)}
                          className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border text-[13px] font-bold transition-all duration-200"
                          style={form.gender === g
                            ? { borderColor: "#B42225", color: "#B42225", background: "rgba(180,34,37,0.05)" }
                            : { borderColor: "#E5E7EB", background: "#F8F8F8", color: "#4B5563" }}>
                          <span className="text-lg">{g === "MALE" ? "👨" : "👩"}</span>
                          {g.charAt(0) + g.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                  </div>

                  {/* country */}
                  <div className="fade-up-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Country</label>
                    <div className={inputBox("country")} style={inputBg("country")}>
                      <FiMapPin size={14} className={iconColor("country")} />
                      <input type="text" placeholder="e.g. Nigeria" value={form.country}
                        onChange={(e) => set("country", e.target.value)}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                    </div>
                    {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                  </div>

                  {/* state + city */}
                  <div className="fade-up-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">State</label>
                      <div className={inputBox("state")} style={inputBg("state")}>
                        <input type="text" placeholder="e.g. Imo" value={form.state}
                          onChange={(e) => set("state", e.target.value)}
                          className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                      </div>
                      {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">City</label>
                      <div className={inputBox("city")} style={inputBg("city")}>
                        <input type="text" placeholder="e.g. Owerri" value={form.city}
                          onChange={(e) => set("city", e.target.value)}
                          className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                      </div>
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  {/* school */}
                  <div className="fade-up-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      School / Institution <span style={{ color: "#B42225" }}>*</span>
                    </label>
                    <div className="relative">
                      <button type="button" onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)} disabled={loadingSchools}
                        className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                          errors.schoolId ? "border-red-400" : "border-gray-200 hover:border-gray-300"
                        }`} style={{ background: errors.schoolId ? "#fff5f5" : "#F8F8F8" }}>
                        <div className="flex items-center gap-3">
                          <FiBookOpen size={15} className={errors.schoolId ? "text-red-400" : "text-gray-400"} />
                          <span className={`text-[13px] ${form.schoolId ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                            {form.schoolId
                              ? schools.find(s => (s.id || s._id) === form.schoolId)?.school_name ||
                                schools.find(s => (s.id || s._id) === form.schoolId)?.name || "Select your school"
                              : "Select your school"}
                          </span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${schoolDropdownOpen ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {schoolDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
                            onClick={() => setSchoolDropdownOpen(false)} />
                          <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-white overflow-hidden sm:max-h-72 sm:overflow-y-auto"
                            style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.14)", border: "1px solid #F0F0F0" }}>
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 sm:hidden">
                              <h3 className="font-black text-gray-800 text-sm">Select School</h3>
                              <button onClick={() => setSchoolDropdownOpen(false)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">✕</button>
                            </div>
                            <div className="p-3 border-b border-gray-100">
                              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5" style={{ background: "#F8F8F8" }}>
                                <FiSearch size={13} className="text-gray-400" />
                                <input type="text" placeholder="Search school..." value={schoolSearch}
                                  onChange={(e) => setSchoolSearch(e.target.value)} autoFocus
                                  className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400" />
                                {schoolSearch && (
                                  <button onClick={() => setSchoolSearch("")} className="text-gray-400 hover:text-gray-600">
                                    <FiX size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                              {loadingSchools ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#B42225] rounded-full animate-spin" />
                                  <span className="text-sm text-gray-500">Loading schools...</span>
                                </div>
                              ) : filteredSchools.length === 0 ? (
                                <div className="text-center py-8">
                                  <FiBookOpen size={28} className="text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">No schools found</p>
                                  <p className="text-xs text-gray-400 mt-1">Try a different search</p>
                                </div>
                              ) : (
                                filteredSchools.map((school) => {
                                  const isSelected = (school.id || school._id) === form.schoolId;
                                  return (
                                    <button key={school.id || school._id} type="button"
                                      onClick={() => { set("schoolId", school.id || school._id || ""); setSchoolDropdownOpen(false); setSchoolSearch(""); }}
                                      className={`school-option w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? "selected" : ""}`}>
                                      <div>
                                        <p className={`text-[13px] font-medium ${isSelected ? "text-[#B42225]" : "text-gray-800"}`}>
                                          {school.school_name || school.name}
                                        </p>
                                        {school.school_code && (
                                          <p className="text-[11px] text-gray-400 mt-0.5">Code: {school.school_code}</p>
                                        )}
                                      </div>
                                      {isSelected && <FiCheckIcon size={15} style={{ color: "#B42225" }} />}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                            <div className="p-4 border-t border-gray-100 sm:hidden">
                              <button onClick={() => setSchoolDropdownOpen(false)}
                                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                                style={{ background: "linear-gradient(135deg,#B42225,#FF6B00)" }}>
                                Done
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {errors.schoolId && <p className="text-xs text-red-500 mt-1">{errors.schoolId}</p>}
                    <p className="text-[10px] text-gray-400 mt-1.5">Select your school for campus-specific deals and sellers.</p>
                  </div>

                  {/* address */}
                  <div className="fade-up-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Address <span className="text-gray-300 font-normal normal-case tracking-normal text-[10px]">(optional)</span>
                    </label>
                    <div className={inputBox("address")} style={{ background: "#F8F8F8" }}>
                      <FiMapPin size={14} className="text-gray-400 shrink-0" />
                      <input type="text" placeholder="Street address" value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        className="flex-1 text-[13px] text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0" />
                    </div>
                  </div>

                  {/* nav buttons */}
                  <div className="fade-up-5 flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 px-5 py-4 rounded-2xl font-bold text-[13px] text-gray-600 transition-all hover:bg-gray-200"
                      style={{ background: "#F0F0F0" }}>
                      <FiChevronLeft size={15} /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="jovo-btn flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[14px] text-white disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : "Create Account →"}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-center mt-6 text-[13px] text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-black hover:opacity-75 transition-opacity" style={{ color: "#B42225" }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;