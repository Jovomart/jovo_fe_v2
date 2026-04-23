'use client'
import { createContext, useState, useEffect, useContext } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/firebase/firebase'
import ApiService from '@/services/apiService'

export const AuthContext = createContext<any>({})
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sellerMode, setSellerMode] = useState(false)
  const [isSeller, setIsSeller] = useState(false)

  const mapUserData = (userData: any, existingUser: any = null) => ({
    id: userData.user_id || userData.id,
    user_id: userData.user_id || userData.id,
    email: userData.email,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
    gender: userData.gender,
    country: userData.country,
    state: userData.state,
    city: userData.city,
    address: userData.address || '',
    phone: userData.phone_number || (existingUser?.phone || null),
    school_id: userData.school_id || (existingUser?.school_id || null),
    schoolId: userData.school_id || (existingUser?.schoolId || null),
    role: userData.role,
    is_active: userData.is_active,
    profile_complete: userData.profile_complete || false,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_login: userData.last_login,
    profile_image: userData.profile_image || null,
    location: userData.location || null,
    seller_id: userData.seller_id || null,
    seller_status: userData.seller_status || null,
    has_applied_as_seller: userData.has_applied_as_seller || false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')
    const savedSellerMode = localStorage.getItem('sellerMode') === 'true'
    setSellerMode(savedSellerMode)
    if (storedUser && accessToken) {
      if (!ApiService.isTokenExpired(accessToken)) {
        setUser(JSON.parse(storedUser))
        setLoading(false)
      } else {
        ApiService.refreshAccessToken()
          .then(() => ApiService.getCurrentUser())
          .then((freshUser: any) => {
            const mappedUser = mapUserData(freshUser.data || freshUser)
            localStorage.setItem('user', JSON.stringify(mappedUser))
            setUser(mappedUser)
          })
          .catch(() => ApiService.clearTokens())
          .finally(() => setLoading(false))
        return
      }
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) { setIsSeller(false); return }
    ApiService.getApplicationStatus()
      .then((res: any) => {
        const is_seller_flag = res?.is_seller
        const status = res?.data?.status || res?.data?.seller_status || res?.status || res?.seller_status || ''
        const isSellerResolved = is_seller_flag === true || status.toLowerCase() === 'approved'
        setIsSeller(isSellerResolved)
        if (!isSellerResolved) { setSellerMode(false); localStorage.setItem('sellerMode', 'false') }
      })
      .catch(() => { setIsSeller(false); setSellerMode(false); localStorage.setItem('sellerMode', 'false') })
  }, [user])

  const register = async (formData: any) => {
    console.log('========== REGISTER DEBUG ==========')
    console.log('📱 Phone from form data:', formData.phone)
    const response = await ApiService.register({
      firstName: formData.firstName, lastName: formData.lastName,
      email: formData.email, username: formData.username,
      password: formData.password, confirmPassword: formData.confirmPassword,
      country: formData.country, state: formData.state, city: formData.city,
      address: formData.address || '', gender: formData.gender,
      schoolId: formData.schoolId, phone: formData.phone,
    })
    console.log('📦 Registration response:', response)
    try {
      const freshUser = await ApiService.getCurrentUser()
      console.log('✅ getCurrentUser success:', freshUser)
      if (freshUser && (freshUser.data || freshUser)) {
        const mappedUser = mapUserData(freshUser.data || freshUser)
        localStorage.setItem('user', JSON.stringify(mappedUser))
        setUser(mappedUser)
        console.log('✅ User stored from getCurrentUser:', mappedUser)
      }
    } catch (err: any) {
      console.log('❌ getCurrentUser failed (expected before email verification):', err.message)
      console.log('📱 Manually storing phone from form:', formData.phone)
      const basicUserData = response.data || response
      const mappedUser = {
        id: basicUserData.user_id || basicUserData.id,
        email: basicUserData.email,
        username: basicUserData.username || formData.username,
        first_name: basicUserData.first_name || formData.firstName,
        last_name: basicUserData.last_name || formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        gender: formData.gender, country: formData.country, state: formData.state,
        city: formData.city, address: formData.address || '', phone: formData.phone,
        school_id: formData.schoolId, schoolId: formData.schoolId,
        role: basicUserData.role || 'user', is_active: basicUserData.is_active || false,
        profile_complete: false, created_at: basicUserData.created_at || new Date().toISOString(),
      }
      localStorage.setItem('user', JSON.stringify(mappedUser))
      setUser(mappedUser)
      console.log('💾 User stored manually with phone:', mappedUser)
      console.log('📱 Phone in stored user:', mappedUser.phone)
    }
    console.log('===================================')
    return response
  }

  const login = async (email: string, password: string) => {
    console.log('========== LOGIN DEBUG ==========')
    const response = await ApiService.login({ email, password })
    console.log('📦 Login response:', response)
    const userData = response.data?.user || response.user || response.data || null
    if (userData) {
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}')
      console.log('📱 Existing user phone:', existingUser.phone)
      console.log('📱 New login response phone:', userData.phone_number)
      try {
        const freshUser = await ApiService.getCurrentUser()
        if (freshUser && (freshUser.data || freshUser)) {
          const completeUserData = freshUser.data || freshUser
          const mappedUser = mapUserData(completeUserData)
          localStorage.setItem('user', JSON.stringify(mappedUser))
          setUser(mappedUser)
          console.log('✅ Login - fetched complete user with phone:', mappedUser.phone)
          console.log('===================================')
          return mappedUser
        }
      } catch (err: any) {
        console.log('⚠️ Could not fetch complete user after login:', err.message)
      }
      const mappedUser = mapUserData(userData, { phone: existingUser.phone })
      console.log('📱 Mapped user phone (preserved from existing):', mappedUser.phone)
      localStorage.setItem('user', JSON.stringify(mappedUser))
      setUser(mappedUser)
      console.log('===================================')
      return mappedUser
    }
    console.log('===================================')
    return userData
  }

  const googleLogin = async () => {
    if (!auth || !googleProvider) throw new Error('Google Sign-In is not configured yet.')
    console.log('========== GOOGLE LOGIN DEBUG ==========')
    const result = await signInWithPopup(auth, googleProvider)
    const idToken = await result.user.getIdToken()
    console.log('📱 Firebase ID Token obtained')
    const response = await ApiService.googleAuth(idToken)
    console.log('📦 Google auth response:', response)
    if (response.access_token) { ApiService.storeTokens(response.access_token, response.refresh_token); console.log('✅ Tokens stored from Google auth') }
    let userData = response.data?.user || response.user || response.data || null
    try {
      const freshUser = await ApiService.getCurrentUser()
      if (freshUser && (freshUser.data || freshUser)) { userData = freshUser.data || freshUser; console.log('✅ Fetched fresh user data:', userData) }
    } catch (err: any) { console.log('⚠️ Could not fetch fresh user:', err.message) }
    const requiresProfileCompletion = !userData?.username || !userData?.gender || !userData?.country || !userData?.phone
    console.log('📱 User data:', userData)
    console.log('📱 Phone in user data:', userData?.phone)
    console.log('⚠️ Requires profile completion:', requiresProfileCompletion)
    if (userData) { const mappedUser = mapUserData(userData); localStorage.setItem('user', JSON.stringify(mappedUser)); setUser(mappedUser); console.log('📱 User stored:', mappedUser) }
    console.log('===========================================')
    return { userData, response, requiresProfileCompletion }
  }

  const completeProfile = async (profileData: any) => {
    console.log('========== COMPLETE PROFILE DEBUG ==========')
    console.log('📱 Phone being sent:', profileData.phone)
    const response = await ApiService.completeProfile({
      username: profileData.username, gender: profileData.gender,
      country: profileData.country, state: profileData.state,
      city: profileData.city, address: profileData.address || '',
      schoolId: profileData.schoolId, phone: profileData.phone,
    })
    console.log('📦 Complete profile response:', response)
    try {
      const freshUser = await ApiService.getCurrentUser()
      if (freshUser && (freshUser.data || freshUser)) {
        const userData = freshUser.data || freshUser
        const mappedUser = mapUserData(userData)
        localStorage.setItem('user', JSON.stringify(mappedUser))
        setUser(mappedUser)
        console.log('✅ Profile completed - fetched fresh user:', mappedUser)
        console.log('📱 Phone after completion:', mappedUser.phone)
        return mappedUser
      }
    } catch (err: any) {
      console.log('⚠️ Could not fetch fresh user after completion:', err.message)
      const updated = { ...user, ...profileData }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      return updated
    }
    console.log('===========================================')
    return response
  }

  const updateProfile = async (profileData: any) => {
    await ApiService.updateUserProfile({
      first_name: profileData.first_name, last_name: profileData.last_name,
      username: profileData.username, gender: profileData.gender,
      country: profileData.country, state: profileData.state,
      city: profileData.city, address: profileData.address || '',
      phone: profileData.phone, school_id: profileData.school_id || null,
    })
    const updatedUser = {
      ...user,
      first_name: profileData.first_name, last_name: profileData.last_name,
      full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      username: profileData.username, gender: profileData.gender,
      country: profileData.country, state: profileData.state,
      city: profileData.city, address: profileData.address || '',
      phone: profileData.phone, school_id: profileData.school_id, schoolId: profileData.school_id,
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    return updatedUser
  }

  const verifyEmail = async (email: string, code: string) => {
    const response = await ApiService.verifyEmail(email, code)
    if (response.access_token) ApiService.storeTokens(response.access_token, response.refresh_token)
    if (response.access_token) {
      try {
        const freshUser = await ApiService.getCurrentUser()
        const mappedUser = mapUserData(freshUser.data || freshUser)
        localStorage.setItem('user', JSON.stringify(mappedUser))
        setUser(mappedUser)
      } catch (err) { console.error('Failed to fetch user after verification:', err) }
    } else if (response.user) {
      const mappedUser = mapUserData(response.user)
      localStorage.setItem('user', JSON.stringify(mappedUser))
      setUser(mappedUser)
    }
    return response
  }

  const resendVerificationCode = async (email: string) => ApiService.resendVerificationCode(email)
  const forgotPassword = async (email: string) => ApiService.sendForgotPasswordCode(email)
  const resetPassword = async (email: string, code: string, newPassword: string, confirmPassword: string) =>
    ApiService.resetPasswordWithCode(email, code, newPassword, confirmPassword)

  const refreshUser = async () => {
    try {
      const freshUser = await ApiService.getCurrentUser()
      if (freshUser) {
        const userData = freshUser.data || freshUser
        const mappedUser = mapUserData(userData, user)
        localStorage.setItem('user', JSON.stringify(mappedUser))
        setUser(mappedUser)
        return mappedUser
      }
      return null
    } catch (error) { console.error('Failed to refresh user:', error); return null }
  }

  const logout = async () => {
    try { if (auth) await signOut(auth) } catch {}
    localStorage.removeItem('user')
    localStorage.removeItem('sellerMode')
    ApiService.clearTokens()
    setUser(null)
    setSellerMode(false)
  }

  const enterSellerMode = () => { setSellerMode(true); localStorage.setItem('sellerMode', 'true') }
  const exitSellerMode = () => { setSellerMode(false); localStorage.setItem('sellerMode', 'false') }

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, register, login, googleLogin,
      completeProfile, updateProfile, refreshUser, verifyEmail,
      resendVerificationCode, forgotPassword, resetPassword, logout,
      sellerMode, enterSellerMode, exitSellerMode, isSeller,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
