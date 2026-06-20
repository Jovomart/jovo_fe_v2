// app/(main)/seller/profile/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiCamera,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiShoppingBag,
  FiStar,
  FiTrendingUp,
  FiPackage,
  FiEye,
  FiUsers,
  FiArrowLeft,
  FiExternalLink,
  FiEdit3,
} from "react-icons/fi";
import { FaStore, FaCheckCircle } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerProfileData {
  id: string;
  business_name: string;
  short_business_description: string;
  seller_bio: string;
  business_address: string;
  business_phone_number: string;
  business_email: string;
  business_facebook: string;
  business_twitter: string;
  business_instagram: string;
  business_linkedin: string;
  business_website: string;
  business_location: string;
  business_image: string;
  cover_image: string | null;
  average_rating: number;
  review_count: number;
  total_listings: number;
  items_sold: number;
  response_time: string;
  response_rate: string;
  badges: string[];
  member_since: string;
  approval_status?: string;
  follower_count?: number;
  profile_views?: number;
  view_count?: number; // API returns view_count
}

interface ProfileViewer {
  id: string;
  viewer_name?: string;
  viewer_username?: string;
  viewer_image?: string;
  viewed_at: string;
  is_anonymous?: boolean;
}

type FormState = {
  business_name: string;
  short_business_description: string;
  seller_bio: string;
  business_address: string;
  business_phone_number: string;
  business_email: string;
  business_facebook: string;
  business_twitter: string;
  business_instagram: string;
  business_linkedin: string;
  business_website: string;
  business_location: string;
};

const EMPTY_FORM: FormState = {
  business_name: "",
  short_business_description: "",
  seller_bio: "",
  business_address: "",
  business_phone_number: "",
  business_email: "",
  business_facebook: "",
  business_twitter: "",
  business_instagram: "",
  business_linkedin: "",
  business_website: "",
  business_location: "",
};

const SOCIALS: {
  name: keyof FormState;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
}[] = [
  {
    name: "business_facebook",
    icon: <FiFacebook size={16} />,
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    name: "business_twitter",
    icon: <FiTwitter size={16} />,
    label: "Twitter / X",
    placeholder: "https://twitter.com/yourhandle",
  },
  {
    name: "business_instagram",
    icon: <FiInstagram size={16} />,
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    name: "business_linkedin",
    icon: <FiLinkedin size={16} />,
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourcompany",
  },
];

function timeAgo(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 outline-none transition-colors text-sm text-slate-900 placeholder:text-slate-400";

function Field({
  label,
  hint,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerOwnProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<SellerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [savedData, setSavedData] = useState<FormState>(EMPTY_FORM);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [businessImage, setBusinessImage] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"details" | "viewers">("details");
  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewersFetched, setViewersFetched] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedRef = useRef(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getMySellerProfile();
      const sellerData: SellerProfileData = response?.data ?? response;
      setProfile(sellerData);
      // cover_image may be null from API — default to empty string
      setCoverImage(sellerData.cover_image ?? "");
      setBusinessImage(sellerData.business_image ?? "");
      const next: FormState = {
        business_name: sellerData.business_name || "",
        short_business_description: sellerData.short_business_description || "",
        seller_bio: sellerData.seller_bio || "",
        business_address: sellerData.business_address || "",
        business_phone_number: sellerData.business_phone_number || "",
        business_email: sellerData.business_email || "",
        business_facebook: sellerData.business_facebook || "",
        business_twitter: sellerData.business_twitter || "",
        business_instagram: sellerData.business_instagram || "",
        business_linkedin: sellerData.business_linkedin || "",
        business_website: sellerData.business_website || "",
        business_location: sellerData.business_location || "",
      };
      setFormData(next);
      setSavedData(next);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      queueMicrotask(() => {
        fetchProfile();
      });
    }
  }, [fetchProfile]);

  const fetchViewers = useCallback(async () => {
    if (viewersFetched) return;
    try {
      setViewersLoading(true);
      const response = await apiService.getSellerProfileViewers({
        page: 1,
        per_page: 20,
      });
      const data = response?.data ?? response;
      const list = Array.isArray(data)
        ? data
        : data?.viewers || data?.items || [];
      setViewers(list);
      setViewersFetched(true);
    } catch {
      setViewersFetched(true);
    } finally {
      setViewersLoading(false);
    }
  }, [viewersFetched]);

  useEffect(() => {
    if (activeTab === "viewers" && !viewersFetched && !viewersLoading) {
      queueMicrotask(() => {
        fetchViewers();
      });
    }
  }, [activeTab, viewersFetched, viewersLoading, fetchViewers]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(savedData) ||
    coverImage !== (profile?.cover_image ?? "") ||
    businessImage !== (profile?.business_image ?? "");

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: Record<string, any> = { ...formData };
      if (coverImage !== (profile?.cover_image ?? ""))
        payload.cover_image = coverImage;
      if (businessImage !== (profile?.business_image ?? ""))
        payload.business_image = businessImage;
      await apiService.updateMySellerProfile(payload);
      setSuccess("Your store profile is up to date");
      await fetchProfile();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData(savedData);
    setCoverImage(profile?.cover_image ?? "");
    setBusinessImage(profile?.business_image ?? "");
  };

  // ── Image upload ───────────────────────────────────────────────────────────

  const uploadImage = async (
    file: File,
    uploadType: "seller_cover_image" | "seller_business_image",
    entityId?: string,
  ): Promise<string | null> => {
    try {
      const result = await apiService.uploadFiles(
        [file],
        uploadType as Parameters<typeof apiService.uploadFiles>[1],
        entityId,
      );
      const urls = Array.isArray(result)
        ? result
        : result?.urls || result?.files || result;
      const url = Array.isArray(urls)
        ? urls[0]?.url || urls[0]
        : urls?.url || urls;
      return typeof url === "string" ? url : null;
    } catch {
      return null;
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    const url = await uploadImage(file, "seller_cover_image", profile?.id);
    if (url) {
      setCoverImage(url);
    } else {
      setError("Failed to upload cover image. Please try again.");
    }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    const url = await uploadImage(file, "seller_business_image", profile?.id);
    if (url) {
      setBusinessImage(url);
    } else {
      setError("Failed to upload logo. Please try again.");
    }
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // ── Loading / error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400 text-sm tracking-wide">
            Loading your store…
          </p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <FiAlertCircle size={26} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          We couldn&apos;t load your store
        </h2>
        <p className="text-slate-500 text-sm text-center max-w-xs">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-orange-500 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const initials = (profile.business_name || "S")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Normalise approval_status — API may omit it, treat missing as "approved"
  const approvalStatus = profile.approval_status ?? "approved";

  // Normalise view count — API returns view_count, component may expect profile_views
  const viewCount = profile.view_count ?? profile.profile_views ?? 0;

  const handleViewPublicPage = () => {
    router.push(`/seller/${profile.id}`);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-32">
        {/* ── Cover + identity zone ── */}
        <div className="relative">
          {/* Cover image */}
          <div
            className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)",
            }}
          >
            {coverImage && (
              <Image
                src={coverImage}
                alt="Store cover"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            )}
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

            {/* Glow accents */}
            <div
              className="absolute -left-16 -top-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,#F97316 0%,transparent 70%)",
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-56 h-56 rounded-full opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,#6366F1 0%,transparent 70%)",
              }}
            />

            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 px-4 sm:px-6 pt-4 sm:pt-5 flex items-center justify-between z-20">
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/45 transition-colors"
              >
                <FiArrowLeft size={14} /> Dashboard
              </Link>

              <div className="flex items-center gap-2">
                {/* Cover change button */}
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/45 transition-colors disabled:opacity-60"
                >
                  {uploadingCover ? (
                    <FiLoader size={13} className="animate-spin" />
                  ) : (
                    <FiCamera size={13} />
                  )}
                  <span className="hidden sm:inline">
                    {uploadingCover ? "Uploading…" : "Change cover"}
                  </span>
                  <span className="sm:hidden">
                    {uploadingCover ? "…" : "Cover"}
                  </span>
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />

                {/* View public page */}
                <button
                  onClick={handleViewPublicPage}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-semibold hover:bg-white transition-colors"
                >
                  <FiExternalLink size={13} />
                  <span className="hidden sm:inline">View public page</span>
                  <span className="sm:hidden">Preview</span>
                </button>
              </div>
            </div>

            {/* Cover empty state hint */}
            {!coverImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <FiCamera size={28} className="text-white" />
                  <p className="text-white text-xs font-medium">
                    Click &quot;Change cover&quot; to add a cover photo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Identity card */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="relative -mt-16 sm:-mt-20 bg-white border border-slate-200 shadow-2xl shadow-slate-900/5 rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
                {/* Avatar with upload button */}
                <div className="relative shrink-0 group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-[3px] sm:border-4 border-slate-50 bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center relative">
                    {businessImage ? (
                      <Image
                        src={businessImage}
                        alt={profile.business_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-black text-white tracking-tight">
                        {initials}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-orange-500 border-2 border-slate-50 flex items-center justify-center text-white shadow-md hover:bg-orange-600 transition-colors disabled:opacity-60"
                    title="Change logo"
                  >
                    {uploadingAvatar ? (
                      <FiLoader size={13} className="animate-spin" />
                    ) : (
                      <FiCamera size={13} />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 pb-1 sm:pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                      {profile.business_name || "Your store"}
                    </h1>
                    {approvalStatus === "approved" && (
                      <MdVerified
                        className="text-orange-500 shrink-0"
                        size={20}
                        title="Verified seller"
                      />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {profile.short_business_description ||
                      "Add a tagline so shoppers know what you sell"}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FiUsers size={11} />{" "}
                      {(profile.follower_count ?? 0).toLocaleString()} followers
                    </span>
                    <span className="text-slate-200 text-xs">·</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FiEye size={11} /> {viewCount.toLocaleString()} views
                    </span>
                    {profile.business_location && (
                      <>
                        <span className="text-slate-200 text-xs">·</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <FiMapPin size={11} /> {profile.business_location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Approval banner — only show if status is explicitly non-approved */}
              {approvalStatus !== "approved" && (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 flex items-start sm:items-center gap-3 ${
                    approvalStatus === "rejected"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <FiAlertCircle
                    className={`shrink-0 mt-0.5 sm:mt-0 ${approvalStatus === "rejected" ? "text-red-500" : "text-amber-500"}`}
                    size={18}
                  />
                  <p
                    className={`text-sm font-medium ${
                      approvalStatus === "rejected"
                        ? "text-red-700"
                        : "text-amber-800"
                    }`}
                  >
                    {approvalStatus === "pending"
                      ? "Your store application is under review — we'll email you once it's approved."
                      : approvalStatus === "rejected"
                        ? "Your application was not approved. Contact support for details."
                        : `Store status: ${approvalStatus}`}
                  </p>
                </div>
              )}

              {/* Stat strip */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: <FiShoppingBag size={16} />,
                    label: "Listings",
                    value: (profile.total_listings ?? 0).toLocaleString(),
                    color: "#F97316",
                    bg: "#FFF7ED",
                  },
                  {
                    icon: <FiPackage size={16} />,
                    label: "Items sold",
                    value: (profile.items_sold ?? 0).toLocaleString(),
                    color: "#6366F1",
                    bg: "#EEF2FF",
                  },
                  {
                    icon: <FiStar size={16} />,
                    label: "Rating",
                    value: profile.review_count
                      ? `${Number(profile.average_rating || 0).toFixed(1)}`
                      : "—",
                    sub: profile.review_count
                      ? `${profile.review_count.toLocaleString()} reviews`
                      : "no reviews yet",
                    color: "#F59E0B",
                    bg: "#FFFBEB",
                  },
                  {
                    icon: <FiTrendingUp size={16} />,
                    label: "Response rate",
                    value: profile.response_rate || "—",
                    color: "#10B981",
                    bg: "#F0FDF4",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5"
                    style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="flex items-center gap-2 mb-1.5"
                      style={{ color: stat.color }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: stat.bg }}
                      >
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-lg font-black text-slate-900 leading-none">
                      {stat.value}
                    </p>
                    {"sub" in stat && stat.sub && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {stat.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
            {[
              {
                id: "details" as const,
                label: "Store details",
                icon: <FaStore size={13} />,
              },
              {
                id: "viewers" as const,
                label: "Profile viewers",
                icon: <FiEye size={13} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
          {success && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-700 text-sm font-medium">
              <FiCheck size={17} /> {success}
            </div>
          )}
          {error && profile && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-sm font-medium">
              <FiAlertCircle size={17} /> {error}
            </div>
          )}

          {activeTab === "details" ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* ── Left: form ── */}
              <div className="lg:col-span-2 space-y-5">
                {/* About */}
                <section
                  className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-7"
                  style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
                >
                  <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <FaStore className="text-orange-500" size={14} />
                    </div>
                    About your store
                  </h2>
                  <div className="space-y-5">
                    <Field label="Store name" required>
                      <input
                        type="text"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        placeholder="e.g. Aisha's Closet"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Tagline"
                      hint="One short line shown under your store name"
                    >
                      <input
                        type="text"
                        name="short_business_description"
                        value={formData.short_business_description}
                        onChange={handleInputChange}
                        placeholder="What makes your store special, in a few words"
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Store story"
                      hint="Tell shoppers about your business — shown on your public page"
                    >
                      <textarea
                        name="seller_bio"
                        value={formData.seller_bio}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Share your story, what you sell, and why customers should choose you…"
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </section>

                {/* Location */}
                <section
                  className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-7"
                  style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
                >
                  <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <FiMapPin className="text-indigo-500" size={14} />
                    </div>
                    Location
                  </h2>
                  <div className="space-y-5">
                    <Field
                      label="City / area"
                      hint="Shown publicly so buyers know where you're based"
                    >
                      <div className="relative">
                        <FiMapPin
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={15}
                        />
                        <input
                          type="text"
                          name="business_location"
                          value={formData.business_location}
                          onChange={handleInputChange}
                          placeholder="e.g. Port Harcourt, Rivers State"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>
                    <Field
                      label="Full address"
                      hint="Used for deliveries — kept private"
                    >
                      <input
                        type="text"
                        name="business_address"
                        value={formData.business_address}
                        onChange={handleInputChange}
                        placeholder="Street, building, landmark"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                {/* Contact */}
                <section
                  className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-7"
                  style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
                >
                  <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                      <FiMail className="text-sky-500" size={14} />
                    </div>
                    Contact information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Business email">
                      <div className="relative">
                        <FiMail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={15}
                        />
                        <input
                          type="email"
                          name="business_email"
                          value={formData.business_email}
                          onChange={handleInputChange}
                          placeholder="contact@yourbusiness.com"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>
                    <Field label="Business phone">
                      <div className="relative">
                        <FiPhone
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={15}
                        />
                        <input
                          type="tel"
                          name="business_phone_number"
                          value={formData.business_phone_number}
                          onChange={handleInputChange}
                          placeholder="08012345678"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>
                    <Field label="Website" className="sm:col-span-2">
                      <div className="relative">
                        <FiGlobe
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={15}
                        />
                        <input
                          type="url"
                          name="business_website"
                          value={formData.business_website}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>
                </section>

                {/* Social */}
                <section
                  className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-7"
                  style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
                >
                  <h2 className="text-base font-black text-slate-900 mb-5">
                    Social media
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {SOCIALS.map((social) => (
                      <Field key={social.name} label={social.label}>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            {social.icon}
                          </span>
                          <input
                            type="url"
                            name={social.name}
                            value={formData[social.name]}
                            onChange={handleInputChange}
                            placeholder={social.placeholder}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </Field>
                    ))}
                  </div>
                </section>
              </div>

              {/* ── Right sidebar ── */}
              <div className="space-y-5">
                <div className="lg:sticky lg:top-6 space-y-5">
                  {/* Live preview */}
                  <div
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
                    style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-5 pt-5 pb-2.5 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        How buyers see you
                      </p>
                      <button
                        onClick={handleViewPublicPage}
                        className="text-[11px] font-bold text-orange-500 hover:underline flex items-center gap-1"
                      >
                        Open <FiExternalLink size={11} />
                      </button>
                    </div>
                    {/* Mini cover */}
                    <div
                      className="relative h-20"
                      style={{
                        background: "linear-gradient(135deg,#0F172A,#1E293B)",
                      }}
                    >
                      {coverImage && (
                        <Image
                          src={coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                      {!coverImage && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <FiCamera size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="px-5 pb-5 -mt-7">
                      <div className="w-14 h-14 rounded-xl border-[3px] border-white bg-slate-900 overflow-hidden relative shadow-sm flex items-center justify-center">
                        {businessImage ? (
                          <Image
                            src={businessImage}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-sm font-black text-white">
                            {initials}
                          </span>
                        )}
                      </div>
                      <p className="mt-2.5 font-black text-slate-900 text-sm truncate">
                        {formData.business_name || "Your store name"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {formData.short_business_description ||
                          "Your tagline will appear here"}
                      </p>
                      {formData.business_location && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                          <FiMapPin size={11} /> {formData.business_location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  {profile.badges && profile.badges.length > 0 && (
                    <div
                      className="bg-white rounded-3xl border border-slate-100 p-5"
                      style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
                    >
                      <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                        <MdVerified className="text-orange-500" size={16} />{" "}
                        Badges
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600"
                          >
                            <FaCheckCircle
                              className="text-emerald-500"
                              size={11}
                            />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member since / stats card */}
                  <div
                    className="rounded-3xl p-5 text-white overflow-hidden relative"
                    style={{
                      background:
                        "linear-gradient(135deg,#0F172A 0%,#1E293B 100%)",
                      boxShadow: "0 4px 24px rgba(15,23,42,0.25)",
                    }}
                  >
                    <div
                      className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-20 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle,#F97316 0%,transparent 70%)",
                      }}
                    />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1">
                      Seller since
                    </p>
                    <p className="text-lg font-black">
                      {profile.member_since
                        ? typeof profile.member_since === "string" &&
                          profile.member_since.includes(" ")
                          ? // already formatted e.g. "May 2026"
                            profile.member_since
                          : new Date(profile.member_since).toLocaleDateString(
                              undefined,
                              { month: "long", year: "numeric" },
                            )
                        : "—"}
                    </p>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60 flex items-center gap-1.5">
                        <FiUsers size={14} /> Followers
                      </span>
                      <span className="font-bold">
                        {(profile.follower_count ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2.5">
                      <span className="text-white/60 flex items-center gap-1.5">
                        <FiEye size={14} /> Profile views
                      </span>
                      <span className="font-bold">
                        {viewCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Viewers tab ── */
            <div
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.04)" }}
            >
              <div
                className="p-5 sm:p-7 flex items-center justify-between"
                style={{ borderBottom: "1px solid #F1F5F9" }}
              >
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <FiEye className="text-indigo-500" size={14} />
                    </div>
                    Who viewed your store
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    People who recently visited your public store page
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-black text-slate-900">
                    {viewCount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    total views
                  </p>
                </div>
              </div>

              {viewersLoading ? (
                <div className="p-10 flex flex-col items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading viewers…</p>
                </div>
              ) : viewers.length === 0 ? (
                <div className="p-10 sm:p-16 flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-1">
                    <FiEye className="text-slate-300" size={22} />
                  </div>
                  <h3 className="font-bold text-slate-700">
                    No named viewers yet
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Your store has {viewCount} total view
                    {viewCount !== 1 ? "s" : ""}. Once logged-in shoppers visit,
                    they&apos;ll appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {viewers.map((viewer, idx) => (
                    <li
                      key={
                        viewer.id ??
                        viewer.viewer_username ??
                        viewer.viewer_name ??
                        idx
                      }
                      className="flex items-center gap-3.5 px-5 sm:px-7 py-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0">
                        {viewer.viewer_image ? (
                          <Image
                            src={viewer.viewer_image}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xs font-black text-slate-400">
                            {viewer.is_anonymous
                              ? "?"
                              : (viewer.viewer_name?.[0] || "U").toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {viewer.is_anonymous
                            ? "Anonymous shopper"
                            : viewer.viewer_name ||
                              viewer.viewer_username ||
                              "Shopper"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {timeAgo(viewer.viewed_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating save bar ── */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 sm:pb-6">
          <div className="max-w-5xl mx-auto">
            <div
              className="rounded-2xl shadow-2xl shadow-black/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4"
              style={{
                background: "linear-gradient(135deg,#0F172A,#1E293B)",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            >
              <p className="text-sm text-white/80 hidden sm:block">
                You have unsaved changes to your store profile
              </p>
              <p className="text-sm text-white/80 sm:hidden">Unsaved changes</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDiscard}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <FiX size={15} /> Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.business_name.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#F97316,#EA580C)",
                    boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                  }}
                >
                  {saving ? (
                    <FiLoader size={15} className="animate-spin" />
                  ) : (
                    <FiSave size={15} />
                  )}
                  {saving ? "Saving…" : "Save changes"}
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

export default SellerOwnProfilePage;