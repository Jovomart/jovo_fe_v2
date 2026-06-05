// app/(main)/seller/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiSave,
  FiEdit2,
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
  FiClock,
  FiTrendingUp,
  FiPackage,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaStore,
  FaCheckCircle,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import Footer from "@/components/layout/Footer";
import apiService from "@/services/apiService";

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
  cover_image: string;
  average_rating: number;
  review_count: number;
  total_listings: number;
  items_sold: number;
  response_time: string;
  response_rate: string;
  badges: string[];
  member_since: string;
  approval_status: string;
}

const SellerOwnProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<SellerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMySellerProfile();
      const sellerData = response?.data ?? response;
      setProfile(sellerData);
      setFormData({
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
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await apiService.updateMySellerProfile(formData);
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Refresh profile data
      await fetchProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader size={36} className="animate-spin text-[#B42225] mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <FiAlertCircle size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-700">Failed to load profile</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-6 py-2.5 bg-[#B42225] text-white rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Store Profile</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your business information and store settings
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#B42225] text-white rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition"
              >
                <FiEdit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // Reset form
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  <FiX size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B42225] text-white rounded-xl text-sm font-semibold hover:bg-[#9e1e20] transition disabled:opacity-50"
                >
                  {saving ? <FiLoader size={16} className="animate-spin" /> : <FiSave size={16} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
              <FiCheck size={18} />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <FiAlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Approval Status Banner */}
          {profile.approval_status !== "approved" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <FiAlertCircle className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Application Status: {profile.approval_status}</p>
                  <p className="text-sm text-amber-700">
                    {profile.approval_status === "pending" 
                      ? "Your seller application is being reviewed. You'll receive an email once approved."
                      : profile.approval_status === "rejected"
                      ? "Your application was rejected. Please contact support for more information."
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <FiShoppingBag size={20} />, label: "Total Listings", value: profile.total_listings || 0 },
              { icon: <FiPackage size={20} />, label: "Items Sold", value: profile.items_sold || 0 },
              { icon: <FiStar size={20} className="text-amber-400" />, label: "Rating", value: `${profile.average_rating || 0} (${profile.review_count || 0} reviews)` },
              { icon: <FiTrendingUp size={20} className="text-emerald-500" />, label: "Response Rate", value: profile.response_rate || "—" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                    <p className="text-base font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Profile Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FaStore className="text-[#B42225]" /> Business Information
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition"
                    placeholder="Your business name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.business_name}</p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="short_business_description"
                    value={formData.short_business_description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition"
                    placeholder="Brief description of your store"
                  />
                ) : (
                  <p className="text-gray-600">{profile.short_business_description || "—"}</p>
                )}
              </div>

              {/* Full Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Business Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="seller_bio"
                    value={formData.seller_bio}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition"
                    placeholder="Tell customers about your business..."
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-wrap">{profile.seller_bio || "—"}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiMapPin className="inline mr-2" size={14} />
                  Business Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="business_location"
                    value={formData.business_location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition"
                    placeholder="City, State"
                  />
                ) : (
                  <p className="text-gray-600">{profile.business_location || "—"}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Business Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition"
                    placeholder="Street address"
                  />
                ) : (
                  <p className="text-gray-600">{profile.business_address || "—"}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <FiMail className="text-[#B42225]" /> Contact Information
              </h2>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="business_email"
                      value={formData.business_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition bg-white"
                      placeholder="contact@yourbusiness.com"
                    />
                  ) : (
                    <p className="text-gray-600">{profile.business_email || "—"}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" size={14} />
                    Business Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="business_phone_number"
                      value={formData.business_phone_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition bg-white"
                      placeholder="08012345678"
                    />
                  ) : (
                    <p className="text-gray-600">{profile.business_phone_number || "—"}</p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiGlobe className="inline mr-2" size={14} />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="business_website"
                      value={formData.business_website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition bg-white"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    profile.business_website ? (
                      <a href={profile.business_website} target="_blank" rel="noopener noreferrer" className="text-[#B42225] hover:underline">
                        {profile.business_website}
                      </a>
                    ) : <p className="text-gray-600">—</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="p-6 border-t border-gray-100">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                Social Media
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "business_facebook", icon: <FiFacebook size={18} />, label: "Facebook", placeholder: "https://facebook.com/yourpage" },
                  { name: "business_twitter", icon: <FiTwitter size={18} />, label: "Twitter", placeholder: "https://twitter.com/yourhandle" },
                  { name: "business_instagram", icon: <FiInstagram size={18} />, label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
                  { name: "business_linkedin", icon: <FiLinkedin size={18} />, label: "LinkedIn", placeholder: "https://linkedin.com/company/yourcompany" },
                ].map((social) => (
                  <div key={social.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      {social.icon} {social.label}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name={social.name}
                        value={formData[social.name as keyof typeof formData] as string}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B42225] focus:ring-1 focus:ring-[#B42225] outline-none transition"
                        placeholder={social.placeholder}
                      />
                    ) : (
                      (formData[social.name as keyof typeof formData] ? (
                        <a href={formData[social.name as keyof typeof formData] as string} target="_blank" rel="noopener noreferrer" className="text-[#B42225] hover:underline">
                          {formData[social.name as keyof typeof formData] as string}
                        </a>
                      ) : <p className="text-gray-600">—</p>)
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Badges & Achievements */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                  <MdVerified className="text-[#B42225]" size={20} />
                  Badges & Achievements
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700">
                      <FaCheckCircle className="text-emerald-500" size={12} />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerOwnProfilePage;