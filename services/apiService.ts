// services/apiService.ts
// Exact port of apiService.js - all logic preserved

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined')
}

class ApiService {
  baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  storeTokens(accessToken: string, refreshToken: string | null = null) {
    if (typeof window === 'undefined') return
    if (accessToken) localStorage.setItem('access_token', accessToken)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
  }

  clearTokens() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp < Math.floor(Date.now() / 1000)
    } catch {
      return true
    }
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken || this.isTokenExpired(refreshToken))
      throw new Error('No valid refresh token')
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` },
    })
    if (!response.ok) {
      this.clearTokens()
      throw new Error('Failed to refresh token')
    }
    const data = await response.json()
    this.storeTokens(data.access_token, data.refresh_token)
    return data.access_token
  }

  async getValidAccessToken(): Promise<string | null> {
    let token = this.getAccessToken()
    if (!token) return null
    if (this.isTokenExpired(token)) {
      try { token = await this.refreshAccessToken() } catch { return null }
    }
    return token
  }

  extractErrorMessage(data: any, statusCode: number): string {
    if (data?.detail && typeof data.detail === 'string') return data.detail
    if (data?.detail?.message && typeof data.detail.message === 'string') return data.detail.message
    if (Array.isArray(data?.detail))
      return data.detail.map((e: any) => (e.loc ? `${e.loc.join('.')}: ${e.msg}` : e.msg)).join(', ')
    if (data?.message && typeof data.message === 'string') return data.message
    if (data?.error && typeof data.error === 'string') return data.error
    console.error('Unrecognised error response shape:', data)
    return `Request failed with status ${statusCode}`
  }

  async makeRequest(endpoint: string, options: RequestInit & { headers?: any } = {}): Promise<any> {
    if (!endpoint.startsWith('/')) endpoint = '/' + endpoint
    const url = `${this.baseURL}${endpoint}`

    const publicPrefixes = [
      '/auth/login', '/auth/register', '/auth/send-forgotten-password-code',
      '/auth/reset-password-with-code', '/auth/verify-email',
      '/auth/resend-verification-code', '/auth/google-sign-in', '/auth/refresh',
      '/delivery/public', '/category/get-all-categories', '/category/get-category',
      '/auth/public/get-school', '/auth/schools',
    ]
    const isPublic = publicPrefixes.some((ep) => endpoint.startsWith(ep))

    const config: RequestInit & { headers: any } = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    }

    if (!isPublic) {
      const token = await this.getValidAccessToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
      else throw new Error('Authentication required. Please log in again.')
    }

    try {
      const response = await fetch(url, config)
      let data: any
      const text = await response.text()
      try { data = JSON.parse(text) } catch { data = { message: text } }
      if (!response.ok) console.error(`API Error [${response.status}] ${endpoint}:`, data)
      if (response.status === 401) {
        this.clearTokens()
        throw new Error(
          isPublic
            ? 'Invalid credentials. Please check your email and password.'
            : 'Session expired. Please log in again.'
        )
      }
      if (!response.ok) throw new Error(this.extractErrorMessage(data, response.status))
      return data
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch'))
        throw new Error('Network error: Unable to connect to server.')
      throw error
    }
  }

  async register({ firstName, lastName, email, username, password, confirmPassword, country, state, city, address, gender, schoolId, phone }: any) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName, last_name: lastName,
        email: email.trim().toLowerCase(), username, password,
        confirm_password: confirmPassword, country, state, city,
        address: address || '', gender, school_id: schoolId || null,
        phone_number: phone,
      }),
    })
  }

  async login({ email, password }: { email: string; password: string }) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })
    const tokens = response.data || response
    if (tokens.access_token) this.storeTokens(tokens.access_token, tokens.refresh_token)
    return response
  }

  async googleAuth(firebaseIdToken: string) {
    const response = await this.makeRequest(
      `/auth/google-sign-in/sign-up?firebase_id_token=${encodeURIComponent(firebaseIdToken)}`,
      { method: 'POST' }
    )
    console.log('🔑 Google auth raw response:', response)
    const accessToken = response.access_token || response.data?.access_token || response.token
    const refreshToken = response.refresh_token || response.data?.refresh_token
    if (accessToken) { this.storeTokens(accessToken, refreshToken); console.log('✅ Tokens stored successfully') }
    else { console.log('❌ No access token found in response') }
    return response
  }

  async completeProfile({ username, gender, country, state, city, address, schoolId, phone }: any) {
    return this.makeRequest('/auth/complete-profile', {
      method: 'PUT',
      body: JSON.stringify({
        username, gender, country, state, city,
        address: address || '', school_id: schoolId || null, phone,
      }),
    })
  }

  async verifyEmail(email: string, code: string) {
    return this.makeRequest(
      `/auth/verify-email?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,
      { method: 'POST' }
    )
  }

  async resendVerificationCode(email: string) {
    return this.makeRequest(
      `/auth/resend-verification-code?email=${encodeURIComponent(email)}`,
      { method: 'POST' }
    )
  }

  async sendForgotPasswordCode(email: string) {
    return this.makeRequest(
      `/auth/send-forgotten-password-code?email=${encodeURIComponent(email)}`,
      { method: 'POST' }
    )
  }

  async resetPasswordWithCode(email: string, code: string, newPassword: string, confirmPassword: string) {
    return this.makeRequest(
      `/auth/reset-password-with-code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&new_password=${encodeURIComponent(newPassword)}&confirm_password=${encodeURIComponent(confirmPassword)}`,
      { method: 'POST' }
    )
  }

  async getCurrentUser() {
    return this.makeRequest('/auth/get-current-user', { method: 'GET' })
  }

  async updateLocation(locationData: any) {
    return this.makeRequest('/auth/update-location', { method: 'PUT', body: JSON.stringify(locationData) })
  }

  async updateUserProfile(profileData: any) {
    return this.makeRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify({
        first_name: profileData.first_name, last_name: profileData.last_name,
        username: profileData.username, gender: profileData.gender,
        country: profileData.country, state: profileData.state,
        city: profileData.city, address: profileData.address || '',
        phone: profileData.phone, school_id: profileData.school_id || null,
      }),
    })
  }

  async getAvailableSchools(country = '', state = '') {
    const params = new URLSearchParams()
    if (country) params.append('country', country)
    if (state) params.append('state', state)
    const qs = params.toString()
    return this.makeRequest(`/auth/schools${qs ? `?${qs}` : ''}`, { method: 'GET' })
  }

  async getSchoolById(schoolId: string) {
    return this.makeRequest(`/auth/public/get-school/${schoolId}`, { method: 'GET' })
  }

  async getPublicCategories(categoryType: string | null = null) {
    const params = new URLSearchParams()
    if (categoryType) params.append('category_type', categoryType)
    const qs = params.toString()
    return this.makeRequest(`/category/get-all-categories${qs ? `?${qs}` : ''}`, { method: 'GET' })
  }

  async getPublicCategory(categoryId: string) {
    return this.makeRequest(`/category/get-category/${categoryId}`, { method: 'GET' })
  }

  async getAvailableDeliveryOptions(cartTotal = 0, totalWeight = 0) {
    return this.makeRequest(
      `/delivery/public/options/available?cart_total=${cartTotal}&total_weight=${totalWeight}`,
      { method: 'GET' }
    )
  }

  async getDeliveryOptionDetails(deliveryId: string) {
    return this.makeRequest(`/delivery/public/options/${deliveryId}`, { method: 'GET' })
  }

  async applyAsSeller(data: any) {
    return this.makeRequest('/seller/apply', {
      method: 'POST',
      body: JSON.stringify({
        business_name: data.business_name,
        short_business_description: data.short_business_description,
        category_ids: data.business_category,
        business_address: data.business_address,
        seller_document: data.seller_document,
        seller_document_type: data.seller_document_type,
      }),
    })
  }

  async getApplicationStatus() {
    return this.makeRequest('/seller/status', { method: 'GET' })
  }

  async getSellerDashboard() {
    return this.makeRequest('/seller/dashboard', { method: 'GET' })
  }

  logout() {
    this.clearTokens()
  }
}

export default new ApiService()
