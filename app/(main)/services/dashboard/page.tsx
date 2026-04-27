'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiCheck, FiX,
  FiStar, FiMapPin, FiClock, FiTool, FiToggleLeft, FiToggleRight,
  FiLoader, FiAlertCircle, FiChevronDown, FiChevronUp,
} from 'react-icons/fi'
import {
  FaWhatsapp, FaBroom, FaCut, FaTshirt, FaBolt,
  FaWrench, FaChalkboardTeacher, FaCamera, FaStar, FaTools,
} from 'react-icons/fa'
import Footer from '@/components/layout/Footer'
import apiService from '@/services/apiService'

/* ─── types ─────────────────────────────────────────────────────── */
interface ProviderProfile {
  id: string
  business_name: string
  business_bio: string
  logo_url?: string
  cover_image_url?: string
  whatsapp_number?: string
  phone_number?: string
  status?: string
  provider_status?: string
  account_status?: string
  is_phone_verified?: boolean
  is_active?: boolean
  rating?: number
  review_count?: number
  service_category?: string[]
  [key: string]: any
}

interface CategoryFromAPI {
  id: string
  name: string
  description?: string
  category_type?: string
  is_active?: boolean
}

interface DisplayCategory {
  id: string
  name: string
  icon: React.ReactNode
  gradient: string
}

interface ServiceData {
  id: string
  display_name: string
  category_id: string
  description: string
  price_type: string
  starting_price: number
  location: string
  availability_schedule: Record<string, Array<{ start: string; end: string }>>
  booking_mode: string
  is_active: boolean
}

/* ─── Fallback categories in case API fails ─────────────────────── */
const FALLBACK_CATEGORIES: DisplayCategory[] = [
  { id: 'cleaning', name: 'Cleaning', icon: <FaBroom size={14} />, gradient: 'linear-gradient(135deg,#B42225,#FF6B00)' },
  { id: 'salon', name: 'Salon & Barber', icon: <FaCut size={14} />, gradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)' },
  { id: 'laundry', name: 'Laundry', icon: <FaTshirt size={14} />, gradient: 'linear-gradient(135deg,#0891B2,#06B6D4)' },
  { id: 'electrical', name: 'Electrical', icon: <FaBolt size={14} />, gradient: 'linear-gradient(135deg,#D97706,#F59E0B)' },
  { id: 'repair', name: 'Repairs', icon: <FaWrench size={14} />, gradient: 'linear-gradient(135deg,#059669,#10B981)' },
  { id: 'tutoring', name: 'Tutoring', icon: <FaChalkboardTeacher size={14} />, gradient: 'linear-gradient(135deg,#2563EB,#60A5FA)' },
  { id: 'photography', name: 'Photography', icon: <FaCamera size={14} />, gradient: 'linear-gradient(135deg,#DB2777,#F472B6)' },
]

/* ─── icon mapping for visual display (UI only) ─────── */
const getIconForCategory = (categoryName: string): React.ReactNode => {
  const name = categoryName.toLowerCase()
  if (name.includes('clean')) return <FaBroom size={14} />
  if (name.includes('salon') || name.includes('barber') || name.includes('hair')) return <FaCut size={14} />
  if (name.includes('laundry') || name.includes('wash')) return <FaTshirt size={14} />
  if (name.includes('electrical') || name.includes('electrician') || name.includes('electric')) return <FaBolt size={14} />
  if (name.includes('repair') || name.includes('fix') || name.includes('handyman')) return <FaWrench size={14} />
  if (name.includes('tutor') || name.includes('teach') || name.includes('education')) return <FaChalkboardTeacher size={14} />
  if (name.includes('photo') || name.includes('camera')) return <FaCamera size={14} />
  return <FaTools size={14} />
}

const getGradientForCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase()
  if (name.includes('clean')) return 'linear-gradient(135deg,#B42225,#FF6B00)'
  if (name.includes('salon') || name.includes('barber')) return 'linear-gradient(135deg,#7C3AED,#A78BFA)'
  if (name.includes('laundry')) return 'linear-gradient(135deg,#0891B2,#06B6D4)'
  if (name.includes('electrical') || name.includes('electrician')) return 'linear-gradient(135deg,#D97706,#F59E0B)'
  if (name.includes('repair')) return 'linear-gradient(135deg,#059669,#10B981)'
  if (name.includes('tutor')) return 'linear-gradient(135deg,#2563EB,#60A5FA)'
  if (name.includes('photo')) return 'linear-gradient(135deg,#DB2777,#F472B6)'
  return 'linear-gradient(135deg,#6B7280,#9CA3AF)'
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}
const PRICE_TYPES = [
  { val: 'fixed', label: 'Fixed Price' },
  { val: 'starting_at', label: 'Starting At' },
  { val: 'negotiable', label: 'Negotiable' },
]
const BOOKING_MODES = [
  { val: 'request', label: 'Request (you approve)' },
  { val: 'instant', label: 'Instant Booking' },
]

/* ─── small helpers ─────────────────────────────────────────────── */
const inputCls = 'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all'
const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }
const labelCls = 'text-white/50 text-[10px] font-black mb-1.5 block uppercase tracking-widest'

function formatPrice(type: string, price: number) {
  if (type === 'negotiable') return 'Negotiable'
  const prefix = type === 'starting_at' ? 'From ' : ''
  return `${prefix}₦${price.toLocaleString()}`
}

/* ─── sub-components ────────────────────────────────────────────── */
function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Active', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    inactive: { label: 'Inactive', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  }
  const c = cfg[status] || cfg['pending']
  return (
    <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ color: c.color, background: c.bg }}>
      ● {c.label}
    </span>
  )
}

/* ─── schedule builder ──────────────────────────────────────────── */
function ScheduleBuilder({
  schedule, onChange,
}: {
  schedule: Record<string, Array<{ start: string; end: string }>>
  onChange: (s: Record<string, Array<{ start: string; end: string }>>) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleDay = (day: string) => {
    if (schedule[day]) {
      const next = { ...schedule }
      delete next[day]
      onChange(next)
    } else {
      onChange({ ...schedule, [day]: [{ start: '09:00', end: '17:00' }] })
      setExpanded(day)
    }
  }

  const updateSlot = (day: string, i: number, field: 'start' | 'end', val: string) => {
    const slots = [...(schedule[day] || [])]
    slots[i] = { ...slots[i], [field]: val }
    onChange({ ...schedule, [day]: slots })
  }

  return (
    <div className="space-y-2">
      {DAYS.map(day => {
        const active = !!schedule[day]
        const slots = schedule[day] || []
        const isOpen = expanded === day && active
        return (
          <div key={day} className="rounded-xl overflow-hidden"
            style={active
              ? { background: 'rgba(255,140,0,0.06)', border: '1px solid rgba(255,140,0,0.2)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 p-3">
              <button onClick={() => toggleDay(day)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${active ? 'text-white' : 'border border-white/20'}`}
                style={active ? { background: 'linear-gradient(135deg,#B42225,#FF8C00)' } : {}}>
                {active && <FiCheck size={11} />}
              </button>
              <span className={`text-xs font-black flex-1 ${active ? 'text-white' : 'text-white/40'}`}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </span>
              {active && (
                <>
                  <span className="text-[10px] text-white/40">{slots.map(s => `${s.start}–${s.end}`).join(', ')}</span>
                  <button onClick={() => setExpanded(isOpen ? null : day)} className="text-white/40 hover:text-white ml-1">
                    {isOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                  </button>
                </>
              )}
            </div>
            {isOpen && (
              <div className="px-3 pb-3 space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" value={slot.start}
                      onChange={e => updateSlot(day, i, 'start', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }} />
                    <span className="text-white/30 text-xs">to</span>
                    <input type="time" value={slot.end}
                      onChange={e => updateSlot(day, i, 'end', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <p className="text-white/25 text-[10px]">Tap a day to toggle. Expand to set hours.</p>
    </div>
  )
}

/* ─── service form ──────────────────────────────────────────────── */
function ServiceForm({
  initial, onSave, onCancel, saving, allowedCategoryIds, categories,
}: {
  initial?: Partial<ServiceData>
  onSave: (data: any) => void
  onCancel: () => void
  saving: boolean
  allowedCategoryIds: string[]
  categories: DisplayCategory[]
}) {
  const validCats = categories.filter(cat => allowedCategoryIds.includes(cat.id))

  const [data, setData] = useState({
    display_name: initial?.display_name || '',
    category_id: initial?.category_id || (validCats[0]?.id || ''),
    description: initial?.description || '',
    price_type: initial?.price_type || 'fixed',
    starting_price: initial?.starting_price || 0,
    location: initial?.location || '',
    availability_schedule: initial?.availability_schedule || {},
    booking_mode: initial?.booking_mode || 'request',
  })

  const upd = (k: string, v: any) => setData(d => ({ ...d, [k]: v }))

  const isValid =
    data.display_name.trim().length >= 2 &&
    data.category_id &&
    data.description.trim().length >= 10 &&
    data.location.trim().length >= 3 &&
    (data.price_type === 'negotiable' || data.starting_price > 0) &&
    Object.keys(data.availability_schedule).length > 0

  if (validCats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 text-sm">No approved categories found.</p>
        <p className="text-white/40 text-xs mt-2">Please contact support to get your categories approved.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Service Display Name *</label>
        <input className={inputCls} style={inputStyle} placeholder="e.g. Professional Deep Cleaning"
          value={data.display_name} onChange={e => upd('display_name', e.target.value)} />
      </div>

      <div>
        <label className={labelCls}>Category *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {validCats.map(({ id, name, icon, gradient }) => (
            <button key={id} onClick={() => upd('category_id', id)}
              className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
              style={{
                background: data.category_id === id ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
                border: data.category_id === id ? '1px solid rgba(255,140,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: gradient }}>
                {icon}
              </div>
              <span className="text-white text-[11px] font-bold leading-tight">{name}</span>
              {data.category_id === id && <FiCheck size={11} className="text-[#FF8C00] ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Description *</label>
        <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3}
          placeholder="Describe your service in detail — what's included, your process, requirements..."
          value={data.description} onChange={e => upd('description', e.target.value.slice(0, 500))} />
        <p className="text-white/20 text-[10px] mt-0.5 text-right">{data.description.length}/500</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Price Type *</label>
          <div className="space-y-1.5">
            {PRICE_TYPES.map(({ val, label }) => (
              <button key={val} onClick={() => upd('price_type', val)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all"
                style={data.price_type === val
                  ? { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.35)', color: '#FF8C00' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${data.price_type === val ? 'border-[#FF8C00]' : 'border-white/20'}`}>
                  {data.price_type === val && <div className="w-2 h-2 rounded-full" style={{ background: '#FF8C00' }} />}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>{data.price_type === 'negotiable' ? 'Price (Optional)' : 'Amount (₦) *'}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">₦</span>
            <input type="number" min={0}
              className={`${inputCls} pl-7`} style={inputStyle}
              placeholder="0"
              value={data.starting_price || ''}
              onChange={e => upd('starting_price', Number(e.target.value))}
              disabled={data.price_type === 'negotiable'} />
          </div>
          <div className="mt-2">
            <label className={labelCls}>Location *</label>
            <input className={inputCls} style={inputStyle} placeholder="e.g. FUTO Campus, Owerri"
              value={data.location} onChange={e => upd('location', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Booking Mode *</label>
        <div className="grid grid-cols-2 gap-2">
          {BOOKING_MODES.map(({ val, label }) => (
            <button key={val} onClick={() => upd('booking_mode', val)}
              className="p-3 rounded-xl text-xs font-bold text-center transition-all"
              style={data.booking_mode === val
                ? { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.35)', color: '#FF8C00' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Availability Schedule *</label>
        <ScheduleBuilder
          schedule={data.availability_schedule}
          onChange={s => upd('availability_schedule', s)} />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} disabled={saving}
          className="flex-1 py-3 rounded-2xl text-sm font-black text-white/50 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Cancel
        </button>
        <button onClick={() => onSave(data)} disabled={!isValid || saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isValid ? 'linear-gradient(135deg,#B42225,#FF8C00)' : 'rgba(255,255,255,0.08)',
            boxShadow: isValid ? '0 8px 24px rgba(180,34,37,0.3)' : 'none',
          }}>
          {saving ? <><Spinner /> Saving...</> : <><FiCheck size={15} /> Save Service</>}
        </button>
      </div>
    </div>
  )
}

/* ─── MAIN DASHBOARD ────────────────────────────────────────────── */
export default function ProviderDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [service, setService] = useState<ServiceData | null>(null)
  const [hasService, setHasService] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [allowedCategoryIds, setAllowedCategoryIds] = useState<string[]>([])
  const [categories, setCategories] = useState<DisplayCategory[]>(FALLBACK_CATEGORIES)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [editingProfile, setEditingProfile] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingService, setSavingService] = useState(false)
  const [deletingService, setDeletingService] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)

  const [profForm, setProfForm] = useState({
    business_name: '', business_bio: '', whatsapp_number: '', logo_url: '', cover_image_url: '',
  })
  const [profError, setProfError] = useState('')
  const [serviceError, setServiceError] = useState('')

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    const timeoutId = setTimeout(() => {
      setCategories(FALLBACK_CATEGORIES)
      setCategoriesLoading(false)
    }, 3000)

    try {
      const response = await apiService.getPublicCategories('SERVICE')
      clearTimeout(timeoutId)
      
      let cats: CategoryFromAPI[] = []
      if (response?.data?.categories && Array.isArray(response.data.categories)) {
        cats = response.data.categories
      } else if (Array.isArray(response)) {
        cats = response
      } else if (response?.data && Array.isArray(response.data)) {
        cats = response.data
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories
      }

      if (cats.length > 0) {
        const mappedCategories: DisplayCategory[] = cats
          .filter((cat: CategoryFromAPI) => cat.is_active !== false)
          .map((cat: CategoryFromAPI) => ({
            id: cat.id,
            name: cat.name,
            icon: getIconForCategory(cat.name),
            gradient: getGradientForCategory(cat.name),
          }))
        setCategories(mappedCategories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      clearTimeout(timeoutId)
      setCategoriesLoading(false)
    }
  }, [])

  const load = useCallback(async () => {
    setPageLoading(true)
    setPageError('')
    try {
      fetchCategories()

      let profRes: any = null
      try {
        profRes = await apiService.getServiceProviderDetails()
      } catch {
        router.replace('/services/apply')
        return
      }

      if (!profRes) {
        router.replace('/services/apply')
        return
      }

      const p = profRes?.data || profRes

      let providerCats: string[] = []
      if (p.service_category && Array.isArray(p.service_category)) {
        providerCats = p.service_category
      } else if (p.service_categories && Array.isArray(p.service_categories)) {
        providerCats = p.service_categories
      } else if (p.categories && Array.isArray(p.categories)) {
        providerCats = p.categories
      } else if (p.category) {
        providerCats = [p.category]
      } else if (p.category_id) {
        providerCats = [p.category_id]
      }

      setAllowedCategoryIds(providerCats)

      const resolvedStatus = (() => {
        if (p.is_active === true) return 'active'
        const rawStatus = (p.provider_status || p.status || p.account_status || '').toString().toLowerCase().trim()
        if (['active', 'verified', 'approved', 'complete', 'completed', 'enabled'].includes(rawStatus)) return 'active'
        if (['pending', 'under_review', 'submitted', 'reviewing', 'review', ''].includes(rawStatus)) {
          if (p.is_phone_verified === true) return 'active'
          return 'pending'
        }
        if (['inactive', 'suspended', 'disabled', 'banned', 'rejected'].includes(rawStatus)) return 'inactive'
        return 'pending'
      })()

      const profileWithStatus: ProviderProfile = { ...p, _resolvedStatus: resolvedStatus }
      setProfile(profileWithStatus)
      setProfForm({
        business_name: p.business_name || '',
        business_bio: p.business_bio || '',
        whatsapp_number: p.whatsapp_number || p.phone_number || '',
        logo_url: p.logo_url || '',
        cover_image_url: p.cover_image_url || '',
      })

      if (resolvedStatus === 'pending') {
        const providerId = p.id || p.service_provider_id
        if (providerId) localStorage.setItem('sp_pending_id', String(providerId))
        router.replace('/services/apply/verify')
        return
      }

      if (resolvedStatus === 'inactive') return
// Fetch their service - using direct fetch to debug
const token = localStorage.getItem('access_token')
const directResponse = await fetch('https://dev-api-jovomart.onrender.com/api/v1/service-provider/services/my-services', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const directData = await directResponse.json()
console.log('DIRECT FETCH - my-services:', directData)
console.log('DIRECT FETCH - data object:', directData.data)
console.log('DIRECT FETCH - data keys:', Object.keys(directData.data || {}))
console.log('DIRECT FETCH - full JSON:', JSON.stringify(directData, null, 2))

let svcData = null

// Try to find the service data
if (directData?.data) {
  // Check what's inside data
  const dataObj = directData.data
  
  if (Array.isArray(dataObj) && dataObj.length > 0) {
    svcData = dataObj[0]
    console.log('Case 1: data is an array')
  } else if (dataObj && typeof dataObj === 'object') {
    // Check if it has a services or items property
    if (dataObj.services && Array.isArray(dataObj.services) && dataObj.services.length > 0) {
      svcData = dataObj.services[0]
      console.log('Case 2: data.services array')
    } else if (dataObj.items && Array.isArray(dataObj.items) && dataObj.items.length > 0) {
      svcData = dataObj.items[0]
      console.log('Case 3: data.items array')
    } else if (dataObj.results && Array.isArray(dataObj.results) && dataObj.results.length > 0) {
      svcData = dataObj.results[0]
      console.log('Case 4: data.results array')
    } else if (dataObj.id) {
      svcData = dataObj
      console.log('Case 5: data has id directly')
    } else {
      // Try to find any array property
      for (const key in dataObj) {
        if (Array.isArray(dataObj[key]) && dataObj[key].length > 0 && dataObj[key][0]?.id) {
          svcData = dataObj[key][0]
          console.log(`Case 6: Found service in data.${key} array`)
          break
        }
      }
    }
  }
}

console.log('Extracted service data:', svcData)

if (svcData && svcData.id) {
  setService(svcData)
  setHasService(true)
  console.log('✅ Service loaded:', svcData.display_name)
} else {
  setHasService(false)
  setService(null)
  console.log('❌ No service found')
}
    } catch (err: any) {
      setPageError(err.message || 'Failed to load your profile.')
    } finally {
      setPageLoading(false)
    }
  }, [fetchCategories, router])

  useEffect(() => {
    load()
  }, [load])

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfError('')
    try {
      await apiService.updateServiceProviderProfile(profForm)
      await load()
      setEditingProfile(false)
    } catch (err: any) {
      setProfError(err.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const createService = async (data: any) => {
  setSavingService(true)
  setServiceError('')
  try {
    const token = localStorage.getItem('access_token')
    
    // Separate the schedule from the rest of the data
    const { availability_schedule, ...serviceData } = data
    
    // Step 1: Create service with EMPTY schedule (this works)
    console.log('Step 1: Creating service with empty schedule')
    const createResponse = await fetch('https://dev-api-jovomart.onrender.com/api/v1/service-provider/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...serviceData,
        availability_schedule: {}
      })
    })
    
    const createResponseText = await createResponse.text()
    console.log('Create response:', createResponse.status, createResponseText)
    
    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponseText}`)
    }
    
    const createResult = JSON.parse(createResponseText)
    const serviceId = createResult.data?.id
    
    if (!serviceId) {
      throw new Error('No service ID returned')
    }
    
    console.log('✅ Service created with ID:', serviceId)
    
    // Step 2: Update with actual schedule if days were selected
    if (Object.keys(availability_schedule).length > 0) {
      console.log('Step 2: Adding schedule to service')
      const updateResponse = await fetch(`https://dev-api-jovomart.onrender.com/api/v1/service-provider/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          availability_schedule: availability_schedule
        })
      })
      
      const updateResponseText = await updateResponse.text()
      console.log('Update response:', updateResponse.status, updateResponseText)
      
      if (!updateResponse.ok) {
        console.warn('⚠️ Schedule update failed, but service was created')
      } else {
        console.log('✅ Schedule added successfully')
      }
    }
    
    await load()
    setShowServiceForm(false)
  } catch (err: any) {
    console.error('❌ Create service error:', err)
    setServiceError(err.message || 'Failed to create service.')
  } finally {
    setSavingService(false)
  }
}

  const updateService = async (data: any) => {
    if (!service) return
    setSavingService(true)
    setServiceError('')
    try {
      await apiService.updateService(service.id, data)
      await load()
      setEditingService(false)
    } catch (err: any) {
      setServiceError(err.message || 'Failed to update service.')
    } finally {
      setSavingService(false)
    }
  }

  const deleteService = async () => {
    if (!service) return
    setDeletingService(true)
    try {
      await apiService.deleteService(service.id)
      await load()
      setConfirmDelete(false)
    } catch (err: any) {
      setServiceError(err.message || 'Failed to delete service.')
    } finally {
      setDeletingService(false)
    }
  }

  const toggleActive = async () => {
    if (!service) return
    setTogglingActive(true)
    try {
      await apiService.updateService(service.id, { is_active: !service.is_active })
      await load()
    } catch { /* silently fail */ } finally {
      setTogglingActive(false)
    }
  }

  const getCategoryDisplay = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)
  }

  const catInfo = service ? getCategoryDisplay(service.category_id) : null
  const dotBg = { backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '28px 28px' }

  const hasApprovedCategories = allowedCategoryIds.length > 0 && categories.some(cat => allowedCategoryIds.includes(cat.id))

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0a0a0a,#111,#1a0a00)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-[#FF8C00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#0a0a0a,#111,#1a0a00)' }}>
        <div className="text-center max-w-sm">
          <FiAlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-white font-black text-lg mb-2">Oops, something went wrong</p>
          <p className="text-white/40 text-sm mb-5">{pageError}</p>
          <button onClick={load} className="px-6 py-3 rounded-2xl text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const showCreateButton = !hasService && !showServiceForm && hasApprovedCategories

  return (
    <div style={{ background: '#F4F5F9', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={dotBg} />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#FF8C00,transparent 65%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-10 pb-12">
          <Link href="/services"
            className="inline-flex items-center gap-2 text-white/40 text-xs font-semibold hover:text-white/70 transition-colors mb-8">
            <FiArrowLeft size={14} /> Back to Marketplace
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
                  {profile?.business_name?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
              <div className="mt-2">
                <StatusBadge status={profile?._resolvedStatus || profile?.status || profile?.provider_status || 'pending'} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-white font-black text-2xl md:text-3xl leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
                  {profile?.business_name}
                </h1>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-3 line-clamp-2">{profile?.business_bio}</p>

              <div className="flex flex-wrap gap-3 text-xs text-white/40">
                {profile?.whatsapp_number && (
                  <span className="flex items-center gap-1.5">
                    <FaWhatsapp className="text-green-400" size={12} /> {profile.whatsapp_number}
                  </span>
                )}
                {(profile?.rating ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" size={11} />
                    {profile?.rating?.toFixed(1)} ({profile?.review_count} reviews)
                  </span>
                )}
              </div>
            </div>

            <button onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white hover:opacity-90 transition-opacity shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <FiEdit2 size={13} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {editingProfile && (
          <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            <div className="p-6 md:p-8" style={{ background: '#1a0a00', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-lg" style={{ fontFamily: "'Georgia',serif" }}>Edit Profile</h2>
                <button onClick={() => setEditingProfile(false)} className="text-white/40 hover:text-white transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Business Name</label>
                  <input className={inputCls} style={inputStyle} value={profForm.business_name}
                    onChange={e => setProfForm(f => ({ ...f, business_name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Business Bio</label>
                  <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3}
                    value={profForm.business_bio}
                    onChange={e => setProfForm(f => ({ ...f, business_bio: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>WhatsApp Number</label>
                  <input className={inputCls} style={inputStyle} value={profForm.whatsapp_number}
                    onChange={e => setProfForm(f => ({ ...f, whatsapp_number: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Logo URL</label>
                    <input className={inputCls} style={inputStyle} placeholder="https://..." value={profForm.logo_url}
                      onChange={e => setProfForm(f => ({ ...f, logo_url: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Cover Image URL</label>
                    <input className={inputCls} style={inputStyle} placeholder="https://..." value={profForm.cover_image_url}
                      onChange={e => setProfForm(f => ({ ...f, cover_image_url: e.target.value }))} />
                  </div>
                </div>

                {profError && (
                  <div className="p-3 rounded-xl text-red-400 text-xs"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {profError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditingProfile(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-white/50 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                  <button onClick={saveProfile} disabled={savingProfile}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
                    {savingProfile ? <><Spinner /> Saving...</> : <><FiCheck size={15} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-900 font-black text-xl" style={{ fontFamily: "'Georgia',serif" }}>My Service</h2>
              <p className="text-gray-500 text-xs mt-0.5">You can have 1 active service at a time</p>
            </div>
            {showCreateButton && (
              <button onClick={() => setShowServiceForm(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 4px 16px rgba(180,34,37,0.3)' }}>
                <FiPlus size={14} /> Create Service
              </button>
            )}
          </div>

          {serviceError && (
            <div className="p-4 rounded-2xl text-red-500 text-sm mb-4 flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <FiAlertCircle size={15} className="shrink-0 mt-0.5" /> {serviceError}
            </div>
          )}

          {showServiceForm && !hasService && (
            <div className="bg-white rounded-3xl p-6 md:p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: "'Georgia',serif" }}>Create Your Service</h3>
                <button onClick={() => { setShowServiceForm(false); setServiceError('') }}
                  className="text-gray-400 hover:text-gray-700 transition-colors">
                  <FiX size={18} />
                </button>
              </div>
              <div className="rounded-2xl p-5" style={{ background: '#111', color: 'white' }}>
                <ServiceForm
                  onSave={createService}
                  onCancel={() => { setShowServiceForm(false); setServiceError('') }}
                  saving={savingService}
                  allowedCategoryIds={allowedCategoryIds}
                  categories={categories}
                />
              </div>
            </div>
          )}

          {!hasService && !showServiceForm && (
            <div className="bg-white rounded-3xl p-10 text-center" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg,rgba(180,34,37,0.1),rgba(255,140,0,0.1))', border: '1px dashed rgba(180,34,37,0.3)' }}>
                <FiTool size={24} className="text-[#B42225]" />
              </div>
              <p className="font-black text-gray-800 text-base mb-1" style={{ fontFamily: "'Georgia',serif" }}>
                No service listed yet
              </p>
              <p className="text-gray-400 text-sm mb-5 max-w-xs mx-auto">
                Create your first service card to start appearing in the marketplace and getting bookings.
              </p>
              {!hasApprovedCategories ? (
                <div>
                  <p className="text-yellow-600 text-sm mb-2">Your category is being loaded or not yet approved.</p>
                  <p className="text-gray-400 text-xs">Approved Category UUID: {allowedCategoryIds[0]}</p>
                </div>
              ) : (
                <button onClick={() => setShowServiceForm(true)}
                  className="px-6 py-3 rounded-2xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 6px 20px rgba(180,34,37,0.3)' }}>
                  <FiPlus size={14} className="inline mr-1.5" /> Create My Service
                </button>
              )}
            </div>
          )}

          {hasService && service && !editingService && (
            <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              {profile?.cover_image_url && (
                <div className="h-32 overflow-hidden">
                  <img src={profile.cover_image_url} alt="cover" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-5 md:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: catInfo?.gradient || getGradientForCategory('default') }}>
                    {catInfo?.icon || <FaTools size={16} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-gray-900 text-base leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
                        {service.display_name}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {service.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiMapPin size={10} className="text-[#B42225]" /> {service.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={toggleActive} disabled={togglingActive}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all"
                      style={service.is_active
                        ? { background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }
                        : { background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {togglingActive ? <Spinner /> : service.is_active ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setEditingService(true)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black transition-all"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-4">{service.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
                    <p className="font-black text-[#B42225] text-sm">{formatPrice(service.price_type, service.starting_price)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Booking</p>
                    <p className="font-semibold text-gray-700 capitalize">{service.booking_mode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Available Days</p>
                    <div className="flex gap-1 flex-wrap">
                      {DAYS.map(d => (
                        <span key={d}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${service.availability_schedule[d] ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-300'}`}>
                          {DAY_SHORT[d]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {confirmDelete && (
                  <div className="mt-5 p-4 rounded-2xl"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-sm font-black text-gray-800 mb-1">Delete this service?</p>
                    <p className="text-xs text-gray-500 mb-3">This will remove your service card from the marketplace permanently.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                        Cancel
                      </button>
                      <button onClick={deleteService} disabled={deletingService}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50">
                        {deletingService ? <><Spinner /> Deleting...</> : <><FiTrash2 size={13} /> Yes, Delete</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {editingService && service && (
            <div className="bg-white rounded-3xl p-6 md:p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: "'Georgia',serif" }}>Edit Service</h3>
                <button onClick={() => { setEditingService(false); setServiceError('') }}
                  className="text-gray-400 hover:text-gray-700 transition-colors">
                  <FiX size={18} />
                </button>
              </div>
              <div className="rounded-2xl p-5" style={{ background: '#111' }}>
                <ServiceForm
                  initial={service}
                  onSave={updateService}
                  onCancel={() => { setEditingService(false); setServiceError('') }}
                  saving={savingService}
                  allowedCategoryIds={allowedCategoryIds}
                  categories={categories}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}