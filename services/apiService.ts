// src/services/apiService.ts

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
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {},
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
      "/category/subcategory/get-all-subcategories",
      "/category/subcategory/get-subcategory",
      "/auth/public/get-school",
      "/auth/schools",
      "/campus-guide/search",
      "/service-provider/services/marketplace",
      "/cart/clear",
      "/cart/remove",
      "/cart/update",
      "/cart/validate",
      "/marketspace",
      "/products/",
      "/seller/",
    ];

    const isPublic = publicPrefixes.some((ep) => endpoint.startsWith(ep));
    const isOptionalCartEndpoint =
      endpoint === "/cart" ||
      endpoint.startsWith("/cart?") ||
      endpoint === "/cart/add" ||
      endpoint.startsWith("/cart/add?");

    const effectivelyPublic = isPublic || isOptionalCartEndpoint;
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {};

    if (!isFormData && options.body) {
      headers["Content-Type"] = "application/json";
    }

    const token = await this.getValidAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        if (isFormData && k.toLowerCase() === "content-type") continue;
        headers[k] = v;
      }
    }

    const config: RequestInit = {
      method: options.method ?? "GET",
      headers,
      body: options.body,
    };

    try {
      const response = await fetch(url, config);
      let data: any;
      const text = await response.text();

      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message: text || `Request failed with status ${response.status}`,
        };
      }

      if (response.status === 401) {
        if (!effectivelyPublic) {
          const isServiceProviderEndpoint =
            endpoint.includes("/service-provider/");
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

      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(data, response.status);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      if (error.name === "TypeError" && error.message.includes("fetch"))
        throw new Error("Network error: Unable to connect to server.");
      throw error;
    }
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────────

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
    const accessToken =
      response.access_token || response.data?.access_token || response.token;
    const refreshToken = response.refresh_token || response.data?.refresh_token;
    if (accessToken) this.storeTokens(accessToken, refreshToken);
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

  // ─── CATEGORIES ────────────────────────────────────────────────────────────

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

  async getAllSubcategories(
    category_id?: string,
    include_effective_schema = false,
  ) {
    const params = new URLSearchParams();
    if (category_id) params.append("category_id", category_id);
    params.append("include_effective_schema", String(include_effective_schema));
    return this.makeRequest(
      `/category/subcategory/get-all-subcategories?${params.toString()}`,
      { method: "GET" },
    );
  }

  async getSubcategoryById(
    subcategory_id: string,
    include_effective_schema = true,
  ) {
    const params = new URLSearchParams();
    params.append("include_effective_schema", String(include_effective_schema));
    return this.makeRequest(
      `/category/subcategory/get-subcategory/${encodeURIComponent(subcategory_id)}?${params.toString()}`,
      { method: "GET" },
    );
  }

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────

  /**
   * Fetch a single product by ID (public, no auth required).
   * Also increments the product's view_count by 1 (used for analytics).
   * Returns full product details including seller info, pricing, media,
   * stock scarcity indicators, warranty, return policy, and SEO fields.
   */
  async getProductById(product_id: string): Promise<any> {
    return this.makeRequest(`/products/${encodeURIComponent(product_id)}`, {
      method: "GET",
    });
  }

  // ─── MARKETSPACE ───────────────────────────────────────────────────────────

  async getShopHomepage(limitPerCategory = 4, includeEmpty = false) {
    const params = new URLSearchParams({
      limit_per_category: String(limitPerCategory),
      include_empty: String(includeEmpty),
    });
    return this.makeRequest(`/marketspace/shop-homepage?${params.toString()}`, {
      method: "GET",
    });
  }

  async getCategoryMarketspace(categoryId: string, params?: any) {
    const q = new URLSearchParams();
    if (params?.subcategory_id)
      q.append("subcategory_id", params.subcategory_id);
    if (params?.min_price != null)
      q.append("min_price", String(params.min_price));
    if (params?.max_price != null)
      q.append("max_price", String(params.max_price));
    if (params?.condition) q.append("condition", params.condition);
    if (params?.brand) q.append("brand", params.brand);
    if (params?.on_sale != null) q.append("on_sale", String(params.on_sale));
    if (params?.search) q.append("search", params.search);
    if (params?.sort_by) q.append("sort_by", params.sort_by);
    if (params?.limit != null) q.append("limit", String(params.limit));
    if (params?.offset != null) q.append("offset", String(params.offset));
    const qs = q.toString();
    return this.makeRequest(
      `/marketspace/category/${encodeURIComponent(categoryId)}${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async getTrendingProducts(params?: { limit?: number; hours?: number }) {
    const q = new URLSearchParams();
    if (params?.limit != null) q.append("limit", String(params.limit));
    if (params?.hours != null) q.append("hours", String(params.hours));
    const qs = q.toString();
    return this.makeRequest(`/marketspace/trending${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async getActiveFlashSaleCampaign(): Promise<any> {
    return this.makeRequest("/marketspace/flash-sales", { method: "GET" });
  }

  async getTopSellingProducts(params?: { limit?: number; days?: number }) {
    const q = new URLSearchParams();
    if (params?.limit != null) q.append("limit", String(params.limit));
    if (params?.days != null) q.append("days", String(params.days));
    const qs = q.toString();
    return this.makeRequest(`/marketspace/top-sellers${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async getLimitedStockProducts(params?: {
    threshold?: number;
    limit?: number;
  }) {
    const q = new URLSearchParams();
    if (params?.threshold != null)
      q.append("threshold", String(params.threshold));
    if (params?.limit != null) q.append("limit", String(params.limit));
    const qs = q.toString();
    return this.makeRequest(`/marketspace/limited-stock${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  // ─── DELIVERY ──────────────────────────────────────────────────────────────

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

  // ─── CART ──────────────────────────────────────────────────────────────────

  async getCart(session_id?: string) {
    const qs = session_id
      ? `?session_id=${encodeURIComponent(session_id)}`
      : "";
    return this.makeRequest(`/cart${qs}`, { method: "GET" });
  }

  async addToCart(product_id: string, quantity: number, session_id?: string) {
    const qs = session_id
      ? `?session_id=${encodeURIComponent(session_id)}`
      : "";
    return this.makeRequest(`/cart/add${qs}`, {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    });
  }

  async updateCartItem(
    product_id: string,
    quantity: number,
    session_id?: string,
  ) {
    const qs = session_id
      ? `?session_id=${encodeURIComponent(session_id)}`
      : "";
    return this.makeRequest(`/cart/update${qs}`, {
      method: "PATCH",
      body: JSON.stringify({ product_id, quantity }),
    });
  }

  async removeCartItem(product_id: string, session_id?: string) {
    const qs = session_id
      ? `?session_id=${encodeURIComponent(session_id)}`
      : "";
    return this.makeRequest(
      `/cart/remove/${encodeURIComponent(product_id)}${qs}`,
      {
        method: "DELETE",
      },
    );
  }

  async clearCart(session_id?: string) {
    const qs = session_id
      ? `?session_id=${encodeURIComponent(session_id)}`
      : "";
    return this.makeRequest(`/cart/clear${qs}`, { method: "DELETE" });
  }

  async mergeCart(session_id: string) {
    return this.makeRequest("/cart/merge", {
      method: "POST",
      body: JSON.stringify({ session_id }),
    });
  }

  async validateCart(session_id?: string) {
    const qs = session_id
      ? `?session_id=${encodeURIComponent(session_id)}`
      : "";
    return this.makeRequest(`/cart/validate${qs}`, { method: "POST" });
  }

  async checkout(params: {
    delivery_street_address: string;
    delivery_city: string;
    delivery_state: string;
    delivery_country: string;
    delivery_option_id: string;
    delivery_notes?: string;
    user_latitude?: number;
    user_longitude?: number;
  }) {
    const q = new URLSearchParams();
    q.append("delivery_street_address", params.delivery_street_address);
    q.append("delivery_city", params.delivery_city);
    q.append("delivery_state", params.delivery_state);
    q.append("delivery_country", params.delivery_country);
    q.append("delivery_option_id", params.delivery_option_id);
    if (params.delivery_notes)
      q.append("delivery_notes", params.delivery_notes);
    if (params.user_latitude != null)
      q.append("user_latitude", String(params.user_latitude));
    if (params.user_longitude != null)
      q.append("user_longitude", String(params.user_longitude));
    return this.makeRequest(`/cart/checkout?${q.toString()}`, {
      method: "POST",
    });
  }

  // ─── PAYMENTS ──────────────────────────────────────────────────────────────

  async verifyPayment(reference: string) {
    return this.makeRequest(
      `/payments/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
      },
    );
  }

  // ─── USER ORDERS ───────────────────────────────────────────────────────────

  async getUserOrders(params?: {
    order_status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }) {
    const q = new URLSearchParams();
    if (params?.order_status) q.append("order_status", params.order_status);
    if (params?.payment_status)
      q.append("payment_status", params.payment_status);
    if (params?.start_date) q.append("start_date", params.start_date);
    if (params?.end_date) q.append("end_date", params.end_date);
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.per_page != null) q.append("per_page", String(params.per_page));
    const qs = q.toString();
    return this.makeRequest(`/user/orders${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async getOrderById(order_id: string) {
    return this.makeRequest(`/user/orders/${order_id}`, { method: "GET" });
  }

  async cancelOrder(order_id: string) {
    return this.makeRequest(`/user/orders/cancel/${order_id}`, {
      method: "POST",
    });
  }

  // ─── SELLER ────────────────────────────────────────────────────────────────

  async applyAsSeller(data: any) {
    return this.makeRequest("/seller/apply", {
      method: "POST",
      body: JSON.stringify({
        business_name: data.business_name,
        short_business_description: data.short_business_description,
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

  /**
   * Get the authenticated seller's full business profile and performance metrics.
   * GET /api/v1/seller/profile
   * Requires a valid access token (seller must be logged in).
   */
  async getMySellerProfile(): Promise<any> {
    return this.makeRequest("/seller/profile", { method: "GET" });
  }

  /**
   * Update the authenticated seller's business profile and contact info.
   * PATCH /api/v1/seller/profile
   * Requires a valid access token (seller must be approved).
   */
  async updateMySellerProfile(data: {
    business_name?: string;
    short_business_description?: string;
    business_address?: string;
    seller_bio?: string;
    business_phone_number?: string;
    business_email?: string;
    business_facebook?: string;
    business_twitter?: string;
    business_instagram?: string;
    business_linkedin?: string;
    business_website?: string;
    business_location?: string;
  }): Promise<any> {
    return this.makeRequest("/seller/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get profile viewers history (seller-only, authenticated).
   * GET /api/v1/seller/profile/viewers
   */
  async getSellerProfileViewers(params?: {
    page?: number;
    per_page?: number;
  }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.per_page != null) q.append("per_page", String(params.per_page));
    const qs = q.toString();
    return this.makeRequest(
      `/seller/profile/viewers${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  /**
   * Get a public seller profile by seller ID (no auth required).
   * GET /api/v1/seller/{seller_id}
   */
  async getPublicSellerProfile(seller_id: string, session_id?: string): Promise<any> {
    const q = new URLSearchParams();
    if (session_id) q.append("session_id", session_id);
    const qs = q.toString();
    return this.makeRequest(
      `/seller/${encodeURIComponent(seller_id)}${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  /**
   * Follow a seller's store (authenticated users only).
   * POST /api/v1/seller/{seller_id}/follow
   */
  async followSeller(seller_id: string): Promise<any> {
    return this.makeRequest(
      `/seller/${encodeURIComponent(seller_id)}/follow`,
      { method: "POST" },
    );
  }

  /**
   * Unfollow a seller's store (authenticated users only).
   * DELETE /api/v1/seller/{seller_id}/follow
   */
  async unfollowSeller(seller_id: string): Promise<any> {
    return this.makeRequest(
      `/seller/${encodeURIComponent(seller_id)}/follow`,
      { method: "DELETE" },
    );
  }

  /**
   * Get public approved products for a specific seller (paginated).
   * GET /api/v1/seller/{seller_id}/products
   */
  async getPublicSellerProducts(
    seller_id: string,
    params?: {
      subcategory_id?: string;
      min_price?: number;
      max_price?: number;
      condition?: string;
      search?: string;
      sort_by?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<any> {
    const q = new URLSearchParams();
    if (params?.subcategory_id) q.append("subcategory_id", params.subcategory_id);
    if (params?.min_price != null) q.append("min_price", String(params.min_price));
    if (params?.max_price != null) q.append("max_price", String(params.max_price));
    if (params?.condition) q.append("condition", params.condition);
    if (params?.search) q.append("search", params.search);
    if (params?.sort_by) q.append("sort_by", params.sort_by);
    if (params?.limit != null) q.append("limit", String(params.limit));
    if (params?.offset != null) q.append("offset", String(params.offset));
    const qs = q.toString();
    return this.makeRequest(
      `/seller/${encodeURIComponent(seller_id)}/products${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  /**
   * Get public approved reviews for all products of a specific seller.
   * GET /api/v1/seller/{seller_id}/reviews
   */
  async getPublicSellerReviews(
    seller_id: string,
    params?: {
      rating?: number;
      is_verified?: boolean;
      page?: number;
      per_page?: number;
    },
  ): Promise<any> {
    const q = new URLSearchParams();
    if (params?.rating != null) q.append("rating", String(params.rating));
    if (params?.is_verified != null)
      q.append("is_verified", String(params.is_verified));
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.per_page != null) q.append("per_page", String(params.per_page));
    const qs = q.toString();
    return this.makeRequest(
      `/seller/${encodeURIComponent(seller_id)}/reviews${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  // ─── SELLER PRODUCTS ───────────────────────────────────────────────────────

  async getMyProducts(params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean | null;
    approval_status?: string | null;
  }) {
    const q = new URLSearchParams();
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.page_size != null)
      q.append("page_size", String(params.page_size));
    if (params?.is_active != null)
      q.append("is_active", String(params.is_active));
    if (params?.approval_status)
      q.append("approval_status", params.approval_status);
    const qs = q.toString();
    return this.makeRequest(
      `/seller/products/my-products${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async getMyProductById(product_id: string) {
    return this.makeRequest(`/seller/products/${product_id}`, {
      method: "GET",
    });
  }

  async createProduct(data: any) {
    console.log("Creating product with data:", JSON.stringify(data, null, 2));
    const response = await this.makeRequest("/seller/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("Create product response:", response);
    return response;
  }

  async updateProduct(product_id: string, data: any) {
    return this.makeRequest(`/seller/products/${product_id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(product_id: string) {
    return this.makeRequest(`/seller/products/${product_id}`, {
      method: "DELETE",
    });
  }

  // ─── SELLER FLASH SALE ─────────────────────────────────────────────────────

  async getSellerFlashSaleCampaigns(
    statusFilter: string = "current",
  ): Promise<any> {
    const params = new URLSearchParams();
    if (statusFilter) params.append("status", statusFilter);
    const qs = params.toString();
    return this.makeRequest(
      `/seller/products/flash-sale/campaigns${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
      },
    );
  }

  async getSellerFlashSaleApplications(
    campaignId: string | null = null,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaign_id", campaignId);
    const qs = params.toString();
    return this.makeRequest(
      `/seller/products/flash-sale/applications${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
      },
    );
  }

  async applyProductToFlashSale(data: {
    product_id: string;
    flash_sale_id: string;
    flash_price: number;
    flash_stock: number;
  }): Promise<any> {
    return this.makeRequest("/seller/products/flash-sale/apply", {
      method: "POST",
      body: JSON.stringify({
        product_id: data.product_id,
        flash_sale_id: data.flash_sale_id,
        flash_price: data.flash_price,
        flash_stock: data.flash_stock,
      }),
    });
  }

  async getProductFlashSaleStatus(product_id: string): Promise<any> {
    return this.makeRequest(
      `/seller/products/flash-sale/status/${encodeURIComponent(product_id)}`,
      {
        method: "GET",
      },
    );
  }

  // ─── SELLER ORDERS ─────────────────────────────────────────────────────────

  async getSellerOrders(params?: {
    order_status?: string | null;
    payment_status?: string | null;
    item_status?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    page?: number;
    per_page?: number;
  }) {
    const q = new URLSearchParams();
    if (params?.order_status) q.append("order_status", params.order_status);
    if (params?.payment_status)
      q.append("payment_status", params.payment_status);
    if (params?.item_status) q.append("item_status", params.item_status);
    if (params?.start_date) q.append("start_date", params.start_date);
    if (params?.end_date) q.append("end_date", params.end_date);
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.per_page != null) q.append("per_page", String(params.per_page));
    const qs = q.toString();
    return this.makeRequest(`/seller/orders${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async updateOrderItemStatus(order_item_id: string, new_status: string) {
    return this.makeRequest(
      `/seller/orders/item/${encodeURIComponent(order_item_id)}?new_status=${encodeURIComponent(new_status)}`,
      { method: "PATCH" },
    );
  }

  async updateSellerOrderNotes(
    seller_order_id: string,
    seller_notes: string,
  ): Promise<any> {
    return this.makeRequest(
      `/seller/orders/${encodeURIComponent(seller_order_id)}/notes`,
      {
        method: "PATCH",
        body: JSON.stringify({ seller_notes }),
      },
    );
  }

  // ─── SELLER WALLET ─────────────────────────────────────────────────────────

  async getSellerWallet() {
    return this.makeRequest("/seller/wallet", { method: "GET" });
  }

  async getSellerWalletTransactions(params?: {
    skip?: number;
    limit?: number;
  }) {
    const q = new URLSearchParams();
    if (params?.skip != null) q.append("skip", String(params.skip));
    if (params?.limit != null) q.append("limit", String(params.limit));
    const qs = q.toString();
    return this.makeRequest(
      `/seller/wallet/transactions${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async submitWithdrawalRequest(data: {
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    bank_code: string;
  }): Promise<any> {
    return this.makeRequest("/seller/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWithdrawalRequest(
    withdrawal_id: string,
    data: {
      amount?: number;
      bank_name?: string;
      account_number?: string;
      account_name?: string;
      bank_code?: string;
    },
  ): Promise<any> {
    return this.makeRequest(
      `/seller/wallet/withdrawals/${encodeURIComponent(withdrawal_id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  }

  async getSellerWithdrawals(params?: {
    status_filter?: "pending" | "completed" | "rejected" | null;
    skip?: number;
    limit?: number;
  }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.status_filter) q.append("status_filter", params.status_filter);
    if (params?.skip != null) q.append("skip", String(params.skip));
    if (params?.limit != null) q.append("limit", String(params.limit));
    const qs = q.toString();
    return this.makeRequest(
      `/seller/wallet/withdrawals${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  // ─── SELLER ANALYTICS ──────────────────────────────────────────────────────

  async getSellerAnalyticsDashboard(): Promise<any> {
    return this.makeRequest("/seller/analytics/dashboard", { method: "GET" });
  }

  async getSellerProductAnalytics(): Promise<any> {
    return this.makeRequest("/seller/analytics/products", { method: "GET" });
  }

  // ─── SERVICE PROVIDER ──────────────────────────────────────────────────────

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

  async createService(data: any) {
    return this.makeRequest("/service-provider/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMarketplaceServices(params?: any) {
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

  async updateService(service_id: string, data: any) {
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

  // ─── CAMPUS GUIDE ──────────────────────────────────────────────────────────

  async getCampusGuides(params?: any) {
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

  async updateCampusReview(review_id: string, data: any) {
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

  async getSchoolPickupStations(
    school_id: string,
    params?: { search?: string; page?: number; per_page?: number },
  ) {
    const q = new URLSearchParams();
    if (params?.search) q.append("search", params.search);
    if (params?.page) q.append("page", String(params.page));
    if (params?.per_page) q.append("per_page", String(params.per_page));
    const qs = q.toString();
    return this.makeRequest(
      `/pickup-station/school/${school_id}${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  // ─── PRODUCT REVIEWS ───────────────────────────────────────────────────────

  async getProductReviews(
    productId: string,
    params?: {
      rating?: number | null;
      is_verified?: boolean | null;
      page?: number;
      per_page?: number;
    },
  ) {
    const q = new URLSearchParams();
    if (params?.rating != null) q.append("rating", String(params.rating));
    if (params?.is_verified != null)
      q.append("is_verified", String(params.is_verified));
    if (params?.page != null) q.append("page", String(params.page));
    if (params?.per_page != null) q.append("per_page", String(params.per_page));
    const qs = q.toString();
    return this.makeRequest(
      `/reviews/product/${encodeURIComponent(productId)}${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  }

  async createProductReview(data: {
    product_id: string;
    rating: number;
    comment: string;
  }) {
    return this.makeRequest("/user/reviews/product", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProductReview(
    review_id: string,
    data: { rating?: number; comment?: string },
  ) {
    return this.makeRequest(`/user/reviews/${review_id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ─── FILE UPLOADS ──────────────────────────────────────────────────────────

  async uploadFiles(
    files: File[],
    uploadType:
      | "user_profile_image"
      | "user_cover_image"
      | "seller_business_image"
      | "provider_logo"
      | "provider_cover"
      | "provider_post_images"
      | "product_images"
      | "product_videos"
      | "school_logo"
      | "campus_guide_image"
      | "category_image"
      | "category_icon"
      | "seller_document",
    entityId?: string,
  ): Promise<any> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("upload_type", uploadType);

    if (entityId && entityId.trim()) {
      formData.append("entity_id", entityId.trim());
    }

    const response = await this.makeRequest("/upload/files", {
      method: "POST",
      body: formData,
    });

    return response?.data ?? response;
  }

  async uploadProductImages(files: File[], productId?: string) {
    return this.uploadFiles(files, "product_images", productId);
  }

  async uploadProductVideos(files: File[], productId?: string) {
    return this.uploadFiles(files, "product_videos", productId);
  }

  async deleteFiles(
    urls: string[],
    uploadType: string,
    entityId?: string,
  ): Promise<any> {
    if (!urls || urls.length === 0) {
      throw new Error("At least one URL is required to delete files.");
    }

    const body: any = { urls, upload_type: uploadType };
    if (entityId && entityId.trim()) {
      body.entity_id = entityId.trim();
    }

    return this.makeRequest("/upload/files", {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  }

  async deleteProductImages(urls: string[], productId: string) {
    return this.deleteFiles(urls, "product_images", productId);
  }

  async deleteProductVideos(urls: string[], productId: string) {
    return this.deleteFiles(urls, "product_videos", productId);
  }

  // ─── REPORTS ──────────────────────────────────────────────────────────────

  async reportSeller(
    sellerId: string,
    reason: string,
    details: string,
  ): Promise<any> {
    return this.makeRequest("/reports/seller", {
      method: "POST",
      body: JSON.stringify({
        seller_id: sellerId,
        reason: reason,
        details: details,
      }),
    });
  }

  async reportProvider(
    providerId: string,
    reason: string,
    details: string,
  ): Promise<any> {
    return this.makeRequest("/reports/provider", {
      method: "POST",
      body: JSON.stringify({
        provider_id: providerId,
        reason: reason,
        details: details,
      }),
    });
  }

  async reportProduct(
    productId: string,
    reason: string,
    details: string,
    images?: string[],
  ): Promise<any> {
    const requestBody: any = {
      product_id: productId,
      reason: reason,
      details: details,
    };

    if (images && images.length > 0) {
      requestBody.images = images;
    }

    return this.makeRequest("/reports/product", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  }

  async getMyReports(): Promise<any> {
    return this.makeRequest("/reports/my-reports", {
      method: "GET",
    });
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  logout() {
    this.clearTokens();
  }
}

const apiService = new ApiService();
export default apiService;