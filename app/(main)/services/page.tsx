'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import {
  FiSearch, FiX, FiPhone, FiMapPin,
  FiCheckCircle, FiFilter, FiChevronDown, FiUsers,
  FiGrid, FiUserCheck, FiTool, FiArrowRight, FiSettings,
  FiAlertCircle, FiRefreshCw, FiLoader, FiLock,
} from 'react-icons/fi'
import {
  FaWhatsapp, FaStar, FaStarHalfAlt, FaRegStar,
  FaBroom, FaCut, FaTshirt, FaBolt, FaWrench,
  FaLightbulb, FaChalkboardTeacher, FaCamera,
} from 'react-icons/fa'
import apiService from '@/services/apiService'

/* ─── Icon mapping for category icons (UI config only) ────────── */
// Map category names/IDs to icons and gradients
const getCategoryIcon = (categoryName: string): React.ReactNode => {
  const name = categoryName.toLowerCase()
  if (name.includes('clean')) return <FaBroom size={14} />
  if (name.includes('salon') || name.includes('barber')) return <FaCut size={14} />
  if (name.includes('laundry')) return <FaTshirt size={14} />
  if (name.includes('electrical')) return <FaBolt size={14} />
  if (name.includes('repair')) return <FaWrench size={14} />
  if (name.includes('tutor')) return <FaChalkboardTeacher size={14} />
  if (name.includes('photo')) return <FaCamera size={14} />
  return <FaLightbulb size={14} />
}

const getCategoryGradient = (categoryName: string): string => {
  const name = categoryName.toLowerCase()
  if (name.includes('clean')) return 'linear-gradient(135deg,#B42225,#FF6B00)'
  if (name.includes('salon') || name.includes('barber')) return 'linear-gradient(135deg,#7C3AED,#A78BFA)'
  if (name.includes('laundry')) return 'linear-gradient(135deg,#0891B2,#06B6D4)'
  if (name.includes('electrical')) return 'linear-gradient(135deg,#D97706,#F59E0B)'
  if (name.includes('repair')) return 'linear-gradient(135deg,#059669,#10B981)'
  if (name.includes('tutor')) return 'linear-gradient(135deg,#2563EB,#60A5FA)'
  if (name.includes('photo')) return 'linear-gradient(135deg,#DB2777,#F472B6)'
  return 'linear-gradient(135deg,#6B7280,#9CA3AF)'
}

/* ─── Category interface from API ──────────────────────────────── */
interface ApiCategory {
  id: string
  name: string
  description?: string
  category_type?: string
  is_active?: boolean
  parent_id?: string | null
  attributes?: any[]
}

interface DisplayCategory {
  id: string
  name: string
  icon: React.ReactNode
  gradient: string
}

const PAGE_LIMIT = 12

/* ─── API response → display shape ────────────────────────────── */
interface ApiProvider {
  id: string
  display_name?: string
  name?: string
  category_id?: string
  category?: string
  category_name?: string
  description?: string
  price_type?: string
  starting_price?: number
  location?: string
  is_active?: boolean
  available?: boolean
  booking_mode?: string
  business_name?: string
  provider_name?: string
  logo_url?: string
  image?: string
  cover_image_url?: string
  whatsapp_number?: string
  whatsapp?: string
  phone?: string
  rating?: number
  average_rating?: number
  review_count?: number
  reviews?: number
  tags?: string[]
}

interface DisplayProvider {
  id: string
  name: string
  providerName: string
  category: string
  categoryName: string
  image: string
  location: string
  rating: number
  reviews: number
  tags: string[]
  description: string
  priceLabel: string
  price: number
  whatsapp: string
  phone: string
  available: boolean
}

function formatPrice(type = 'fixed', price = 0): string {
  if (type === 'negotiable') return 'Negotiable'
  const prefix = type === 'starting_at' ? 'From ' : ''
  return price > 0 ? `${prefix}₦${price.toLocaleString()}` : 'Price on request'
}

function mapProvider(p: ApiProvider): DisplayProvider {
  // Get category name from either category, category_name, or category_id
  const categoryName = p.category_name || p.category || p.category_id || 'repair'
  
  return {
    id:           p.id,
    name:         p.display_name || p.name || 'Unnamed Service',
    providerName: p.business_name || p.provider_name || p.display_name || p.name || '',
    category:     p.category_id || p.category || 'repair',
    categoryName: categoryName,
    image:        p.logo_url || p.cover_image_url || p.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
    location:     p.location || 'Location not set',
    rating:       p.rating ?? p.average_rating ?? 0,
    reviews:      p.review_count ?? p.reviews ?? 0,
    price:        p.starting_price ?? 0,
    priceLabel:   formatPrice(p.price_type, p.starting_price),
    whatsapp:     p.whatsapp_number || p.whatsapp || '',
    phone:        p.phone || (p.whatsapp_number ? `+${p.whatsapp_number}` : ''),
    available:    p.is_active ?? p.available ?? true,
    tags:         p.tags || [],
    description:  p.description || '',
  }
}

/* ─── stars ────────────────────────────────────────────────────── */
const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => {
      if (rating >= s)        return <FaStar        key={s} size={11} className="text-yellow-400" />
      if (rating >= s - 0.5)  return <FaStarHalfAlt key={s} size={11} className="text-yellow-400" />
      return                         <FaRegStar      key={s} size={11} className="text-gray-300"  />
    })}
  </div>
)

/* ─── provider card ────────────────────────────────────────────── */
const ProviderCard = ({ provider, categories }: { provider: DisplayProvider; categories: DisplayCategory[] }) => {
  // Find category from our fetched categories, or create a fallback
  const cat = categories.find(c => c.id === provider.category || c.name.toLowerCase() === provider.categoryName.toLowerCase()) || {
    id: provider.category,
    name: provider.categoryName,
    icon: getCategoryIcon(provider.categoryName),
    gradient: getCategoryGradient(provider.categoryName)
  }
  
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={provider.image}
          alt={provider.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {cat && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-black px-2.5 py-1 rounded-full"
            style={{ background: cat.gradient }}>
            {cat.icon} {cat.name}
          </div>
        )}
        <div className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full ${provider.available ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
          {provider.available ? '● Available' : '● Busy'}
        </div>
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-black text-gray-900 text-sm md:text-base leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
            {provider.name}
          </h3>
          {provider.providerName !== provider.name && (
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{provider.providerName}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <FiMapPin size={10} className="text-[#B42225] shrink-0" /> {provider.location}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Stars rating={provider.rating} />
          {provider.rating > 0
            ? <><span className="text-xs font-black text-gray-800">{provider.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({provider.reviews} review{provider.reviews !== 1 ? 's' : ''})</span></>
            : <span className="text-xs text-gray-400">No reviews yet</span>
          }
        </div>

        {provider.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {provider.tags.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}

        {provider.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{provider.description}</p>
        )}

        <p className="text-sm font-black text-[#B42225]">{provider.priceLabel}</p>

        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
          {provider.whatsapp ? (
            <a
              href={`https://wa.me/${provider.whatsapp}?text=Hi, I found you on JOVO and I'd like to book your ${cat?.name || ''} service.`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
              style={{ background: '#25D366' }}>
              <FaWhatsapp size={14} /> WhatsApp
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-black text-gray-400 bg-gray-100">
              No contact yet
            </div>
          )}
          {provider.phone && (
            <a href={`tel:${provider.phone}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all">
              <FiPhone size={13} /> Call
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── skeleton card ────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden animate-pulse" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
    <div className="bg-gray-200" style={{ aspectRatio: '16/9' }} />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 rounded-full w-2/3" />
      <div className="flex gap-1.5 mt-1">
        {[1,2,3].map(i => <div key={i} className="h-5 w-16 bg-gray-100 rounded-full" />)}
      </div>
      <div className="h-8 bg-gray-100 rounded-xl mt-2" />
    </div>
  </div>
)

/* ─── Category Skeleton ────────────────────────────────────────── */
const CategorySkeleton = () => (
  <div className="px-4 py-2 rounded-xl bg-gray-200 animate-pulse w-24 h-10" />
)

/* ─── Login Required Modal ──────────────────────────────────────── */
function LoginRequiredModal({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 md:p-8 animate-success-pop">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={18} />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
            <FiLock size={32} className="text-white" />
          </div>

          <h3 className="font-black text-gray-900 text-xl mb-2" style={{ fontFamily: "'Georgia',serif" }}>
            Account Required
          </h3>

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            You need to log in or create an account to become a service provider on JOVO. It only takes a minute!
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onLogin}
              className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 4px 12px rgba(180,34,37,0.3)' }}
            >
              Log In / Sign Up
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-6">
            By continuing, you agree to JOVO&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── provider CTA banner (with auth check) ──────────────────────── */
function ProviderCTABanner({ isProvider, onApplyClick }: { isProvider: boolean | null; onApplyClick: () => void }) {
  if (isProvider === null) return null

  if (isProvider) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        <Link href="/services/dashboard"
          className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-90 group"
          style={{ background: 'linear-gradient(135deg,rgba(180,34,37,0.08),rgba(255,140,0,0.08))', border: '1px solid rgba(180,34,37,0.2)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
            <FiSettings size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-800">You&apos;re a Service Provider</p>
            <p className="text-xs text-gray-500">Manage your profile, service, and availability</p>
          </div>
          <FiArrowRight size={16} className="text-[#B42225] shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
      <div 
        className="relative overflow-hidden rounded-2xl p-5 md:p-6 cursor-pointer transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg,#0f0f0f,#1a0a00)', border: '1px solid rgba(255,140,0,0.2)' }}
        onClick={onApplyClick}
      >
        <div className="absolute right-0 top-0 w-40 h-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right,#FF8C00,transparent 70%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <FiTool size={10} /> For Providers
            </p>
            <h3 className="text-white font-black text-base md:text-lg leading-tight mb-1" style={{ fontFamily: "'Georgia',serif" }}>
              Got a skill? Start earning today.
            </h3>
            <p className="text-white/40 text-xs leading-relaxed">
              Join providers on JOVO — apply in 2 minutes and go live on the marketplace.
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onApplyClick() }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white whitespace-nowrap transition-all hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 6px 20px rgba(180,34,37,0.35)' }}>
            Apply as Provider <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ────────────────────────────────────────────────── */
export default function ServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch]               = useState('')
  const [activeCategory, setCategory]     = useState(searchParams?.get('category') || 'all')
  const [showAvailable, setShowAvailable] = useState(false)
  const [sortBy, setSortBy]               = useState<'top_rated' | 'most_reviewed' | 'lowest_price'>('top_rated')
  const [showSort, setShowSort]           = useState(false)

  const [providers, setProviders]       = useState<DisplayProvider[]>([])
  const [categories, setCategories]     = useState<DisplayCategory[]>([])
  const [total, setTotal]               = useState(0)
  const [offset, setOffset]             = useState(0)
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError]               = useState('')
  const [isProvider, setIsProvider]     = useState<boolean | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Fetch categories from backend when component mounts */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        // Fetch SERVICE categories from backend
        const response = await apiService.getPublicCategories('SERVICE')
        console.log('Categories API response:', response)
        
        // Extract categories from response (handle different response shapes)
        let categoriesData = response?.data || response
        
        if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
          categoriesData = categoriesData.categories
        } else if (categoriesData?.items && Array.isArray(categoriesData.items)) {
          categoriesData = categoriesData.items
        } else if (!Array.isArray(categoriesData)) {
          categoriesData = []
        }
        
        // Map API categories to display format
        const mappedCategories: DisplayCategory[] = categoriesData
          .filter((cat: ApiCategory) => cat.is_active !== false) // Only show active categories
          .map((cat: ApiCategory) => ({
            id: cat.id,
            name: cat.name,
            icon: getCategoryIcon(cat.name),
            gradient: getCategoryGradient(cat.name),
          }))
        
        setCategories(mappedCategories)
        console.log('Mapped categories:', mappedCategories)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        // Fallback to empty array - categories will still work but won't show icons nicely
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  /* check provider status */
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setIsProvider(false); return }
    apiService.getServiceProviderDetails()
      .then(res => setIsProvider(!!(res?.data?.id || res?.id)))
      .catch(() => setIsProvider(false))
  }, [])

  /* sync category from URL */
  useEffect(() => {
    const cat = searchParams?.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  /* fetch providers */
  const fetchProviders = useCallback(async (resetOffset: boolean, currentOffset: number) => {
    if (!resetOffset) setLoadingMore(true)
    else { setLoading(true); setError('') }

    try {
      const params: Parameters<typeof apiService.getMarketplaceServices>[0] = {
        sort_by: sortBy,
        limit:   PAGE_LIMIT,
        offset:  currentOffset,
      }
      if (activeCategory !== 'all') params.category_id  = activeCategory
      if (showAvailable)            params.available_now = true
      if (search.trim())            params.location      = search.trim()

      const res   = await apiService.getMarketplaceServices(params)
      const raw   = res?.data ?? res ?? []
      const items: ApiProvider[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.items)    ? raw.items
        : Array.isArray(raw.results)  ? raw.results
        : Array.isArray(raw.services) ? raw.services
        : []

      const totalCount = raw.total ?? raw.count ?? items.length
      const mapped     = items.map(mapProvider)

      setProviders(prev => resetOffset ? mapped : [...prev, ...mapped])
      setTotal(totalCount)
      setOffset(currentOffset + PAGE_LIMIT)
    } catch (err: any) {
      if (resetOffset) setError(err.message || 'Failed to load services.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeCategory, showAvailable, sortBy, search])

  /* re-fetch when filters change */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchProviders(true, 0), search ? 500 : 0)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, showAvailable, sortBy, search])

  /* handle apply as provider with auth check */
  const handleApplyAsProvider = useCallback(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setShowLoginModal(true)
      return
    }
    // User is logged in, proceed to apply page
    router.push('/services/apply')
  }, [router])

  const handleLoginRedirect = useCallback(() => {
    setShowLoginModal(false)
    // Store the intended destination
    localStorage.setItem('redirectAfterLogin', '/services/apply')
    router.push('/login')
  }, [router])

  const hasMore    = providers.length < total
  const sortLabel  = sortBy === 'top_rated' ? 'Top Rated' : sortBy === 'most_reviewed' ? 'Most Reviewed' : 'Lowest Price'
  const dotBg      = { backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '28px 28px' }

  return (
    <>
      {/* Login Required Modal */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLoginRedirect} 
      />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]" style={dotBg} />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#FF8C00,transparent 65%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/60 text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 tracking-widest uppercase">
            <FiTool size={12} /> Campus Services
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight" style={{ fontFamily: "'Georgia',serif" }}>
            Trusted Services,<br />
            <span style={{ background: 'linear-gradient(90deg,#FF8C00,#FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Booked Instantly
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-xl mb-6 leading-relaxed">
            Connect directly with verified service providers on and around campus. Book via WhatsApp or call in seconds.
          </p>

          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 md:px-5 py-3 md:py-4 max-w-xl"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <FiSearch size={16} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search by location..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent min-w-0" />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 shrink-0">
                <FiX size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 mt-6">
            {[
              { num: total > 0 ? `${total}` : '—', label: 'Providers',     icon: <FiUsers size={10} /> },
              { num: `${categories.length}`,         label: 'Categories',    icon: <FiGrid size={10} /> },
              { num: `${providers.filter(p => p.available).length}`, label: 'Available Now', icon: <FiUserCheck size={10} /> },
            ].map(({ num, label, icon }) => (
              <div key={label} className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-[#FF8C00] text-xs">{icon}</span>
                <span className="text-[#FF8C00] font-black text-xs md:text-sm">{num}</span>
                <span className="text-white/40 text-[10px] md:text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ background: '#F4F5F9' }}>
        <ProviderCTABanner isProvider={isProvider} onApplyClick={handleApplyAsProvider} />

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">

          {/* category tabs - NOW DYNAMIC FROM BACKEND */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap mb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${activeCategory === 'all' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              style={activeCategory === 'all' ? { background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 4px 12px rgba(180,34,37,0.3)' } : {}}>
              <FiGrid size={12} className="inline mr-1" /> All Services
            </button>
            
            {loadingCategories ? (
              // Show skeleton loaders while categories load
              <>
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </>
            ) : (
              categories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${activeCategory === cat.id ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  style={activeCategory === cat.id ? { background: cat.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}>
                  {cat.icon} {cat.name}
                </button>
              ))
            )}
          </div>

          {/* filter row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-gray-500 font-semibold">
                {loading
                  ? <span className="inline-flex items-center gap-1 text-gray-400"><FiLoader size={11} className="animate-spin" /> Loading...</span>
                  : <><span className="text-gray-900 font-black">{total}</span> provider{total !== 1 ? 's' : ''} found</>
                }
              </p>
              <button onClick={() => setShowAvailable(v => !v)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${showAvailable ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                <FiCheckCircle size={12} /> Available Now
              </button>
            </div>

            <div className="relative">
              <button onClick={() => setShowSort(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-all">
                <FiFilter size={12} />
                <span className="hidden sm:inline">{sortLabel}</span>
                <FiChevronDown size={12} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 overflow-hidden z-20 w-48"
                  style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
                  {([
                    { key: 'top_rated',     label: 'Top Rated' },
                    { key: 'most_reviewed', label: 'Most Reviewed' },
                    { key: 'lowest_price',  label: 'Lowest Price' },
                  ] as { key: typeof sortBy; label: string }[]).map(({ key, label }) => (
                    <button key={key} onClick={() => { setSortBy(key); setShowSort(false) }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-gray-50 ${sortBy === key ? 'text-[#B42225] bg-red-50' : 'text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* error */}
          {error && !loading && (
            <div className="text-center py-12">
              <FiAlertCircle size={40} className="text-red-400 mx-auto mb-3" />
              <p className="font-black text-gray-700 text-base mb-1">Failed to load services</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button onClick={() => fetchProviders(true, 0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
                <FiRefreshCw size={14} /> Try Again
              </button>
            </div>
          )}

          {/* skeletons */}
          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* empty */}
          {!loading && !error && providers.length === 0 && (
            <div className="text-center py-16 md:py-20">
              <FiSearch size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="font-black text-gray-700 text-lg">No providers found</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">Try adjusting your filters or clearing the search</p>
              <button onClick={() => { setSearch(''); setCategory('all'); setShowAvailable(false) }}
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
                Clear Filters
              </button>
            </div>
          )}

          {/* results */}
          {!loading && !error && providers.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {providers.map(p => <ProviderCard key={p.id} provider={p} categories={categories} />)}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => fetchProviders(false, offset)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 6px 20px rgba(180,34,37,0.3)' }}>
                    {loadingMore
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
                      : `Load More (${total - providers.length} remaining)`
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}