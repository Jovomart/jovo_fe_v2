"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ApiService from "@/services/apiService";
import {
  FiUser,
  FiMail,
  FiShield,
  FiLogOut,
  FiEdit2,
  FiShoppingBag,
  FiHeart,
  FiMapPin,
  FiCalendar,
  FiSettings,
  FiChevronRight,
  FiStar,
  FiPhone,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiCamera,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import Footer from "@/components/layout/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditForm {
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

interface EditErrors {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^(0[789][01]\d{8})$/;
  return phoneRegex.test(phone);
};

const GENDER_OPTIONS = ["MALE", "FEMALE"];

// ─── Component ───────────────────────────────────────────────────────────────

const Profile = () => {
  const {
    user,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    deleteAccount,
    logout,
  } = useContext(AuthContext);
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [profileImageBroken, setProfileImageBroken] = useState(false);
  const { wishlist } = useWishlist();

  // ── Profile image upload ──────────────────────────────────────────────────
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  const [editSuccess, setEditSuccess] = useState("");

  const [editForm, setEditForm] = useState<EditForm>({
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

  // ── Delete account modal ──────────────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ─── Fetch schools ────────────────────────────────────────────────────────
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

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setProfileImageBroken(false);
  }, [user?.photoURL, user?.profile_image]);

  useEffect(() => {
    if (isEditModalOpen) {
      fetchSchools();
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (user && isEditModalOpen) {
      setEditForm({
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
  }, [user, isEditModalOpen]);

  const filteredSchools = schools.filter((school) => {
    const s = schoolSearch.toLowerCase();
    return (
      (school.school_name || school.name || "").toLowerCase().includes(s) ||
      (school.school_code || "").toLowerCase().includes(s)
    );
  });

  // ─── Profile image upload ─────────────────────────────────────────────────
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (JPG, PNG, etc.)");
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5MB");
      return;
    }

    setImageError("");
    setUploadingImage(true);
    try {
      await updateProfileImage(file);
    } catch (err: any) {
      setImageError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      // Reset input so the same file can be re-selected
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.photoURL && !user?.profile_image) return;
    setImageError("");
    setUploadingImage(true);
    try {
      await removeProfileImage();
    } catch (err: any) {
      setImageError(
        err.message || "Failed to remove profile photo. Please try again.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Edit form ────────────────────────────────────────────────────────────
  const handleEditFieldChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateEditForm = (): boolean => {
    const errors: EditErrors = {};
    if (!editForm.first_name?.trim())
      errors.first_name = "First name is required";
    if (!editForm.last_name?.trim()) errors.last_name = "Last name is required";
    if (!editForm.username?.trim()) errors.username = "Username is required";
    if (!editForm.gender) errors.gender = "Please select your gender";
    if (!editForm.country?.trim()) errors.country = "Country is required";
    if (!editForm.state?.trim()) errors.state = "State is required";
    if (!editForm.city?.trim()) errors.city = "City is required";
    if (!editForm.phone) {
      errors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(editForm.phone)) {
      errors.phone = "Enter a valid Nigerian phone number (e.g., 08012345678)";
    }
    if (!selectedSchoolId) errors.school = "Please select your school";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm()) return;
    setEditLoading(true);
    setEditSuccess("");
    setEditErrors({});
    try {
      await updateProfile({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        username: editForm.username,
        gender: editForm.gender,
        country: editForm.country,
        state: editForm.state,
        city: editForm.city,
        address: editForm.address,
        phone: editForm.phone,
        school_id: selectedSchoolId,
      });
      setEditSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess("");
      }, 1500);
    } catch (err: any) {
      setEditErrors({ general: err.message || "Failed to update profile" });
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete account ───────────────────────────────────────────────────────
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

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/shop");
    } catch {
      router.push("/shop");
    }
  };

  if (!hasMounted) {
    return <div className="min-h-screen" style={{ background: "#F4F5F9" }} />;
  }

  if (!user) return null;

  // ─── Derived display values ───────────────────────────────────────────────
  const displayName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username ||
    "User";
  const initials = (user.first_name?.[0] || "") + (user.last_name?.[0] || "");
  const location = [user.city, user.state, user.country]
    .filter(Boolean)
    .join(", ");
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";
  const formattedPhone = user.phone || "—";

  const quickLinks = [
    {
      icon: <FiShoppingBag size={18} />,
      label: "My Orders",
      sub: "Track and manage orders",
      href: "/orders",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <FiHeart size={18} />,
      label: "Wishlist",
      sub: "Saved items",
      href: "/wishlist",
      color: "bg-pink-50 text-pink-600",
    },
    {
      icon: <FiStar size={18} />,
      label: "Reviews",
      sub: "Your product reviews",
      href: "/reviews",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: <FiSettings size={18} />,
      label: "Settings",
      sub: "Account preferences",
      href: "/settings",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const inputClass = (field: keyof EditErrors) =>
    `w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 ${
      editErrors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-gray-50 focus:border-[#B42225] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B42225]/20"
    }`;

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F4F5F9" }}>
        {/* Hero banner */}
        <div
          className="relative overflow-hidden h-32 md:h-48"
          style={{
            background:
              "linear-gradient(135deg,#0a0a0a 0%,#1a0303 40%,#B42225 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#FF6B00,transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle,#B42225,transparent 65%)",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Profile card */}
          <div
            className="bg-white rounded-3xl -mt-10 relative z-10 p-6 md:p-8 mb-5"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* ── Avatar with upload ── */}
              <div className="relative shrink-0 group">
                {user.photoURL && !profileImageBroken ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                    unoptimized
                    onError={() => setProfileImageBroken(true)}
                  />
                ) : user.profile_image && !profileImageBroken ? (
                  <Image
                    src={user.profile_image}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                    unoptimized
                    onError={() => setProfileImageBroken(true)}
                  />
                ) : (
                  <div
                    className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center border-4 border-white"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF6B00)",
                      boxShadow: "0 4px 20px rgba(180,34,37,0.35)",
                    }}
                  >
                    <span
                      className="text-3xl md:text-4xl font-black text-white"
                      style={{ fontFamily: "'Georgia',serif" }}
                    >
                      {initials || user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                {/* Upload overlay */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                  title="Change profile photo"
                >
                  {uploadingImage ? (
                    <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <FiCamera size={20} className="text-white" />
                      <span className="text-white text-[9px] font-bold">
                        Change Photo
                      </span>
                    </div>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
              </div>

              {/* Name & info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                {imageError && (
                  <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {imageError}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1
                    className="text-2xl md:text-3xl font-black text-gray-900"
                    style={{ fontFamily: "'Georgia',serif" }}
                  >
                    {displayName}
                  </h1>
                  <span className="text-xs font-bold bg-green-100 text-green-600 px-2.5 py-1 rounded-full">
                    ✓ Verified
                  </span>
                </div>
                {user.username && (
                  <p
                    className="text-sm font-semibold mt-0.5"
                    style={{ color: "#B42225" }}
                  >
                    @{user.username}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                  {user.email && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FiMail size={12} /> {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FiPhone size={12} /> {formattedPhone}
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FiMapPin size={12} /> {location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FiCalendar size={12} /> {joinDate}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-[#B42225] hover:bg-[#9e1e20] transition-all disabled:opacity-60"
                  >
                    <FiCamera size={16} />
                    {uploadingImage
                      ? "Processing..."
                      : user.photoURL
                        ? "Change photo"
                        : "Upload photo"}
                  </button>
                  {user.photoURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-60"
                    >
                      <FiTrash2 size={16} />
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              {/* Edit + Logout buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <FiEdit2 size={14} /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg,#B42225,#FF6B00)",
                  }}
                >
                  <FiLogOut size={14} />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Orders", value: "0" },
              { label: "Wishlist", value: String(wishlist.length) },
              { label: "Reviews", value: "0" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 text-center border border-gray-100"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <p
                  className="text-2xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  {value}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-16">
            {/* Account details */}
            <div
              className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <h2
                className="text-lg font-black text-gray-900 mb-5"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Account Details
              </h2>
              <div className="space-y-3">
                {[
                  {
                    icon: <FiUser size={16} />,
                    label: "Full Name",
                    value: displayName,
                    color: "bg-blue-50 text-blue-600",
                  },
                  {
                    icon: <FiMail size={16} />,
                    label: "Email",
                    value: user.email,
                    color: "bg-red-50 text-red-500",
                  },
                  {
                    icon: <FiPhone size={16} />,
                    label: "Phone",
                    value: formattedPhone,
                    color: "bg-green-50 text-green-600",
                  },
                  {
                    icon: <FiUser size={16} />,
                    label: "Username",
                    value: user.username ? `@${user.username}` : "—",
                    color: "bg-orange-50 text-orange-500",
                  },
                  {
                    icon: <FiMapPin size={16} />,
                    label: "Location",
                    value: location || "—",
                    color: "bg-teal-50 text-teal-600",
                  },
                  {
                    icon: <FiShield size={16} />,
                    label: "Account ID",
                    value: user.id?.slice(0, 12) || "—",
                    color: "bg-purple-50 text-purple-600",
                  },
                  {
                    icon: <FiShield size={16} />,
                    label: "Gender",
                    value: user.gender
                      ? user.gender.charAt(0) +
                        user.gender.slice(1).toLowerCase()
                      : "—",
                    color: "bg-pink-50 text-pink-500",
                  },
                ].map(({ icon, label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Danger zone */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-black text-red-500 mb-3 uppercase tracking-widest">
                  Danger Zone
                </h3>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-all"
                >
                  <FiTrash2 size={15} /> Delete Account Permanently
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  This action cannot be undone. All your data will be
                  permanently removed.
                </p>
              </div>
            </div>

            {/* Quick links */}
            <div
              className="bg-white rounded-3xl p-6 border border-gray-100 h-fit"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <h2
                className="text-lg font-black text-gray-900 mb-5"
                style={{ fontFamily: "'Georgia',serif" }}
              >
                Quick Links
              </h2>
              <div className="space-y-2">
                {quickLinks.map(({ icon, label, sub, href, color }) => (
                  <Link
                    key={label}
                    href={href}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-[#B42225] transition-colors">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <FiChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-[#B42225] transition-colors shrink-0"
                    />
                  </Link>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  <FiLogOut size={15} />
                  {loggingOut ? "Logging out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          EDIT PROFILE MODAL
      ══════════════════════════════════════════════════ */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "'Georgia',serif" }}
                >
                  Edit Profile
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Update your personal information
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* ── Photo upload inside modal ── */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                <div className="relative shrink-0">
                  {user.photoURL && !profileImageBroken ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover"
                      unoptimized
                      onError={() => setProfileImageBroken(true)}
                    />
                  ) : user.profile_image && !profileImageBroken ? (
                    <Image
                      src={user.profile_image}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover"
                      unoptimized
                      onError={() => setProfileImageBroken(true)}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
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
                    <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    JPG, PNG or GIF — max 5MB
                  </p>
                  {imageError && (
                    <p className="text-xs text-red-500 mt-1">{imageError}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white hover:border-[#B42225] hover:text-[#B42225] transition-all disabled:opacity-50 shrink-0"
                >
                  <FiCamera size={14} />
                  {uploadingImage ? "Uploading..." : "Choose Photo"}
                </button>
              </div>

              {editSuccess && (
                <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <FiCheck className="text-green-500 shrink-0" size={16} />
                  <p className="text-green-600 text-sm">{editSuccess}</p>
                </div>
              )}
              {editErrors.general && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <FiAlertCircle className="text-red-500 shrink-0" size={16} />
                  <p className="text-red-600 text-sm">{editErrors.general}</p>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) =>
                        handleEditFieldChange("first_name", e.target.value)
                      }
                      className={inputClass("first_name")}
                      placeholder="First name"
                    />
                    {editErrors.first_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {editErrors.first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) =>
                        handleEditFieldChange("last_name", e.target.value)
                      }
                      className={inputClass("last_name")}
                      placeholder="Last name"
                    />
                    {editErrors.last_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {editErrors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                      @
                    </span>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        handleEditFieldChange(
                          "username",
                          e.target.value.replace(/\s/g, ""),
                        )
                      }
                      className={`${inputClass("username")} pl-8`}
                      placeholder="username"
                    />
                  </div>
                  {editErrors.username && (
                    <p className="text-xs text-red-500 mt-1">
                      {editErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      handleEditFieldChange("phone", e.target.value)
                    }
                    className={inputClass("phone")}
                    placeholder="08012345678"
                  />
                  {editErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {editErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleEditFieldChange("gender", g)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                          editForm.gender === g
                            ? "border-[#B42225] text-[#B42225] bg-[#B42225]/5"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-lg">
                          {g === "MALE" ? "👨" : "👩"}
                        </span>
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  {editErrors.gender && (
                    <p className="text-xs text-red-500 mt-1">
                      {editErrors.gender}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) =>
                        handleEditFieldChange("country", e.target.value)
                      }
                      className={inputClass("country")}
                      placeholder="Nigeria"
                    />
                    {editErrors.country && (
                      <p className="text-xs text-red-500 mt-1">
                        {editErrors.country}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) =>
                        handleEditFieldChange("state", e.target.value)
                      }
                      className={inputClass("state")}
                      placeholder="Lagos"
                    />
                    {editErrors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {editErrors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      handleEditFieldChange("city", e.target.value)
                    }
                    className={inputClass("city")}
                    placeholder="Ikeja"
                  />
                  {editErrors.city && (
                    <p className="text-xs text-red-500 mt-1">
                      {editErrors.city}
                    </p>
                  )}
                </div>

                {/* School dropdown */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    School / Institution <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                        editErrors.school
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={
                          selectedSchoolId ? "text-gray-800" : "text-gray-400"
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
                      <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
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
                              onChange={(e) => setSchoolSearch(e.target.value)}
                              className="flex-1 text-sm outline-none bg-transparent"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {loadingSchools ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#B42225] rounded-full animate-spin" />
                            </div>
                          ) : filteredSchools.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              No schools found
                            </div>
                          ) : (
                            filteredSchools.map((school) => {
                              const isSelected =
                                (school.id || school._id) === selectedSchoolId;
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
                                    setEditErrors((prev) => ({
                                      ...prev,
                                      school: "",
                                    }));
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition ${
                                    isSelected ? "bg-[#B42225]/5" : ""
                                  }`}
                                >
                                  <div>
                                    <p
                                      className={`text-sm ${isSelected ? "text-[#B42225] font-medium" : "text-gray-700"}`}
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
                  {editErrors.school && (
                    <p className="text-xs text-red-500 mt-1">
                      {editErrors.school}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    Address{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) =>
                      handleEditFieldChange("address", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#B42225] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B42225]/20 resize-none"
                    rows={2}
                    placeholder="Your street address"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg,#B42225,#FF6B00)",
                    }}
                  >
                    {editLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck size={14} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                orders, reviews, and any seller/service provider information.
                This <strong>cannot be recovered</strong>.
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

export default Profile;
