"use client";
import { useState, useContext, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import {
  FiMapPin,
  FiAlertCircle,
  FiBookOpen,
  FiSearch,
  FiX,
  FiCheck as FiCheckIcon,
  FiPhone,
} from "react-icons/fi";
import { User as LUser, Users as LUsers } from "lucide-react";
import Image from "next/image";

const GENDER_OPTIONS = ["MALE", "FEMALE"];

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^(0[789][01]\d{8})$|^(\+234[789][01]\d{8})$/;
  return phoneRegex.test(phone);
};

interface School {
  id?: string;
  _id?: string;
  school_name?: string;
  name?: string;
  school_code?: string;
}

interface FormState {
  username: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  address: string;
  schoolId: string;
  phone: string;
}

interface FormErrors {
  username?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  schoolId?: string;
  phone?: string;
  address?: string;
  general?: string;
}

function CompleteProfileContent() {
  const { user, completeProfile } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || user?.email || "";

  const [form, setForm] = useState<FormState>({
    username: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    address: "",
    schoolId: "",
    phone: "",
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");

  const filteredSchools = schools.filter((school) => {
    const term = schoolSearch.toLowerCase();
    const name = (school.school_name || school.name || "").toLowerCase();
    const code = (school.school_code || "").toLowerCase();
    return name.includes(term) || code.includes(term);
  });

  useEffect(() => {
    if (user?.username && user?.gender && user?.country) {
      router.push("/shop");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchSchools = async () => {
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
  }, []);

  const set = (field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "", general: "" }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.gender) e.gender = "Please select your gender";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.schoolId) e.schoolId = "Please select your school";
    if (!form.phone) {
      e.phone = "Phone number is required";
    } else if (!validatePhoneNumber(form.phone)) {
      e.phone =
        "Enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await completeProfile({
        username: form.username.trim(),
        gender: form.gender,
        country: form.country.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        schoolId: form.schoolId,
        phone: form.phone.trim(),
      });
      router.push("/shop");
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to complete profile" });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: keyof FormErrors) =>
    `flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50 focus-within:border-[#B42225] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(180,34,37,0.08)]"
    }`;

  const selectedSchool = schools.find((s) => (s.id || s._id) === form.schoolId);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "#F4F5F9" }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/Jovo_off_icon.png"
            alt="Jovo"
            className="h-16 object-cover"
            width={64}
            height={64}
          />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1
              className="text-2xl font-black text-gray-900 mb-2"
              style={{ fontFamily: "'Georgia',serif" }}
            >
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-500">
              Just a few more details to get started
            </p>
            {email && <p className="text-xs text-gray-400 mt-2">{email}</p>}
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
              <FiAlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Username
              </label>
              <div className={inputCls("username")}>
                <span className="text-gray-400 text-sm font-bold shrink-0">@</span>
                <input
                  type="text"
                  placeholder="choose a username"
                  value={form.username}
                  onChange={(e) =>
                    set("username", e.target.value.replace(/\s/g, ""))
                  }
                  className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Phone Number
              </label>
              <div className={inputCls("phone")}>
                <FiPhone
                  size={15}
                  className={`shrink-0 ${errors.phone ? "text-red-400" : "text-gray-400"}`}
                />
                <input
                  type="tel"
                  placeholder="08012345678 or +2348012345678"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5">
                Enter a valid Nigerian phone number for delivery updates.
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set("gender", g)}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-sm font-bold transition-all ${
                      form.gender === g
                        ? "border-[#B42225] text-[#B42225] bg-[#B42225]/5"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {g === "MALE" ? (
                      <LUser
                        size={16}
                        className={
                          form.gender === g ? "text-[#B42225]" : "text-gray-400"
                        }
                      />
                    ) : (
                      <LUsers
                        size={16}
                        className={
                          form.gender === g ? "text-[#B42225]" : "text-gray-400"
                        }
                      />
                    )}
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Country
              </label>
              <div className={inputCls("country")}>
                <FiMapPin
                  size={15}
                  className={`shrink-0 ${errors.country ? "text-red-400" : "text-gray-400"}`}
                />
                <input
                  type="text"
                  placeholder="e.g. Nigeria"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                />
              </div>
              {errors.country && (
                <p className="text-xs text-red-500 mt-1">{errors.country}</p>
              )}
            </div>

            {/* State + City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  State
                </label>
                <div className={inputCls("state")}>
                  <input
                    type="text"
                    placeholder="e.g. Imo"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                  />
                </div>
                {errors.state && (
                  <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  City
                </label>
                <div className={inputCls("city")}>
                  <input
                    type="text"
                    placeholder="e.g. Owerri"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                  />
                </div>
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                )}
              </div>
            </div>

            {/* School — position:relative + z-index so dropdown clears siblings below */}
            <div className="relative" style={{ zIndex: 20 }}>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                School / Institution <span className="text-[#B42225]">*</span>
              </label>
              <div className="relative">
                {/* trigger button */}
                <button
                  type="button"
                  onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                  className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                    errors.schoolId
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                  disabled={loadingSchools}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FiBookOpen
                      size={15}
                      className={`shrink-0 ${errors.schoolId ? "text-red-400" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm truncate ${
                        form.schoolId ? "text-gray-800 font-medium" : "text-gray-400"
                      }`}
                    >
                      {selectedSchool
                        ? selectedSchool.school_name || selectedSchool.name
                        : "Select your school"}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      schoolDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* dropdown panel */}
                {schoolDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 z-50 mt-2 rounded-2xl bg-white overflow-hidden"
                    style={{
                      boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                      border: "1px solid #F0F0F0",
                    }}
                  >
                    {/* search */}
                    <div className="p-3 border-b border-gray-100">
                      <div
                        className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 bg-gray-50"
                      >
                        <FiSearch size={13} className="text-gray-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search school..."
                          value={schoolSearch}
                          onChange={(e) => setSchoolSearch(e.target.value)}
                          className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
                          autoFocus
                        />
                        {schoolSearch && (
                          <button
                            type="button"
                            onClick={() => setSchoolSearch("")}
                            className="text-gray-400 hover:text-gray-600 shrink-0"
                          >
                            <FiX size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* list */}
                    <div className="max-h-56 overflow-y-auto">
                      {loadingSchools ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#B42225] rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">
                            Loading schools...
                          </span>
                        </div>
                      ) : filteredSchools.length === 0 ? (
                        <div className="text-center py-8">
                          <FiBookOpen
                            size={28}
                            className="text-gray-300 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-500">
                            No schools found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try a different search or contact support
                          </p>
                        </div>
                      ) : (
                        filteredSchools.map((school) => {
                          const schoolId = school.id || school._id || "";
                          const isSelected = schoolId === form.schoolId;
                          return (
                            <button
                              key={schoolId}
                              type="button"
                              onClick={() => {
                                set("schoolId", schoolId);
                                setSchoolDropdownOpen(false);
                                setSchoolSearch("");
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                                isSelected ? "bg-[#B42225]/5" : ""
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    isSelected
                                      ? "text-[#B42225]"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {school.school_name || school.name}
                                </p>
                                {school.school_code && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Code: {school.school_code}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <FiCheckIcon
                                  size={15}
                                  className="text-[#B42225] shrink-0 ml-2"
                                />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {errors.schoolId && (
                <p className="text-xs text-red-500 mt-1">{errors.schoolId}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5">
                Select your school for campus-specific deals and sellers.
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Address{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className={inputCls("address")}>
                <FiMapPin size={15} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,#B42225,#FF6B00)",
                boxShadow: "0 6px 28px rgba(180,34,37,0.3)",
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheckIcon size={16} />
              )}
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F5F9]">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#B42225] rounded-full animate-spin" />
        </div>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}