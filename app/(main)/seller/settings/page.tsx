"use client";

import { useState, useEffect, useContext, useCallback } from "react";
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
} from "react-icons/fi";

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
}

interface SellerForm {
  business_name: string;
  business_bio: string;
  logo_url: string;
  whatsapp_number: string;
}

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
  id,
  icon,
  title,
  desc,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) => (
  <div
    id={id}
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

// ─── Notification Row Component (moved outside to avoid useState inside callback) ───
const NotificationRow = ({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn: boolean;
}) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
    >
      <div>
        <p className="text-sm font-bold text-slate-800">
          {label}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {desc}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          on ? "bg-orange-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SellerSettingsPage = () => {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext) as any;

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
  });

  const [sellerInfo, setSellerInfo] = useState<SellerForm>({
    business_name: "",
    business_bio: "",
    logo_url: "",
    whatsapp_number: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [sellerError, setSellerError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // FIX: Use useCallback to memoize the load function and add missing dependency
  const loadUserAndSeller = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const [userRes, sellerRes] = await Promise.all([
        apiService.getCurrentUser().catch(() => null),
        apiService.getSellerDashboard().catch(() => null),
      ]);

      const u = userRes?.data ?? userRes ?? user;
      if (u) {
        setProfile({
          first_name: u.first_name ?? "",
          last_name: u.last_name ?? "",
          username: u.username ?? "",
          gender: u.gender ?? "",
          country: u.country ?? "",
          state: u.state ?? "",
          city: u.city ?? "",
          address: u.address ?? "",
          phone: u.phone_number ?? u.phone ?? "",
        });
      }

      const s = sellerRes?.data ?? sellerRes;
      if (s) {
        setSellerInfo({
          business_name: s.business_name ?? s.seller?.business_name ?? "",
          business_bio:
            s.business_bio ?? s.seller?.business_bio ?? "",
          logo_url: s.logo_url ?? s.seller?.logo_url ?? "",
          whatsapp_number:
            s.whatsapp_number ?? s.seller?.whatsapp_number ?? "",
        });
      }
    } catch {}
    setLoadingProfile(false);
  }, [user]);

  // FIX: Add 'loadUserAndSeller' to dependency array (was missing)
  useEffect(() => {
    loadUserAndSeller();
  }, [loadUserAndSeller]);

  const handleSaveProfile = async () => {
    setProfileError("");
    setSavingProfile(true);
    try {
      await apiService.updateUserProfile(profile);
      showToast("Profile updated successfully!");
    } catch (err: any) {
      const msg = err.message ?? "Failed to update profile.";
      setProfileError(msg);
      showToast(msg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSellerInfo = async () => {
    setSellerError("");
    setSavingSeller(true);
    try {
      await apiService.updateServiceProviderProfile({
        business_name: sellerInfo.business_name,
        business_bio: sellerInfo.business_bio,
        logo_url: sellerInfo.logo_url || undefined,
        whatsapp_number: sellerInfo.whatsapp_number || undefined,
      });
      showToast("Business info updated successfully!");
    } catch (err: any) {
      const msg = err.message ?? "Failed to update business info.";
      setSellerError(msg);
      showToast(msg, "error");
    } finally {
      setSavingSeller(false);
    }
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: <FiUser size={14} /> },
    { id: "business", label: "Business", icon: <FiShoppingBag size={14} /> },
    { id: "security", label: "Security", icon: <FiShield size={14} /> },
    { id: "notifications", label: "Alerts", icon: <FiBell size={14} /> },
  ];

  // Notification preferences array - moved outside of render to avoid recreating on each render
  const notificationOptions = [
    {
      label: "New Order",
      desc: "When a customer places an order for your product",
      defaultOn: true,
    },
    {
      label: "Order Cancelled",
      desc: "When a customer cancels their order",
      defaultOn: true,
    },
    {
      label: "Payment Received",
      desc: "When a payment clears into your wallet",
      defaultOn: true,
    },
    {
      label: "Product Approved",
      desc: "When admin approves or rejects a listing",
      defaultOn: true,
    },
    {
      label: "Promotional Emails",
      desc: "Platform tips, seller guides and feature updates",
      defaultOn: false,
    },
  ];

  return (
    <>
      <SellerLayout
        activeNav="settings"
        pageTitle="Settings"
        isLoading={loadingProfile}
      >
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
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* ── Profile Tab ───────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                {/* Avatar */}
                <div
                  className="bg-white rounded-3xl border border-slate-100 p-6"
                  style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg,#F97316,#DC2626)",
                        boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                      }}
                    >
                      {(profile.first_name?.[0] ?? "S").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-slate-400 text-sm font-medium">
                        @{profile.username}
                      </p>
                    </div>
                  </div>
                </div>

                <Section
                  id="profile-form"
                  icon={<FiUser size={17} />}
                  title="Personal Information"
                  desc="Update your name, username, and contact details"
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
                    <Field label="First Name">
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
                    <Field label="Last Name">
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
                    <Field label="Username">
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
                    <Field label="Phone">
                      <input
                        className={inputCls}
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                      />
                    </Field>
                  </div>

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

                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Country">
                      <input
                        className={inputCls}
                        value={profile.country}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            country: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="State">
                      <input
                        className={inputCls}
                        value={profile.state}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="City">
                      <input
                        className={inputCls}
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
                      value={profile.address}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          address: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-70"
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
            {activeTab === "business" && (
              <Section
                id="business-form"
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

                <Field label="Business Name" required>
                  <input
                    className={inputCls}
                    placeholder="Your store or business name"
                    value={sellerInfo.business_name}
                    onChange={(e) =>
                      setSellerInfo((s) => ({
                        ...s,
                        business_name: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field
                  label="Business Bio"
                  hint="Short description that appears on your seller profile"
                >
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={4}
                    placeholder="Tell buyers about your business…"
                    value={sellerInfo.business_bio}
                    onChange={(e) =>
                      setSellerInfo((s) => ({
                        ...s,
                        business_bio: e.target.value,
                      }))
                    }
                    maxLength={500}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {sellerInfo.business_bio.length}/500
                  </p>
                </Field>

                <Field
                  label="Logo URL"
                  hint="Paste a URL to your business logo image"
                >
                  <input
                    className={inputCls}
                    placeholder="https://…/logo.png"
                    value={sellerInfo.logo_url}
                    onChange={(e) =>
                      setSellerInfo((s) => ({
                        ...s,
                        logo_url: e.target.value,
                      }))
                    }
                  />
                  {/* FIX: Replace img with Image */}
                  {sellerInfo.logo_url && (
                    <div className="mt-3 w-16 h-16 rounded-xl overflow-hidden border border-slate-200 relative">
                      <Image
                        src={sellerInfo.logo_url}
                        alt="Logo preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display = "none")
                        }
                      />
                    </div>
                  )}
                </Field>

                <Field
                  label="WhatsApp Number"
                  hint="Buyers can contact you directly via WhatsApp"
                >
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="+2348012345678"
                    value={sellerInfo.whatsapp_number}
                    onChange={(e) =>
                      setSellerInfo((s) => ({
                        ...s,
                        whatsapp_number: e.target.value,
                      }))
                    }
                  />
                </Field>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSellerInfo}
                    disabled={savingSeller}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-70"
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
                  id="security"
                  icon={<FiLock size={17} />}
                  title="Security"
                  desc="Manage your password and account security"
                >
                  <div
                    className="rounded-2xl p-5 text-center"
                    style={{ background: "#F8FAFC", border: "1px dashed #E2E8F0" }}
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
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg,#F97316,#EA580C)",
                      }}
                    >
                      Reset Password
                    </button>
                  </div>
                </Section>

                <Section
                  id="danger"
                  icon={<FiShield size={17} />}
                  title="Account Actions"
                  desc="Danger zone — irreversible actions"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                      <div>
                        <p className="text-sm font-bold text-red-800">
                          Deactivate Seller Account
                        </p>
                        <p className="text-xs text-red-500 mt-0.5 font-medium">
                          Your listings will be hidden from the marketplace
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 transition">
                        Deactivate
                      </button>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* ── Notifications Tab ─────────────────────────────────────────── */}
            {/* FIX: Moved useState outside of map to separate component */}
            {activeTab === "notifications" && (
              <Section
                id="notifications"
                icon={<FiBell size={17} />}
                title="Notification Preferences"
                desc="Choose what you want to be notified about"
              >
                <div className="space-y-3">
                  {notificationOptions.map(({ label, desc, defaultOn }) => (
                    <NotificationRow
                      key={label}
                      label={label}
                      desc={desc}
                      defaultOn={defaultOn}
                    />
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToast("Notification preferences saved!")}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#F97316,#EA580C)",
                      boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
                    }}
                  >
                    <FiSave size={13} /> Save Preferences
                  </button>
                </div>
              </Section>
            )}
          </div>
        </div>
      </SellerLayout>

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl"
          style={{
            background:
              toastType === "success"
                ? "linear-gradient(135deg,#059669,#047857)"
                : "linear-gradient(135deg,#DC2626,#B91C1C)",
          }}
        >
          {toastType === "success" ? (
            <FiCheck size={15} />
          ) : (
            <FiAlertCircle size={15} />
          )}
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default SellerSettingsPage;