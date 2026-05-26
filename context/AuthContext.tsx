"use client";
import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/firebase/firebase";
import ApiService from "@/services/apiService";

export const AuthContext = createContext<any>({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sellerMode, setSellerMode] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(false);

  const sellerChecked = useRef(false);
  const providerChecked = useRef(false);

  const effectiveIsServiceProvider = user ? isServiceProvider : false;

  const mapUserData = (userData: any, existingUser: any = null) => ({
    id: userData.user_id || userData.id,
    user_id: userData.user_id || userData.id,
    email: userData.email,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    full_name:
      `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
    gender: userData.gender,
    country: userData.country,
    state: userData.state,
    city: userData.city,
    address: userData.address || "",
    phone: userData.phone_number || existingUser?.phone || null,
    school_id: userData.school_id || existingUser?.school_id || null,
    schoolId: userData.school_id || existingUser?.schoolId || null,
    role: userData.role,
    is_active: userData.is_active,
    profile_complete: userData.profile_complete || false,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_login: userData.last_login,
    profile_image: userData.profile_image || null,
    photoURL: userData.profile_image || userData.photoURL || null,
    location: userData.location || null,
    seller_id: userData.seller_id || null,
    seller_status: userData.seller_status || null,
    has_applied_as_seller: userData.has_applied_as_seller || false,
    service_provider_id: userData.service_provider_id || null,
    service_provider_status: userData.service_provider_status || null,
    is_service_provider: userData.is_service_provider || false,
  });

  // ── Merge guest cart into the newly authenticated user's cart ──────────────
  // Call this right after login/google-auth/email-verification succeeds.
  // Non-fatal: if the merge fails we just log and continue.
  const mergeGuestCart = async () => {
    if (typeof window === "undefined") return;
    const guestSessionId = localStorage.getItem("guest_session_id");
    if (!guestSessionId) return;
    try {
      await ApiService.mergeCart(guestSessionId);
      localStorage.removeItem("guest_session_id");
    } catch (err) {
      // Non-critical — user's account cart still works; guest items may be lost.
      console.warn("Cart merge failed (non-fatal):", err);
    }
  };

  // ── Service provider check ────────────────────────────────────────────────
  const checkServiceProviderStatus = useCallback(async (userId: string) => {
    try {
      const response = await ApiService.getServiceProviderDetails();
      const providerData = response?.data || response;
      const isProvider = !!(
        providerData?.id && providerData?.provider_status === "active"
      );
      setIsServiceProvider(isProvider);
      if (isProvider) {
        setUser((prevUser: any) => {
          if (!prevUser || prevUser.id !== userId) return prevUser;
          const updatedUser = {
            ...prevUser,
            service_provider_id: providerData.id,
            service_provider_status: providerData.provider_status ?? "active",
            is_service_provider: true,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
      return isProvider;
    } catch {
      setIsServiceProvider(false);
      return false;
    }
  }, []);

  // ── Auth persistence on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("access_token");
      const savedSellerMode = localStorage.getItem("sellerMode") === "true";
      setSellerMode(savedSellerMode);

      if (storedUser && accessToken) {
        if (!ApiService.isTokenExpired(accessToken)) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          await checkServiceProviderStatus(parsedUser.id);
          sellerChecked.current = true;
          providerChecked.current = true;
        } else {
          try {
            await ApiService.refreshAccessToken();
            const freshUser = await ApiService.getCurrentUser();
            const mappedUser = mapUserData(freshUser.data || freshUser);
            localStorage.setItem("user", JSON.stringify(mappedUser));
            setUser(mappedUser);
            await checkServiceProviderStatus(mappedUser.id);
            sellerChecked.current = true;
            providerChecked.current = true;
          } catch (error) {
            console.error("Token refresh failed:", error);
            ApiService.clearTokens();
            localStorage.removeItem("user");
            setUser(null);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Seller status check ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || sellerChecked.current) return;
    sellerChecked.current = true;
    ApiService.getApplicationStatus()
      .then((res: any) => {
        const is_seller_flag = res?.is_seller;
        const status =
          res?.data?.status ||
          res?.data?.seller_status ||
          res?.status ||
          res?.seller_status ||
          "";
        const isSellerResolved =
          is_seller_flag === true || status.toLowerCase() === "approved";
        setIsSeller(isSellerResolved);
        if (!isSellerResolved) {
          setSellerMode(false);
          localStorage.setItem("sellerMode", "false");
        }
      })
      .catch(() => {
        setIsSeller(false);
        setSellerMode(false);
        localStorage.setItem("sellerMode", "false");
      });
  }, [user]);

  // ── Service provider status check ─────────────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      if (!providerChecked.current) {
        providerChecked.current = true;
        checkServiceProviderStatus(user.id);
      }
    } else {
      providerChecked.current = false;
    }
  }, [user, checkServiceProviderStatus]);

  // ─── Auth actions ──────────────────────────────────────────────────────────

  const register = async (formData: any) => {
    const response = await ApiService.register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      address: formData.address || "",
      gender: formData.gender,
      schoolId: formData.schoolId,
      phone: formData.phone,
    });
    try {
      const freshUser = await ApiService.getCurrentUser();
      if (freshUser && (freshUser.data || freshUser)) {
        const mappedUser = mapUserData(freshUser.data || freshUser);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
        await checkServiceProviderStatus(mappedUser.id);
      }
    } catch {
      const basicUserData = response.data || response;
      const mappedUser = {
        id: basicUserData.user_id || basicUserData.id,
        email: basicUserData.email,
        username: basicUserData.username || formData.username,
        first_name: basicUserData.first_name || formData.firstName,
        last_name: basicUserData.last_name || formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        gender: formData.gender,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        address: formData.address || "",
        phone: formData.phone,
        school_id: formData.schoolId,
        schoolId: formData.schoolId,
        role: basicUserData.role || "user",
        is_active: basicUserData.is_active || false,
        profile_complete: false,
        created_at: basicUserData.created_at || new Date().toISOString(),
        profile_image: null,
        photoURL: null,
        location: null,
        seller_id: null,
        seller_status: null,
        has_applied_as_seller: false,
        service_provider_id: null,
        service_provider_status: null,
        is_service_provider: false,
      };
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setUser(mappedUser);
    }
    return response;
  };

  const login = async (email: string, password: string) => {
    const response = await ApiService.login({ email, password });
    const userData =
      response.data?.user || response.user || response.data || null;

    if (userData) {
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      try {
        const freshUser = await ApiService.getCurrentUser();
        if (freshUser && (freshUser.data || freshUser)) {
          const mappedUser = mapUserData(freshUser.data || freshUser);
          localStorage.setItem("user", JSON.stringify(mappedUser));
          setUser(mappedUser);
          await checkServiceProviderStatus(mappedUser.id);
          // Merge any guest cart items into this user's cart
          await mergeGuestCart();
          return mappedUser;
        }
      } catch (err: any) {
        console.warn("Could not fetch complete user after login:", err.message);
      }
      const mappedUser = mapUserData(userData, { phone: existingUser.phone });
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setUser(mappedUser);
      await checkServiceProviderStatus(mappedUser.id);
      // Merge any guest cart items into this user's cart
      await mergeGuestCart();
      return mappedUser;
    }
    return userData;
  };

  const googleLogin = async () => {
    if (!auth || !googleProvider)
      throw new Error("Google Sign-In is not configured yet.");
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const response = await ApiService.googleAuth(idToken);
    if (response.access_token) {
      ApiService.storeTokens(response.access_token, response.refresh_token);
    }
    let userData =
      response.data?.user || response.user || response.data || null;
    if (result.user.photoURL && userData) {
      userData.profile_image = result.user.photoURL;
      userData.photoURL = result.user.photoURL;
    }
    try {
      const freshUser = await ApiService.getCurrentUser();
      if (freshUser && (freshUser.data || freshUser)) {
        userData = freshUser.data || freshUser;
      }
    } catch (err: any) {
      console.warn("Could not fetch fresh user after Google login:", err.message);
    }
    const requiresProfileCompletion =
      !userData?.username ||
      !userData?.gender ||
      !userData?.country ||
      !userData?.phone;
    if (userData) {
      const mappedUser = mapUserData(userData);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setUser(mappedUser);
      await checkServiceProviderStatus(mappedUser.id);
      // Merge any guest cart items into this user's cart
      await mergeGuestCart();
    }
    return { userData, response, requiresProfileCompletion };
  };

  const completeProfile = async (profileData: any) => {
    const response = await ApiService.completeProfile({
      username: profileData.username,
      gender: profileData.gender,
      country: profileData.country,
      state: profileData.state,
      city: profileData.city,
      address: profileData.address || "",
      schoolId: profileData.schoolId,
      phone: profileData.phone,
    });
    try {
      const freshUser = await ApiService.getCurrentUser();
      if (freshUser && (freshUser.data || freshUser)) {
        const userData = freshUser.data || freshUser;
        const mappedUser = mapUserData(userData);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
        await checkServiceProviderStatus(mappedUser.id);
        return mappedUser;
      }
    } catch {
      const updated = { ...user, ...profileData };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      return updated;
    }
    return response;
  };

  const updateProfile = async (profileData: any) => {
    await ApiService.updateUserProfile({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      username: profileData.username,
      gender: profileData.gender,
      country: profileData.country,
      state: profileData.state,
      city: profileData.city,
      address: profileData.address || "",
      phone: profileData.phone,
      school_id: profileData.school_id || null,
    });
    const updatedUser = {
      ...user,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      full_name:
        `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim(),
      username: profileData.username,
      gender: profileData.gender,
      country: profileData.country,
      state: profileData.state,
      city: profileData.city,
      address: profileData.address || "",
      phone: profileData.phone,
      school_id: profileData.school_id,
      schoolId: profileData.school_id,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const verifyEmail = async (email: string, code: string) => {
    const response = await ApiService.verifyEmail(email, code);
    if (response.access_token)
      ApiService.storeTokens(response.access_token, response.refresh_token);
    if (response.access_token) {
      try {
        const freshUser = await ApiService.getCurrentUser();
        const mappedUser = mapUserData(freshUser.data || freshUser);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
        await checkServiceProviderStatus(mappedUser.id);
        // Merge any guest cart items into this user's cart
        await mergeGuestCart();
      } catch (err) {
        console.error("Failed to fetch user after verification:", err);
      }
    } else if (response.user) {
      const mappedUser = mapUserData(response.user);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setUser(mappedUser);
      await checkServiceProviderStatus(mappedUser.id);
      await mergeGuestCart();
    }
    return response;
  };

  const resendVerificationCode = async (email: string) =>
    ApiService.resendVerificationCode(email);

  const forgotPassword = async (email: string) =>
    ApiService.sendForgotPasswordCode(email);

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    ApiService.resetPasswordWithCode(email, code, newPassword, confirmPassword);

  const refreshUser = async () => {
    try {
      const freshUser = await ApiService.getCurrentUser();
      if (freshUser) {
        const userData = freshUser.data || freshUser;
        const mappedUser = mapUserData(userData, user);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
        await checkServiceProviderStatus(mappedUser.id);
        return mappedUser;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return null;
    }
  };

  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch {}
    // Clear everything auth-related
    localStorage.removeItem("user");
    localStorage.removeItem("sellerMode");
    // Remove guest session so a fresh one is created for the next guest session
    localStorage.removeItem("guest_session_id");
    ApiService.clearTokens();
    setUser(null);
    setSellerMode(false);
    setIsServiceProvider(false);
    sellerChecked.current = false;
    providerChecked.current = false;
  };

  const enterSellerMode = () => {
    setSellerMode(true);
    localStorage.setItem("sellerMode", "true");
  };
  const exitSellerMode = () => {
    setSellerMode(false);
    localStorage.setItem("sellerMode", "false");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        googleLogin,
        completeProfile,
        updateProfile,
        refreshUser,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPassword,
        logout,
        sellerMode,
        enterSellerMode,
        exitSellerMode,
        isSeller,
        isServiceProvider: effectiveIsServiceProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};