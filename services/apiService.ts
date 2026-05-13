// services/apiService.ts
// Exact port of apiService.js — all logic preserved

class ApiService {
  baseURL: string;

  constructor() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_BASE_URL) {
      console.warn("NEXT_PUBLIC_API_URL is not defined");
      this.baseURL = "";
      return;
    }
    this.baseURL = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  storeTokens(accessToken: string, refreshToken: string | null = null) {
    if (typeof window === "undefined") return;
    if (accessToken) localStorage.setItem("access_token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
  }

  clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken || this.isTokenExpired(refreshToken))
      throw new Error("No valid refresh token");
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    if (!response.ok) {
      this.clearTokens();
      throw new Error("Failed to refresh token");
    }
    const data = await response.json();
    this.storeTokens(data.access_token, data.refresh_token);
    return data.access_token;
  }

  async getValidAccessToken(): Promise<string | null> {
    let token = this.getAccessToken();
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      try {
        token = await this.refreshAccessToken();
      } catch {
        return null;
      }
    }
    return token;
  }

  extractErrorMessage(data: any, statusCode: number): string {
    if (data?.detail && typeof data.detail === "string") return data.detail;
    if (data?.detail?.message && typeof data.detail.message === "string")
      return data.detail.message;
    if (Array.isArray(data?.detail))
      return data.detail
        .map((e: any) => (e.loc ? `${e.loc.join(".")}: ${e.msg}` : e.msg))
        .join(", ");
    if (data?.message && typeof data.message === "string") return data.message;
    if (data?.error && typeof data.error === "string") return data.error;
    console.error("Unrecognised error response shape:", data);
    return `Request failed with status ${statusCode}`;
  }

  async makeRequest(
    endpoint: string,
    options: RequestInit & { headers?: any } = {},
  ): Promise<any> {
    if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
    const url = `${this.baseURL}${endpoint}`;

    const publicPrefixes = [
      "/auth/login",
      "/auth/register",
      "/auth/send-forgotten-password-code",
      "/auth/reset-password-with-code",
      "/auth/verify-email",
      "/auth/resend-verification-code",
      "/auth/google-sign-in",
      "/auth/refresh",
      "/delivery/public",
      "/category/get-all-categories",
      "/category/get-category",
      "/auth/public/get-school",
      "/auth/schools",
      
      "/campus-guide/search",
      "/service-provider/services/marketplace",
    ];

    const isPublic = publicPrefixes.some((ep) => endpoint.startsWith(ep));

    const config: RequestInit & { headers: any } = {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    };

    // For public endpoints, don't try to add auth token at all
    if (!isPublic) {
      const token = await this.getValidAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      let data: any;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      // Only log unexpected errors — 401 is a handled auth state, not a bug.
      if (!response.ok && response.status !== 401)
        console.error(`API Error [${response.status}] ${endpoint}:`, data);

      // For public endpoints, don't clear tokens on 401
      if (response.status === 401) {
        // Only clear tokens for non-public endpoints
        if (!isPublic) {
          const isServiceProviderEndpoint = endpoint.includes("/service-provider/");
          if (!isServiceProviderEndpoint) {
            this.clearTokens();
          }
        }
        throw new Error(
          data?.detail?.message ||
            data?.detail ||
            data?.message ||
            "Authentication required",
        );
      }
      if (!response.ok)
        throw new Error(this.extractErrorMessage(data, response.status));
      return data;
    } catch (error: any) {
      if (error.name === "TypeError" && error.message.includes("fetch"))
        throw new Error("Network error: Unable to connect to server.");
      throw error;
    }
  }

  async register({
    firstName,
    lastName,
    email,
    username,
    password,
    confirmPassword,
    country,
    state,
    city,
    address,
    gender,
    schoolId,
    phone,
  }: any) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email.trim().toLowerCase(),
        username,
        password,
        confirm_password: confirmPassword,
        country,
        state,
        city,
        address: address || "",
        gender,
        school_id: schoolId || null,
        phone_number: phone,
      }),
    });
  }

  async login({ email, password }: { email: string; password: string }) {
    const response = await this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const tokens = response.data || response;
    if (tokens.access_token)
      this.storeTokens(tokens.access_token, tokens.refresh_token);
    return response;
  }

  async googleAuth(firebaseIdToken: string) {
    const response = await this.makeRequest(
      `/auth/google-sign-in/sign-up?firebase_id_token=${encodeURIComponent(firebaseIdToken)}`,
      { method: "POST" },
    );
    console.log("🔑 Google auth raw response:", response);
    const accessToken =
      response.access_token || response.data?.access_token || response.token;
    const refreshToken = response.refresh_token || response.data?.refresh_token;
    if (accessToken) {
      this.storeTokens(accessToken, refreshToken);
      console.log("✅ Tokens stored successfully");
    } else {
      console.log("❌ No access token found in response");
    }
    return response;
  }

  async completeProfile({
    username,
    gender,
    country,
    state,
    city,
    address,
    schoolId,
    phone,
  }: any) {
    return this.makeRequest("/auth/complete-profile", {
      method: "PUT",
      body: JSON.stringify({
        username,
        gender,
        country,
        state,
        city,
        address: address || "",
        school_id: schoolId || null,
        phone,
      }),
    });
  }

  async verifyEmail(email: string, code: string) {
    return this.makeRequest(
      `/auth/verify-email?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,
      { method: "POST" },
    );
  }

  async resendVerificationCode(email: string) {
    return this.makeRequest(
      `/auth/resend-verification-code?email=${encodeURIComponent(email)}`,
      { method: "POST" },
    );
  }

  async sendForgotPasswordCode(email: string) {
    return this.makeRequest(
      `/auth/send-forgotten-password-code?email=${encodeURIComponent(email)}`,
      { method: "POST" },
    );
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    return this.makeRequest(
      `/auth/reset-password-with-code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&new_password=${encodeURIComponent(newPassword)}&confirm_password=${encodeURIComponent(confirmPassword)}`,
      { method: "POST" },
    );
  }

  async getCurrentUser() {
    return this.makeRequest("/auth/get-current-user", { method: "GET" });
  }

  async updateLocation(locationData: any) {
    return this.makeRequest("/auth/update-location", {
      method: "PUT",
      body: JSON.stringify(locationData),
    });
  }

  async updateUserProfile(profileData: any) {
    return this.makeRequest("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify({
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
      }),
    });
  }

  async getAvailableSchools(country = "", state = "") {
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (state) params.append("state", state);
    const qs = params.toString();
    return this.makeRequest(`/auth/schools${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async getSchoolById(schoolId: string) {
    return this.makeRequest(`/auth/public/get-school/${schoolId}`, {
      method: "GET",
    });
  }

  async getPublicCategories(categoryType: string | null = null) {
    const params = new URLSearchParams();
    if (categoryType) params.append("category_type", categoryType);
    const qs = params.toString();
    return this.makeRequest(
      `/category/get-all-categories${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async getPublicCategory(categoryId: string) {
    return this.makeRequest(`/category/get-category/${categoryId}`, {
      method: "GET",
    });
  }

  async getAvailableDeliveryOptions(cartTotal = 0, totalWeight = 0) {
    return this.makeRequest(
      `/delivery/public/options/available?cart_total=${cartTotal}&total_weight=${totalWeight}`,
      { method: "GET" },
    );
  }

  async getDeliveryOptionDetails(deliveryId: string) {
    return this.makeRequest(`/delivery/public/options/${deliveryId}`, {
      method: "GET",
    });
  }

  async applyAsSeller(data: any) {
    return this.makeRequest("/seller/apply", {
      method: "POST",
      body: JSON.stringify({
        business_name: data.business_name,
        short_business_description: data.short_business_description,
        category_ids: data.business_category,
        business_address: data.business_address,
        seller_document: data.seller_document,
        seller_document_type: data.seller_document_type,
      }),
    });
  }

  async getApplicationStatus() {
    return this.makeRequest("/seller/status", { method: "GET" });
  }

  async getSellerDashboard() {
    return this.makeRequest("/seller/dashboard", { method: "GET" });
  }

  async applyAsServiceProvider(data: {
    business_name: string;
    business_bio: string;
    service_category: string[];
    whatsapp_number: string;
  }) {
    return this.makeRequest("/service-provider/apply", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyServiceProviderOTP(
    service_provider_id: string,
    otp_code: string,
  ) {
    return this.makeRequest("/service-provider/verify-otp", {
      method: "POST",
      body: JSON.stringify({ service_provider_id, otp_code }),
    });
  }

  async resendServiceProviderOTP(service_provider_id: string) {
    return this.makeRequest(
      `/service-provider/resend-otp?service_provider_id=${service_provider_id}`,
      { method: "POST" },
    );
  }

  async getServiceProviderDetails() {
    return this.makeRequest("/service-provider/details", { method: "GET" });
  }

  async updateServiceProviderProfile(data: {
    business_name?: string;
    business_bio?: string;
    logo_url?: string;
    cover_image_url?: string;
    whatsapp_number?: string;
  }) {
    return this.makeRequest("/service-provider/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async createService(data: {
    display_name: string;
    category_id: string;
    description: string;
    price_type: "fixed" | "starting_at" | "negotiable";
    starting_price: number;
    location: string;
    availability_schedule: Record<
      string,
      Array<{ start: string; end: string }>
    >;
    booking_mode: "request" | "instant";
  }) {
    return this.makeRequest("/service-provider/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMarketplaceServices(params?: {
    category_id?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
    available_now?: boolean;
    sort_by?: "top_rated" | "most_reviewed" | "lowest_price";
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category_id)
      queryParams.append("category_id", params.category_id);
    if (params?.min_price)
      queryParams.append("min_price", params.min_price.toString());
    if (params?.max_price)
      queryParams.append("max_price", params.max_price.toString());
    if (params?.location) queryParams.append("location", params.location);
    if (params?.available_now) queryParams.append("available_now", "true");
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.limit != null)
      queryParams.append("limit", params.limit.toString());
    if (params?.offset != null)
      queryParams.append("offset", params.offset.toString());
    const qs = queryParams.toString();
    return this.makeRequest(
      `/service-provider/services/marketplace${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async getMyService() {
    return this.makeRequest("/service-provider/services/my-services", {
      method: "GET",
    });
  }

  async getServiceById(service_id: string) {
    return this.makeRequest(`/service-provider/services/${service_id}`, {
      method: "GET",
    });
  }

  async updateService(
    service_id: string,
    data: {
      display_name?: string;
      description?: string;
      price_type?: "fixed" | "starting_at" | "negotiable";
      starting_price?: number;
      location?: string;
      availability_schedule?: Record<
        string,
        Array<{ start: string; end: string }>
      >;
      booking_mode?: "request" | "instant";
      is_active?: boolean;
    },
  ) {
    return this.makeRequest(`/service-provider/services/${service_id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteService(service_id: string) {
    return this.makeRequest(`/service-provider/services/${service_id}`, {
      method: "DELETE",
    });
  }

  async getCampusGuides(params?: {
    school_id?: string;
    category?: string;
    search?: string;
    must_know?: boolean;
    sort_by?: "popular" | "rating" | "newest" | "name" | "must_know";
    page?: number;
    limit?: number;
  }) {
    const q = new URLSearchParams();
    if (params?.school_id) q.append("school_id", params.school_id);
    if (params?.category) q.append("category", params.category);
    if (params?.search) q.append("search", params.search);
    if (params?.must_know != null)
      q.append("must_know", String(params.must_know));
    if (params?.sort_by) q.append("sort_by", params.sort_by);
    if (params?.page) q.append("page", String(params.page));
    if (params?.limit) q.append("limit", String(params.limit));
    const qs = q.toString();
    return this.makeRequest(`/campus-guide/search${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async getCampusGuideById(guide_id: string) {
    return this.makeRequest(`/campus-guide/${guide_id}`, { method: "GET" });
  }

  async getGuideReviews(
    guide_id: string,
    params?: { page?: number; limit?: number; verified_only?: boolean },
  ) {
    const q = new URLSearchParams();
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.limit != null) q.append("limit", String(params.limit));
    if (params?.verified_only != null)
      q.append("verified_only", String(params.verified_only));
    const qs = q.toString();
    return this.makeRequest(
      `/campus-guide/${guide_id}/reviews${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async createCampusReview(data: {
    rating: number;
    review: string;
    is_verified?: boolean;
    campus_guide_id: string;
  }) {
    return this.makeRequest("/campus-guide/reviews/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCampusReview(
    review_id: string,
    data: {
      rating?: number;
      review?: string;
      is_verified?: boolean;
      campus_guide_id?: string;
    },
  ) {
    return this.makeRequest(`/campus-guide/reviews/${review_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCampusReview(review_id: string) {
    return this.makeRequest(`/campus-guide/reviews/${review_id}`, {
      method: "DELETE",
    });
  }

  async getMyCampusReviews(params?: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.append("page", String(params.page));
    if (params?.limit) q.append("limit", String(params.limit));
    const qs = q.toString();
    return this.makeRequest(
      `/campus-guide/reviews/my-reviews${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  logout() {
    this.clearTokens();
  }
}

const apiService = new ApiService();

export default apiService;