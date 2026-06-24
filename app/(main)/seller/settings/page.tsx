"use client";

import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import apiService from "@/services/apiService";
import SellerLayout from "@/components/layout/SellerLayout";
import {
  FiUser,
  FiAlertCircle,
  FiCheck,
  FiRefreshCw,
  FiSave,
  FiBell,
  FiShield,
  FiShoppingBag,
  FiLock,
  FiLoader,
  FiCamera,
  FiTrash2,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import { FaStore, FaCrown } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  first_name: string;
  last_name: string;
  username: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  profile_image: string;
  school_name: string;
}

interface SellerData {
  id: string;
  business_name: string;
  short_business_description: string;
  seller_bio: string;
  business_address: string;
  business_phone_number: string;
  business_email: string;
  business_image: string;
  cover_image: string;
  average_rating: number;
  review_count: number;
  total_listings: number;
  items_sold: number;
  response_time: string;
  response_rate: string;
  badges: string[];
  member_since: string;
  follower_count: number;
  view_count: number;
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder-slate-400 bg-white";

const selectCls = `${inputCls} appearance-none cursor-pointer`;

const Field = ({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] text-slate-400 mt-1 font-medium">{hint}</p>
    )}
    {error && (
      <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
        <FiAlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

const Section = ({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) => (
  <div
    className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}
  >
    <div
      className="flex items-center gap-4 px-6 py-5"
      style={{ borderBottom: "1px solid #F8FAFC" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#FFF7ED,#FEF3C7)",
          color: "#F97316",
        }}
      >
        {icon}
      </div>
      <div>
        <p className="font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    <div className="px-6 py-6 space-y-5">{children}</div>
  </div>
);

// ─── Image Upload Modal ──────────────────────────────────────────────────────

const ImageUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  currentImage,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  currentImage?: string;
  title: string;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload(selectedFile);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <FiX size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Image Preview */}
          {currentImage && !preview && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={currentImage}
                alt="Current"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {preview && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiCamera size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG, WEBP • Max 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition disabled:opacity-50"
            >
              {uploading ? (
                <FiRefreshCw size={16} className="animate-spin mx-auto" />
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerSettingsPage = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext) as any;

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    username: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    profile_image: "",
    school_name: "",
  });

  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [sellerError, setSellerError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingField, setEditingField] = useState<"profile" | "business">(
    "profile",
  );

  const hasFetchedRef = useRef(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ── Load all data ──────────────────────────────────────────────────────────

  const loadAllData = useCallback(async () => {
    setLoadingProfile(true);
    setLoadingSeller(true);

    try {
      // Load user profile
      const userRes = await apiService.getCurrentUser();
      const u = userRes?.data ?? userRes;
      if (u) {
        // Format gender properly - handle different cases
        let genderValue = u.gender ?? "";
        if (genderValue && typeof genderValue === "string") {
          // Convert to lowercase for consistency
          genderValue = genderValue.toLowerCase();
        }

        setProfile({
          first_name: u.first_name ?? "",
          last_name: u.last_name ?? "",
          username: u.username ?? "",
          gender: genderValue,
          country: u.country ?? "",
          state: u.state ?? "",
          city: u.city ?? "",
          address: u.address ?? "",
          phone: u.phone_number ?? u.phone ?? "",
          email: u.email ?? "",
          profile_image: u.profile_image ?? "",
          school_name: u.school_name ?? "",
        });
      }
      setLoadingProfile(false);

      // Load seller profile
      const sellerRes = await apiService.getMySellerProfile();
      const s = sellerRes?.data ?? sellerRes;
      if (s) {
        setSellerData(s);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoadingSeller(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadAllData();
    }
  }, [loadAllData]);

  // ── Save profile ───────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setProfileError("");
    setSavingProfile(true);
    try {
      await apiService.updateUserProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        gender: profile.gender,
        country: profile.country,
        state: profile.state,
        city: profile.city,
        address: profile.address,
        phone: profile.phone,
      });
      showToast("Profile updated successfully!");
      await loadAllData();
    } catch (err: any) {
      const msg = err.message ?? "Failed to update profile.";
      setProfileError(msg);
      showToast(msg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save seller info ──────────────────────────────────────────────────────

  const handleSaveSellerInfo = async () => {
    setSellerError("");
    setSavingSeller(true);
    try {
      await apiService.updateMySellerProfile({
        business_name: sellerData?.business_name,
        short_business_description: sellerData?.short_business_description,
        business_address: sellerData?.business_address,
        seller_bio: sellerData?.seller_bio,
        business_phone_number: sellerData?.business_phone_number,
        business_email: sellerData?.business_email,
      });
      showToast("Business info updated successfully!");
      await loadAllData();
    } catch (err: any) {
      const msg = err.message ?? "Failed to update business info.";
      setSellerError(msg);
      showToast(msg, "error");
    } finally {
      setSavingSeller(false);
    }
  };

  // ── Handle image upload ───────────────────────────────────────────────────

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      // Upload business image
      const result = await apiService.uploadFiles(
        [file],
        "seller_business_image",
        sellerData?.id,
      );

      const uploadedUrl = result?.urls?.[0] || result?.url;

      if (uploadedUrl && sellerData) {
        // Update seller profile with new image
        await apiService.updateMySellerProfile({
          business_image: uploadedUrl,
        } as any);

        // Refresh data
        await loadAllData();
        showToast("Business image updated successfully!");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Handle image removal ──────────────────────────────────────────────────

  const handleImageRemove = async () => {
    if (!sellerData?.business_image) return;

    try {
      // Delete the image
      await apiService.deleteFiles(
        [sellerData.business_image],
        "seller_business_image",
        sellerData.id,
      );

      // Update seller profile to remove image
      await apiService.updateMySellerProfile({
        business_image: "",
      } as any);

      await loadAllData();
      showToast("Business image removed successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to remove image", "error");
    }
  };

  // ─── Get gender display label ─────────────────────────────────────────────

  const getGenderLabel = (gender: string) => {
    const map: Record<string, string> = {
      male: "Male",
      female: "Female",
      other: "Other",
      prefer_not_to_say: "Prefer not to say",
    };
    return map[gender?.toLowerCase()] || gender || "Select gender";
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const TABS = [
    { id: "profile", label: "Profile", icon: <FiUser size={14} /> },
    { id: "business", label: "Business", icon: <FiShoppingBag size={14} /> },
    { id: "security", label: "Security", icon: <FiShield size={14} /> },
  ];

  if (loadingProfile || loadingSeller) {
    return (
      <SellerLayout activeNav="settings" pageTitle="Settings">
        <div className="p-5 md:p-7">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                      <div className="h-3 w-48 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="space-y-1.5">
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                        <div className="h-10 w-full bg-slate-100 rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <>
      <SellerLayout activeNav="settings" pageTitle="Settings">
        <div className="p-5 md:p-7">
          <div className="max-w-3xl mx-auto">
            {/* Tab Nav */}
            <div
              className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-100 mb-6"
              style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
            >
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                {/* Avatar card with image */}
                <div
                  className="bg-white rounded-3xl border border-slate-100 p-6"
                  style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white shrink-0"
                        style={{
                          background: profile.profile_image
                            ? "transparent"
                            : "linear-gradient(135deg,#F97316,#DC2626)",
                          boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                        }}
                      >
                        {profile.profile_image ? (
                          <Image
                            src={profile.profile_image}
                            alt={profile.first_name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          (profile.first_name?.[0] ?? "S").toUpperCase()
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-slate-400 text-sm font-medium">
                        @{profile.username}
                      </p>
                      {profile.school_name && (
                        <p className="text-xs text-orange-500 font-medium mt-0.5">
                          {profile.school_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Section
                  icon={<FiUser size={17} />}
                  title="Personal Information"
                  desc="Your name, username, and contact details"
                >
                  {profileError && (
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-red-50 border border-red-200">
                      <FiAlertCircle
                        size={14}
                        className="text-red-500 shrink-0"
                      />
                      <p className="text-red-700 text-xs font-semibold">
                        {profileError}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-5">
                    <Field label="First Name" required>
                      <input
                        className={inputCls}
                        value={profile.first_name}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            first_name: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Last Name" required>
                      <input
                        className={inputCls}
                        value={profile.last_name}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            last_name: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Username" required>
                      <input
                        className={inputCls}
                        value={profile.username}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            username: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Email" required>
                      <input
                        value={profile.email}
                        disabled
                        className={`${inputCls} bg-slate-50 cursor-not-allowed`}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Phone Number">
                      <input
                        className={inputCls}
                        type="tel"
                        placeholder="+2348012345678"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Gender">
                      <select
                        className={selectCls}
                        value={profile.gender}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, gender: e.target.value }))
                        }
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Country">
                      <input
                        className={inputCls}
                        placeholder="Nigeria"
                        value={profile.country}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, country: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="State">
                      <input
                        className={inputCls}
                        placeholder="Lagos"
                        value={profile.state}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, state: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="City">
                      <input
                        className={inputCls}
                        placeholder="Ikeja"
                        value={profile.city}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, city: e.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Address">
                    <input
                      className={inputCls}
                      placeholder="14 Allen Avenue, Ikeja"
                      value={profile.address}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, address: e.target.value }))
                      }
                    />
                  </Field>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-70 hover:shadow-lg"
                      style={{
                        background: savingProfile
                          ? "#CBD5E1"
                          : "linear-gradient(135deg,#F97316,#EA580C)",
                        boxShadow: savingProfile
                          ? "none"
                          : "0 4px 14px rgba(249,115,22,0.3)",
                      }}
                    >
                      {savingProfile ? (
                        <>
                          <FiRefreshCw size={13} className="animate-spin" />{" "}
                          Saving…
                        </>
                      ) : (
                        <>
                          <FiSave size={13} /> Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </Section>
              </div>
            )}

            {/* ── Business Tab ─────────────────────────────────────────────── */}
            {activeTab === "business" && sellerData && (
              <Section
                icon={<FiShoppingBag size={17} />}
                title="Business Information"
                desc="Your seller profile visible to buyers"
              >
                {sellerError && (
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-red-50 border border-red-200">
                    <FiAlertCircle
                      size={14}
                      className="text-red-500 shrink-0"
                    />
                    <p className="text-red-700 text-xs font-semibold">
                      {sellerError}
                    </p>
                  </div>
                )}

                {/* Business Image with Upload/Edit */}
                <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-slate-200"
                      style={{
                        background: sellerData.business_image
                          ? "transparent"
                          : "#E2E8F0",
                      }}
                    >
                      {sellerData.business_image ? (
                        <Image
                          src={sellerData.business_image}
                          alt={sellerData.business_name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <FaStore size={32} className="text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex gap-1">
                      <button
                        onClick={() => {
                          setEditingField("business");
                          setShowImageModal(true);
                        }}
                        className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition shadow-md"
                        title="Upload new image"
                      >
                        <FiCamera size={12} />
                      </button>
                      {sellerData.business_image && (
                        <button
                          onClick={handleImageRemove}
                          className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-md"
                          title="Remove image"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Business Logo</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {sellerData.business_image
                        ? "Click the camera icon to change your business logo"
                        : "Upload a logo to make your store stand out"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {sellerData.badges?.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Field label="Business Name" required>
                  <input
                    className={inputCls}
                    placeholder="Your store or business name"
                    value={sellerData.business_name}
                    onChange={(e) =>
                      setSellerData((s) =>
                        s ? { ...s, business_name: e.target.value } : s,
                      )
                    }
                  />
                </Field>

                <Field
                  label="Business Description"
                  hint="Short description that appears on your seller profile"
                >
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={4}
                    placeholder="Tell buyers about your business…"
                    value={
                      sellerData.short_business_description ||
                      sellerData.seller_bio ||
                      ""
                    }
                    onChange={(e) =>
                      setSellerData((s) =>
                        s
                          ? { ...s, short_business_description: e.target.value }
                          : s,
                      )
                    }
                    maxLength={500}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {sellerData.short_business_description?.length || 0}/500
                  </p>
                </Field>

                <div className="grid grid-cols-2 gap-5">
                  <Field label="Business Phone">
                    <input
                      className={inputCls}
                      type="tel"
                      placeholder="+2348012345678"
                      value={sellerData.business_phone_number || ""}
                      onChange={(e) =>
                        setSellerData((s) =>
                          s
                            ? { ...s, business_phone_number: e.target.value }
                            : s,
                        )
                      }
                    />
                  </Field>
                  <Field label="Business Email">
                    <input
                      className={inputCls}
                      type="email"
                      placeholder="business@email.com"
                      value={sellerData.business_email || ""}
                      onChange={(e) =>
                        setSellerData((s) =>
                          s ? { ...s, business_email: e.target.value } : s,
                        )
                      }
                    />
                  </Field>
                </div>

                <Field label="Business Address">
                  <input
                    className={inputCls}
                    placeholder="Your business location"
                    value={sellerData.business_address || ""}
                    onChange={(e) =>
                      setSellerData((s) =>
                        s ? { ...s, business_address: e.target.value } : s,
                      )
                    }
                  />
                </Field>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 pt-2">
                  {[
                    {
                      label: "Listings",
                      value: sellerData.total_listings || 0,
                    },
                    { label: "Items Sold", value: sellerData.items_sold || 0 },
                    {
                      label: "Response Rate",
                      value: sellerData.response_rate || "0%",
                    },
                    { label: "Views", value: sellerData.view_count || 0 },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="text-center p-3 rounded-xl bg-slate-50"
                    >
                      <p className="text-lg font-black text-slate-900">
                        {value}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSellerInfo}
                    disabled={savingSeller}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-70 hover:shadow-lg"
                    style={{
                      background: savingSeller
                        ? "#CBD5E1"
                        : "linear-gradient(135deg,#F97316,#EA580C)",
                      boxShadow: savingSeller
                        ? "none"
                        : "0 4px 14px rgba(249,115,22,0.3)",
                    }}
                  >
                    {savingSeller ? (
                      <>
                        <FiRefreshCw size={13} className="animate-spin" />{" "}
                        Saving…
                      </>
                    ) : (
                      <>
                        <FiSave size={13} /> Save Business Info
                      </>
                    )}
                  </button>
                </div>
              </Section>
            )}

            {/* ── Security Tab ─────────────────────────────────────────────── */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <Section
                  icon={<FiLock size={17} />}
                  title="Security"
                  desc="Manage your password and account security"
                >
                  <div
                    className="rounded-2xl p-6 text-center"
                    style={{
                      background: "#F8FAFC",
                      border: "1px dashed #E2E8F0",
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                      <FiLock size={22} className="text-orange-400" />
                    </div>
                    <p className="font-black text-slate-800 mb-1">
                      Change Password
                    </p>
                    <p className="text-slate-400 text-sm mb-5">
                      Use the forgot password flow to securely update your
                      password via email verification.
                    </p>
                    <button
                      onClick={() => router.push("/forgot-password")}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:shadow-lg"
                      style={{
                        background: "linear-gradient(135deg,#F97316,#EA580C)",
                        boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
                      }}
                    >
                      Reset Password
                    </button>
                  </div>
                </Section>

                <Section
                  icon={<FiShield size={17} />}
                  title="Account Actions"
                  desc="Danger zone — irreversible actions"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Deactivate Seller Account
                      </p>
                      <p className="text-xs text-red-500 mt-0.5 font-medium">
                        Your listings will be hidden from the marketplace
                      </p>
                    </div>
                    <button className="mt-2 sm:mt-0 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 transition">
                      Deactivate
                    </button>
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>
      </SellerLayout>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setEditingField("profile");
        }}
        onUpload={handleImageUpload}
        currentImage={sellerData?.business_image}
        title={
          editingField === "business"
            ? "Update Business Logo"
            : "Update Profile Image"
        }
      />

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl animate-fade-in"
          style={{
            background:
              toastType === "success"
                ? "linear-gradient(145deg, #0F0A1A, #1A0F1F)"
                : "linear-gradient(135deg,#DC2626,#B91C1C)",
          }}
        >
          {toastType === "success" ? (
            <FiCheck size={15} className="text-emerald-400" />
          ) : (
            <FiAlertCircle size={15} />
          )}
          {toastMsg}
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default SellerSettingsPage;
