"use client";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiSave,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiBell,
  FiLock,
  FiGlobe,
  FiMoon,
  FiSun,
  FiLogOut,
  FiChevronRight,
  FiEdit3,
  FiSmartphone,
  FiMap,
  FiSettings,
  FiBriefcase,
  FiHome,
  FiUserCheck,
  FiShieldOff,
} from "react-icons/fi";
import Footer from "@/components/layout/Footer";

// Types
interface User {
  first_name?: string;
  last_name?: string;
  username?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  phone?: string;
  school_id?: string;
  schoolId?: string;
  email?: string;
  full_name?: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
}

interface Errors {
  first_name?: string;
  last_name?: string;
  username?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  phone?: string;
  school?: string;
  general?: string;
}

interface School {
  id?: string;
  _id?: string;
  school_name?: string;
  name?: string;
  school_code?: string;
}

interface Preferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  language: string;
}

// Phone number validation
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^(0[789][01]\d{8})$/;
  return phoneRegex.test(phone);
};

const GENDER_OPTIONS = ["MALE", "FEMALE"];

const Settings = () => {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const router = useRouter();

  // Profile edit state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("profile");

  // Form state
  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    username: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    address: "",
    phone: "",
  });

  // Schools state
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: "English",
  });

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
    } finally {
      setLoadingSchools(false);
    }
  };

  // Load user data
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        gender: user.gender || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        address: user.address || "",
        phone: user.phone || "",
      }); // eslint-disable-line react-hooks/set-state-in-effect
      setSelectedSchoolId(user.school_id || user.schoolId || "");
    }
    fetchSchools();
  }, [user]);

  const filteredSchools = schools.filter((school) => {
    const searchTerm = schoolSearch.toLowerCase();
    const schoolName = (school.school_name || school.name || "").toLowerCase();
    const schoolCode = (school.school_code || "").toLowerCase();
    return schoolName.includes(searchTerm) || schoolCode.includes(searchTerm);
  });

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!form.first_name?.trim())
      newErrors.first_name = "First name is required";
    if (!form.last_name?.trim()) newErrors.last_name = "Last name is required";
    if (!form.username?.trim()) newErrors.username = "Username is required";
    if (!form.gender) newErrors.gender = "Please select your gender";
    if (!form.country?.trim()) newErrors.country = "Country is required";
    if (!form.state?.trim()) newErrors.state = "State is required";
    if (!form.city?.trim()) newErrors.city = "City is required";
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(form.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!selectedSchoolId) newErrors.school = "Please select your school";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess("");
    setErrors({});

    try {
      await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        gender: form.gender,
        country: form.country,
        state: form.state,
        city: form.city,
        address: form.address,
        phone: form.phone,
        school_id: selectedSchoolId,
      });

      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  if (!user) return null;

  const displayName =
    `${form.first_name} ${form.last_name}`.trim() || user.username || "User";
  const initials = (form.first_name?.[0] || "") + (form.last_name?.[0] || "");

  const tabs = [
    {
      id: "profile",
      label: "Profile Information",
      icon: FiUser,
      color: "#B42225",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: FiBell,
      color: "#10B981",
    },
    { id: "security", label: "Security", icon: FiLock, color: "#F59E0B" },
    {
      id: "preferences",
      label: "Preferences",
      icon: FiGlobe,
      color: "#8B5CF6",
    },
  ];

  const inputFieldClass = (field: keyof Errors): string =>
    `w-full rounded-2xl border px-5 py-3.5 text-sm transition-all duration-200 ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B42225]/20"
    }`;

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* Hero Section with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0a0a0a] via-[#1a0303] to-[#B42225]">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#FF8C00]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B42225]/30 rounded-full blur-3xl" />

          <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
            <button
              onClick={() => router.push("/profile")}
              className="group inline-flex items-center gap-2 text-white/60 hover:text-white transition-all mb-6"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Profile
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <FiSettings size={28} className="text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-4xl font-black text-white"
                  style={{ fontFamily: "'Playfair Display',serif" }}
                >
                  Settings
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-5 pb-16">
          {/* Tabs Navigation - Modern Card Style */}
          <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, #B42225, #FF8C00)`,
                        }
                      : {}
                  }
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Profile Tab - Enhanced Form */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B42225] to-[#FF8C00] flex items-center justify-center shadow-lg">
                    <FiUser size={24} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Profile Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Update your personal details
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <FiCheck size={16} className="text-white" />
                    </div>
                    <p className="text-green-700 font-medium">{success}</p>
                  </div>
                )}

                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <FiAlertCircle size={16} className="text-white" />
                    </div>
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Section */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                      Personal Information
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={form.first_name}
                          onChange={(e) =>
                            handleFieldChange("first_name", e.target.value)
                          }
                          className={inputFieldClass("first_name")}
                          placeholder="First name"
                        />
                        {errors.first_name && (
                          <p className="text-xs text-red-500 mt-1 ml-1">
                            {errors.first_name}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={form.last_name}
                          onChange={(e) =>
                            handleFieldChange("last_name", e.target.value)
                          }
                          className={inputFieldClass("last_name")}
                          placeholder="Last name"
                        />
                        {errors.last_name && (
                          <p className="text-xs text-red-500 mt-1 ml-1">
                            {errors.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Username & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                          @
                        </span>
                        <input
                          type="text"
                          value={form.username}
                          onChange={(e) =>
                            handleFieldChange(
                              "username",
                              e.target.value.replace(/\s/g, ""),
                            )
                          }
                          className={`${inputFieldClass("username")} pl-10`}
                          placeholder="username"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs text-red-500 mt-1 ml-1">
                          {errors.username}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        className={inputFieldClass("phone")}
                        placeholder="08012345678"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1 ml-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                      Gender
                    </label>
                    <div className="flex gap-4">
                      {GENDER_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleFieldChange("gender", g)}
                          className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                            form.gender === g
                              ? "border-[#B42225] text-[#B42225] bg-[#B42225]/5 shadow-md"
                              : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl">
                            {g === "MALE" ? "👨" : "👩"}
                          </span>
                          {g.charAt(0) + g.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Location Section */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                      Location
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <input
                          type="text"
                          value={form.country}
                          onChange={(e) =>
                            handleFieldChange("country", e.target.value)
                          }
                          className={inputFieldClass("country")}
                          placeholder="Country"
                        />
                        {errors.country && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.country}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={form.state}
                          onChange={(e) =>
                            handleFieldChange("state", e.target.value)
                          }
                          className={inputFieldClass("state")}
                          placeholder="State"
                        />
                        {errors.state && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.state}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) =>
                            handleFieldChange("city", e.target.value)
                          }
                          className={inputFieldClass("city")}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* School Section */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      School / Institution{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setSchoolDropdownOpen(!schoolDropdownOpen)
                        }
                        className={`w-full flex items-center justify-between rounded-2xl border px-5 py-3.5 text-sm transition-all ${
                          errors.school
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FiBriefcase className="text-gray-400" size={16} />
                          <span
                            className={
                              selectedSchoolId
                                ? "text-gray-800"
                                : "text-gray-400"
                            }
                          >
                            {selectedSchoolId
                              ? schools.find(
                                  (s) => (s.id || s._id) === selectedSchoolId,
                                )?.school_name ||
                                schools.find(
                                  (s) => (s.id || s._id) === selectedSchoolId,
                                )?.name ||
                                "Select your school"
                              : "Select your school"}
                          </span>
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${schoolDropdownOpen ? "rotate-180" : ""}`}
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

                      {schoolDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                          <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 bg-white">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                              <input
                                type="text"
                                placeholder="Search school..."
                                value={schoolSearch}
                                onChange={(e) =>
                                  setSchoolSearch(e.target.value)
                                }
                                className="flex-1 text-sm outline-none bg-transparent"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto">
                            {loadingSchools ? (
                              <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#B42225] rounded-full animate-spin" />
                              </div>
                            ) : filteredSchools.length === 0 ? (
                              <div className="text-center py-12">
                                <FiBriefcase
                                  size={40}
                                  className="text-gray-300 mx-auto mb-3"
                                />
                                <p className="text-gray-400 text-sm">
                                  No schools found
                                </p>
                              </div>
                            ) : (
                              filteredSchools.map((school) => {
                                const isSelected =
                                  (school.id || school._id) ===
                                  selectedSchoolId;
                                return (
                                  <button
                                    key={school.id || school._id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSchoolId(
                                        school.id || school._id || "",
                                      );
                                      setSchoolDropdownOpen(false);
                                      setSchoolSearch("");
                                      setErrors((prev) => ({
                                        ...prev,
                                        school: "",
                                      }));
                                    }}
                                    className={`w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition ${
                                      isSelected ? "bg-[#B42225]/5" : ""
                                    }`}
                                  >
                                    <div>
                                      <p
                                        className={`text-sm font-medium ${isSelected ? "text-[#B42225]" : "text-gray-700"}`}
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
                                      <FiCheck
                                        size={16}
                                        className="text-[#B42225]"
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
                    {errors.school && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.school}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      Address{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        handleFieldChange("address", e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm focus:border-[#B42225] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B42225]/20 resize-none"
                      rows={2}
                      placeholder="Your street address"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 text-base shadow-lg hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF8C00)",
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FiSave size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg">
                    <FiBell size={24} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Choose how you want to be notified
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FiMail size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        Email Notifications
                      </p>
                      <p className="text-xs text-gray-400">
                        Receive updates about orders and promotions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        emailNotifications: !prev.emailNotifications,
                      }))
                    }
                    className={`w-14 h-7 rounded-full transition-all ${preferences.emailNotifications ? "bg-gradient-to-r from-[#B42225] to-[#FF8C00]" : "bg-gray-300"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${preferences.emailNotifications ? "translate-x-8" : "translate-x-1"} mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <FiSmartphone size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        Push Notifications
                      </p>
                      <p className="text-xs text-gray-400">
                        Get real-time alerts on your device
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        pushNotifications: !prev.pushNotifications,
                      }))
                    }
                    className={`w-14 h-7 rounded-full transition-all ${preferences.pushNotifications ? "bg-gradient-to-r from-[#B42225] to-[#FF8C00]" : "bg-gray-300"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${preferences.pushNotifications ? "translate-x-8" : "translate-x-1"} mt-1`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
                    <FiLock size={24} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Security
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Protect your account
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <button
                  onClick={() => router.push("/settings/change-password")}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <FiLock size={18} className="text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800 group-hover:text-[#B42225] transition">
                        Change Password
                      </p>
                      <p className="text-xs text-gray-400">
                        Update your password regularly to keep your account
                        secure
                      </p>
                    </div>
                  </div>
                  <FiChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-[#B42225] transition"
                  />
                </button>

                <button
                  onClick={() => router.push("/settings/2fa")}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <FiShield size={18} className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800 group-hover:text-[#B42225] transition">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <FiChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-[#B42225] transition"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg">
                    <FiGlobe size={24} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Playfair Display',serif" }}
                    >
                      Preferences
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Customize your experience
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      {preferences.darkMode ? (
                        <FiMoon size={18} className="text-indigo-600" />
                      ) : (
                        <FiSun size={18} className="text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Dark Mode</p>
                      <p className="text-xs text-gray-400">
                        Switch between light and dark theme
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        darkMode: !prev.darkMode,
                      }))
                    }
                    className={`w-14 h-7 rounded-full transition-all ${preferences.darkMode ? "bg-gradient-to-r from-[#B42225] to-[#FF8C00]" : "bg-gray-300"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${preferences.darkMode ? "translate-x-8" : "translate-x-1"} mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                      <FiGlobe size={18} className="text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Language</p>
                      <p className="text-xs text-gray-400">
                        Choose your preferred language
                      </p>
                    </div>
                  </div>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#B42225] focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="French">Français</option>
                    <option value="Spanish">Español</option>
                    <option value="Arabic">العربية</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Logout Section */}
          <div className="mt-8">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-red-500 bg-white border-2 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              <FiLogOut size={18} />
              {loggingOut ? "Logging out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;
