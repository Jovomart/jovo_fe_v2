"use client";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AuthContext } from "@/context/AuthContext";
import ApiService from "@/services/apiService";
import Image from "next/image";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiBell,
  FiLock,
  FiGlobe,
  FiMoon,
  FiSun,
  FiLogOut,
  FiChevronRight,
  FiSmartphone,
  FiSettings,
  FiBriefcase,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiTrash2,
} from "react-icons/fi";
import Footer from "@/components/layout/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ProfileErrors {
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

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

interface PasswordErrors {
  current_password?: string;
  new_password?: string;
  confirm_new_password?: string;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  return /^(0[789][01]\d{8})$/.test(phone);
};

const GENDER_OPTIONS = ["MALE", "FEMALE"];

// ─── Component ───────────────────────────────────────────────────────────────

const Settings = () => {
  const {
    user,
    updateProfile,
    updateProfileImage,
    changePassword,
    deleteAccount,
    logout,
  } = useContext(AuthContext);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Profile image upload ──────────────────────────────────────────────────
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageSuccess, setImageSuccess] = useState("");

  // ── Profile form ──────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSuccess, setProfileSuccess] = useState("");

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

  // ── Schools ───────────────────────────────────────────────────────────────
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");

  // ── Change password ───────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ── Preferences ───────────────────────────────────────────────────────────
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: "English",
  });

  // ── Delete account ────────────────────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ─── Fetch schools ─────────────────────────────────────────────────────────
  const fetchSchools = useCallback(async () => {
    setLoadingSchools(true);
    try {
      const response = await ApiService.getAvailableSchools();
      let arr: School[] = [];
      if (response?.data?.schools && Array.isArray(response.data.schools))
        arr = response.data.schools;
      else if (Array.isArray(response)) arr = response;
      else if (response?.data && Array.isArray(response.data))
        arr = response.data;
      else if (response?.schools && Array.isArray(response.schools))
        arr = response.schools;
      setSchools(arr);
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    } finally {
      setLoadingSchools(false);
    }
  }, []);

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
      });
      setSelectedSchoolId(user.school_id || user.schoolId || "");
    }
    fetchSchools();
  }, [user, fetchSchools]);

  const filteredSchools = schools.filter((school) => {
    const s = schoolSearch.toLowerCase();
    return (
      (school.school_name || school.name || "").toLowerCase().includes(s) ||
      (school.school_code || "").toLowerCase().includes(s)
    );
  });

  // ─── Profile image upload ──────────────────────────────────────────────────
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5MB");
      return;
    }
    setImageError("");
    setImageSuccess("");
    setUploadingImage(true);
    try {
      await updateProfileImage(file);
      setImageSuccess("Profile photo updated successfully!");
      setTimeout(() => setImageSuccess(""), 3000);
    } catch (err: any) {
      setImageError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // ─── Profile form ──────────────────────────────────────────────────────────
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateProfileForm = (): boolean => {
    const errors: ProfileErrors = {};
    if (!form.first_name?.trim()) errors.first_name = "First name is required";
    if (!form.last_name?.trim()) errors.last_name = "Last name is required";
    if (!form.username?.trim()) errors.username = "Username is required";
    if (!form.gender) errors.gender = "Please select your gender";
    if (!form.country?.trim()) errors.country = "Country is required";
    if (!form.state?.trim()) errors.state = "State is required";
    if (!form.city?.trim()) errors.city = "City is required";
    if (!form.phone) {
      errors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(form.phone)) {
      errors.phone = "Enter a valid Nigerian phone number (e.g., 08012345678)";
    }
    if (!selectedSchoolId) errors.school = "Please select your school";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileErrors({});
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
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileErrors({ general: err.message || "Failed to update profile" });
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Change password ───────────────────────────────────────────────────────
  const handlePasswordFieldChange = (
    field: keyof PasswordForm,
    value: string,
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validatePasswordForm = (): boolean => {
    const errors: PasswordErrors = {};
    if (!passwordForm.current_password)
      errors.current_password = "Current password is required";
    if (!passwordForm.new_password) {
      errors.new_password = "New password is required";
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = "New password must be at least 8 characters";
    }
    if (!passwordForm.confirm_new_password) {
      errors.confirm_new_password = "Please confirm your new password";
    } else if (
      passwordForm.new_password !== passwordForm.confirm_new_password
    ) {
      errors.confirm_new_password = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setPasswordLoading(true);
    setPasswordSuccess("");
    setPasswordErrors({});
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_new_password: passwordForm.confirm_new_password,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      setPasswordErrors({
        general:
          err.message ||
          "Failed to change password. Check your current password and try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm');
      return;
    }
    setDeletingAccount(true);
    setDeleteError("");
    try {
      await deleteAccount();
      router.push("/");
    } catch (err: any) {
      setDeleteError(
        err.message || "Failed to delete account. Please try again.",
      );
      setDeletingAccount(false);
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/shop");
    } catch {
      router.push("/shop");
    }
  };

  if (!user) return null;

  const displayName =
    `${form.first_name} ${form.last_name}`.trim() || user.username || "User";
  const initials = (form.first_name?.[0] || "") + (form.last_name?.[0] || "");

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "password", label: "Password", icon: FiLock },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "preferences", label: "Preferences", icon: FiGlobe },
  ];

  const inputClass = (field: keyof ProfileErrors) =>
    `w-full rounded-2xl border px-5 py-3.5 text-sm transition-all duration-200 ${
      profileErrors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B42225]/20"
    }`;

  const pwdInputClass = (field: keyof PasswordErrors) =>
    `w-full rounded-2xl border px-5 py-3.5 text-sm transition-all duration-200 pr-12 ${
      passwordErrors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B42225]/20"
    }`;

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* Hero */}
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
                  style={{ fontFamily: "'Georgia',serif" }}
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
          {/* Tabs */}
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
                          background: "linear-gradient(135deg,#B42225,#FF8C00)",
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

          {/* ══════════════════════ PROFILE TAB ══════════════════════ */}
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
                      style={{ fontFamily: "'Georgia',serif" }}
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
                {/* ── Profile photo upload ── */}
                <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                  <div className="relative shrink-0 group">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg,#B42225,#FF6B00)",
                        }}
                      >
                        <span className="text-2xl font-black text-white">
                          {initials || user.username?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      Profile Photo
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">
                      Upload a clear photo of yourself. Supports JPG, PNG — max
                      5MB.
                    </p>
                    {imageError && (
                      <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                        <FiAlertCircle size={11} /> {imageError}
                      </p>
                    )}
                    {imageSuccess && (
                      <p className="text-xs text-green-600 mb-2 flex items-center gap-1">
                        <FiCheck size={11} /> {imageSuccess}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white hover:border-[#B42225] hover:text-[#B42225] transition-all disabled:opacity-50"
                    >
                      <FiCamera size={14} />
                      {uploadingImage ? "Uploading..." : "Choose a Photo"}
                    </button>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </div>

                {profileSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <FiCheck size={16} className="text-white" />
                    </div>
                    <p className="text-green-700 font-medium">
                      {profileSuccess}
                    </p>
                  </div>
                )}
                {profileErrors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <FiAlertCircle size={16} className="text-white" />
                    </div>
                    <p className="text-red-600 text-sm">
                      {profileErrors.general}
                    </p>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name */}
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
                          className={inputClass("first_name")}
                          placeholder="First name"
                        />
                        {profileErrors.first_name && (
                          <p className="text-xs text-red-500 mt-1 ml-1">
                            {profileErrors.first_name}
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
                          className={inputClass("last_name")}
                          placeholder="Last name"
                        />
                        {profileErrors.last_name && (
                          <p className="text-xs text-red-500 mt-1 ml-1">
                            {profileErrors.last_name}
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
                          className={`${inputClass("username")} pl-10`}
                          placeholder="username"
                        />
                      </div>
                      {profileErrors.username && (
                        <p className="text-xs text-red-500 mt-1 ml-1">
                          {profileErrors.username}
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
                        className={inputClass("phone")}
                        placeholder="08012345678"
                      />
                      {profileErrors.phone && (
                        <p className="text-xs text-red-500 mt-1 ml-1">
                          {profileErrors.phone}
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
                    {profileErrors.gender && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {profileErrors.gender}
                      </p>
                    )}
                  </div>

                  {/* Location */}
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
                          className={inputClass("country")}
                          placeholder="Country"
                        />
                        {profileErrors.country && (
                          <p className="text-xs text-red-500 mt-1">
                            {profileErrors.country}
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
                          className={inputClass("state")}
                          placeholder="State"
                        />
                        {profileErrors.state && (
                          <p className="text-xs text-red-500 mt-1">
                            {profileErrors.state}
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
                          className={inputClass("city")}
                          placeholder="City"
                        />
                        {profileErrors.city && (
                          <p className="text-xs text-red-500 mt-1">
                            {profileErrors.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* School */}
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
                          profileErrors.school
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
                                      setProfileErrors((prev) => ({
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
                    {profileErrors.school && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {profileErrors.school}
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

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-4 rounded-2xl font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 text-base shadow-lg hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF8C00)",
                    }}
                  >
                    {profileLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FiSave size={18} /> Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════ PASSWORD TAB ══════════════════════ */}
          {activeTab === "password" && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
                    <FiLock size={24} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black text-gray-900"
                      style={{ fontFamily: "'Georgia',serif" }}
                    >
                      Change Password
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 max-w-lg">
                {passwordSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <FiCheck size={16} className="text-white" />
                    </div>
                    <p className="text-green-700 font-medium">
                      {passwordSuccess}
                    </p>
                  </div>
                )}
                {passwordErrors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                      <FiAlertCircle size={16} className="text-white" />
                    </div>
                    <p className="text-red-600 text-sm">
                      {passwordErrors.general}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Current password */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPwd ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) =>
                          handlePasswordFieldChange(
                            "current_password",
                            e.target.value,
                          )
                        }
                        className={pwdInputClass("current_password")}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showCurrentPwd ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.current_password && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {passwordErrors.current_password}
                      </p>
                    )}
                  </div>

                  {/* New password */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPwd ? "text" : "password"}
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          handlePasswordFieldChange(
                            "new_password",
                            e.target.value,
                          )
                        }
                        className={pwdInputClass("new_password")}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showNewPwd ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {passwordErrors.new_password}
                      </p>
                    )}
                    {/* Password strength hint */}
                    {passwordForm.new_password && (
                      <div className="mt-2 flex gap-1">
                        {[...Array(4)].map((_, i) => {
                          const len = passwordForm.new_password.length;
                          const hasUpper = /[A-Z]/.test(
                            passwordForm.new_password,
                          );
                          const hasNum = /\d/.test(passwordForm.new_password);
                          const hasSpecial = /[!@#$%^&*]/.test(
                            passwordForm.new_password,
                          );
                          const strength =
                            (len >= 8 ? 1 : 0) +
                            (hasUpper ? 1 : 0) +
                            (hasNum ? 1 : 0) +
                            (hasSpecial ? 1 : 0);
                          const filled = i < strength;
                          const color =
                            strength <= 1
                              ? "bg-red-400"
                              : strength === 2
                                ? "bg-yellow-400"
                                : strength === 3
                                  ? "bg-blue-400"
                                  : "bg-green-400";
                          return (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${filled ? color : "bg-gray-200"}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        value={passwordForm.confirm_new_password}
                        onChange={(e) =>
                          handlePasswordFieldChange(
                            "confirm_new_password",
                            e.target.value,
                          )
                        }
                        className={pwdInputClass("confirm_new_password")}
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showConfirmPwd ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirm_new_password && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {passwordErrors.confirm_new_password}
                      </p>
                    )}
                    {passwordForm.confirm_new_password &&
                      passwordForm.new_password ===
                        passwordForm.confirm_new_password && (
                        <p className="text-xs text-green-500 mt-1 ml-1 flex items-center gap-1">
                          <FiCheck size={11} /> Passwords match
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-4 rounded-2xl font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 text-base shadow-lg hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg,#F59E0B,#FBBF24)",
                    }}
                  >
                    {passwordLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <FiLock size={18} /> Update Password
                      </>
                    )}
                  </button>
                </form>

                {/* Danger zone */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-black text-red-500 mb-3 uppercase tracking-widest">
                    Danger Zone
                  </h3>
                  <div className="p-4 rounded-2xl border border-red-100 bg-red-50">
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      Delete Account
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Permanently delete your account and all associated data.
                      This cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-bold hover:bg-red-100 transition-all"
                    >
                      <FiTrash2 size={14} /> Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════ NOTIFICATIONS TAB ══════════════════════ */}
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
                      style={{ fontFamily: "'Georgia',serif" }}
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
                {[
                  {
                    icon: <FiMail size={18} className="text-blue-600" />,
                    bg: "bg-blue-100",
                    label: "Email Notifications",
                    sub: "Receive updates about orders and promotions",
                    key: "emailNotifications" as keyof Preferences,
                  },
                  {
                    icon: (
                      <FiSmartphone size={18} className="text-purple-600" />
                    ),
                    bg: "bg-purple-100",
                    label: "Push Notifications",
                    sub: "Get real-time alerts on your device",
                    key: "pushNotifications" as keyof Preferences,
                  },
                ].map(({ icon, bg, label, sub, key }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className={`w-14 h-7 rounded-full transition-all relative ${
                        preferences[key]
                          ? "bg-gradient-to-r from-[#B42225] to-[#FF8C00]"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                          preferences[key] ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════ PREFERENCES TAB ══════════════════════ */}
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
                      style={{ fontFamily: "'Georgia',serif" }}
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
                {/* Dark mode */}
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
                    className={`w-14 h-7 rounded-full transition-all relative ${
                      preferences.darkMode
                        ? "bg-gradient-to-r from-[#B42225] to-[#FF8C00]"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                        preferences.darkMode ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Language */}
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

          {/* Sign out */}
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

      {/* ══════════════════════════════════════════════════
          DELETE ACCOUNT MODAL
      ══════════════════════════════════════════════════ */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FiTrash2 size={18} className="text-red-500" />
                </div>
                <h2
                  className="text-lg font-black text-red-600"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Delete Account
                </h2>
              </div>
              <p className="text-sm text-red-500 font-medium">
                This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Deleting your account will permanently remove all your data,
                orders, reviews, and seller/service provider information.{" "}
                <strong>This cannot be recovered.</strong>
              </p>
              <p className="text-sm font-bold text-gray-700 mb-2">
                Type <span className="text-red-500 font-black">DELETE</span> to
                confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError("");
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold tracking-wider focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 mb-3"
                placeholder="DELETE"
              />
              {deleteError && (
                <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || deleteConfirmText !== "DELETE"}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingAccount ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={14} /> Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Settings;
