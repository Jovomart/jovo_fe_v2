'use client'
import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMenu, FiSearch, FiShoppingCart, FiUser, FiHeart, FiBox,
  FiLogIn, FiLogOut, FiX, FiChevronRight, FiCpu, FiSmartphone,
  FiMonitor, FiHome, FiSettings, FiTag, FiArrowRight, FiClock,
  FiTruck, FiChevronDown, FiZap,
} from 'react-icons/fi'
import {
  MdStorefront, MdCleaningServices, MdOutlineDeliveryDining,
} from 'react-icons/md'
import { FaLeaf, FaSpa, FaConciergeBell, FaStore } from 'react-icons/fa'
import { AuthContext } from '@/context/AuthContext'
import { products } from '@/data/products'

const categories = [
  { name: 'Appliances', icon: <FiCpu size={18} />, to: '/appliances-deals', color: 'bg-orange-100 text-orange-600' },
  { name: 'Phones & Tablets', icon: <FiSmartphone size={18} />, to: '/phone-deals', color: 'bg-blue-100 text-blue-600' },
  { name: 'Health & Beauty', icon: <FiHeart size={18} />, to: '/beauty-deals', color: 'bg-pink-100 text-pink-600' },
  { name: 'Electronics', icon: <FiMonitor size={18} />, to: '/electronic-deals', color: 'bg-purple-100 text-purple-600' },
  { name: 'Fashion', icon: <FiTag size={18} />, to: '/fashion-deals', color: 'bg-red-100 text-red-600' },
  { name: 'Computing', icon: <FiCpu size={18} />, to: '/computing-deals', color: 'bg-cyan-100 text-cyan-600' },
  { name: 'Gaming', icon: <FiMonitor size={18} />, to: '/gaming-deals', color: 'bg-green-100 text-green-600' },
  { name: 'Home & Living', icon: <FiHome size={18} />, to: '/home-deals', color: 'bg-yellow-100 text-yellow-600' },
]

const moreCategories = [
  { name: 'Groceries & Snacks', icon: <FaLeaf size={16} />, to: '/groceries', color: 'bg-green-100 text-green-700' },
  { name: 'Perishable Items', icon: <FiClock size={16} />, to: '/perishable', color: 'bg-amber-100 text-amber-700' },
  { name: 'Personal Care', icon: <FaSpa size={16} />, to: '/personal-care', color: 'bg-violet-100 text-violet-700' },
  { name: 'Cleaning & Hygiene', icon: <MdCleaningServices size={16} />, to: '/cleaning-hygiene', color: 'bg-sky-100 text-sky-700' },
  { name: 'Accommodations', icon: <FiHome size={16} />, to: '/accommodations', color: 'bg-rose-100 text-rose-700' },
  { name: 'Drinks', icon: <MdStorefront size={16} />, to: '/drink-deals', color: 'bg-teal-100 text-teal-700' },
]

const SearchDropdown = ({ query, onSelect }: any) => {
  const q = query.trim().toLowerCase()
  const results = q.length > 0
    ? (products as any[]).filter((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      ).slice(0, 7)
    : []
  const hasResults = results.length > 0

  return (
    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-ink/10 overflow-hidden z-[100]"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
      {hasResults && (
        <>
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold">Products ({results.length})</p>
          </div>
          <div>
            {results.map((product: any) => {
              const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null
              return (
                <button key={product.id} onMouseDown={() => onSelect(product)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ink/5 transition-colors group text-left">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-sand border border-ink/10">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate group-hover:text-[#0E0E10] transition-colors leading-tight">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#0E0E10]">₦{product.price?.toLocaleString()}</span>
                      {product.oldPrice && <span className="text-[11px] text-ink/40 line-through">₦{product.oldPrice?.toLocaleString()}</span>}
                      {discount && <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">-{discount}%</span>}
                    </div>
                  </div>
                  <span className="hidden sm:inline text-[10px] text-ink/40 bg-sand px-2 py-1 rounded-full capitalize shrink-0">{product.category}</span>
                  <FiArrowRight size={14} className="text-ink/25 group-hover:text-[#0E0E10] shrink-0 transition-colors" />
                </button>
              )
            })}
          </div>
          <div className="border-t border-ink/10 px-4 py-2.5">
            <button onMouseDown={() => onSelect(null, query)}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#0E0E10] hover:bg-[#0E0E10]/5 py-2 rounded-xl transition-colors">
              <FiSearch size={13} /> See all results for &quot;{query.trim()}&quot; <FiChevronRight size={13} />
            </button>
          </div>
        </>
      )}
      {!hasResults && q.length > 0 && (
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center mx-auto mb-3"><FiSearch size={20} className="text-ink/40" /></div>
          <p className="text-sm font-semibold text-ink/70">No results for &quot;{query.trim()}&quot;</p>
          <p className="text-xs text-ink/40 mt-1">Try a different keyword or browse categories below</p>
        </div>
      )}
      {q.length === 0 && (
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-3">Browse Categories</p>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(({ name, icon, to, color }) => (
              <button key={name} onMouseDown={() => onSelect(null, null, to)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-ink/5 transition text-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
                <span className="text-[10px] text-ink/60 font-medium leading-tight">{name}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-ink/10 mt-3 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-3">More</p>
            <div className="grid grid-cols-4 gap-2">
              {moreCategories.map(({ name, icon, to, color }) => (
                <button key={name} onMouseDown={() => onSelect(null, null, to)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-ink/5 transition text-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
                  <span className="text-[10px] text-ink/60 font-medium leading-tight">{name}</span>
                </button>
              ))}
              <button onMouseDown={() => onSelect(null, null, '/services')}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-ink/5 transition text-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-100 text-orange-600"><FaConciergeBell size={15} /></div>
                <span className="text-[10px] text-ink/60 font-medium leading-tight">Services</span>
              </button>
              <button onMouseDown={() => onSelect(null, null, '/logistics')}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-ink/5 transition text-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100 text-green-600"><MdOutlineDeliveryDining size={17} /></div>
                <span className="text-[10px] text-ink/60 font-medium leading-tight">Logistics</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [desktopQuery, setDesktopQuery] = useState('')
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileQuery, setMobileQuery] = useState('')
  const [mobileDropOpen, setMobileDropOpen] = useState(false)

  const accountRef = useRef<HTMLDivElement>(null)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const { user, logout, isSeller, sellerMode, enterSellerMode } = useContext(AuthContext)
  const router = useRouter()

  const displayName = user?.full_name || user?.username || user?.name || 'Account'
  const initials = displayName !== 'Account'
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : null

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) setDesktopOpen(false)
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) setMobileDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSelect = (product: any, rawQuery?: any, categoryPath?: string) => {
    setDesktopOpen(false); setMobileDropOpen(false); setDesktopQuery(''); setMobileQuery('')
    if (product) router.push(`/product/${product.id}`)
    else if (categoryPath) router.push(categoryPath)
    else if (rawQuery) router.push(`/shop?search=${encodeURIComponent(rawQuery.trim())}`)
  }

  const commitSearch = (q: string) => {
    if (!q.trim()) return
    setDesktopOpen(false); setMobileDropOpen(false)
    const matches = (products as any[]).filter((p: any) =>
      p.name?.toLowerCase().includes(q.trim().toLowerCase()) ||
      p.category?.toLowerCase().includes(q.trim().toLowerCase())
    )
    if (matches.length === 1) router.push(`/product/${matches[0].id}`)
    else router.push(`/shop?search=${encodeURIComponent(q.trim())}`)
    setDesktopQuery(''); setMobileQuery('')
  }

  const handleLogout = async () => {
    setAccountOpen(false); setMobileOpen(false)
    await logout()
    router.push('/')
  }

  const handleEnterSellerMode = async () => {
    setAccountOpen(false); setMobileOpen(false)
    await enterSellerMode()
    router.push('/seller/dashboard')
  }

  const goTo = (path: string) => {
    router.push(path); setMobileOpen(false); setAccountOpen(false)
  }

  return (
    <>
      <header className={`sticky top-0 left-0 w-full z-50 border-b border-ink/[.06] transition-all duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(14,14,16,0.06)]' : 'bg-cream'}`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-0">
          <button className="md:hidden p-2 rounded-lg hover:bg-ink/5 transition text-ink/70" onClick={() => setMobileOpen(true)}>
            <FiMenu size={22} />
          </button>
          <img src="/images/Jovo_official_logo.png" alt="Jovo" onClick={() => router.push('/')}
            className="md:h-11 md:w-[180px] w-36 h-10 object-cover cursor-pointer shrink-0" />

          {/* Centre - floating pill nav */}
          <nav
            aria-label="Main navigation"
            className="mx-auto hidden items-center gap-0.5 rounded-full bg-white/60 p-1 ring-1 ring-ink/[.05] backdrop-blur xl:flex"
          >
            {[
              { href: '/shop', label: 'Shop all' },
              { href: '/deals', label: 'Deals' },
              { href: '/services', label: 'Services' },
              { href: '/logistics', label: 'Delivery' },
              { href: '/become-seller', label: 'Sell on JOVO' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap rounded-full px-3 py-[7px] text-[12px] font-medium text-ink/60 transition-colors duration-200 hover:bg-white hover:text-ink"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/flash-sales"
              className="ml-0.5 flex items-center gap-1.5 rounded-full bg-ink px-3 py-[7px] text-[11px] font-medium text-white transition-colors duration-200 hover:bg-ink/85"
            >
              <FiZap size={9} />
              Flash sales
            </Link>
          </nav>

          {/* Desktop search */}
          <div className="relative mx-3 hidden max-w-md flex-1 md:flex xl:mx-4" ref={desktopSearchRef}>
            <div className={`flex w-full overflow-hidden rounded-full transition-all duration-200 ${desktopOpen ? 'bg-white shadow-[0_0_0_4px_rgba(14,14,16,0.05)] ring-1 ring-ink/20' : 'bg-white ring-1 ring-ink/[.06] hover:ring-ink/15'}`}>
              <input type="text" placeholder="Search products, brands and categories..."
                className="flex-1 bg-transparent px-5 py-2.5 text-sm text-ink/80 placeholder-ink/35"
                value={desktopQuery}
                onChange={e => { setDesktopQuery(e.target.value); setDesktopOpen(true) }}
                onFocus={() => setDesktopOpen(true)}
                onKeyDown={e => { if (e.key === 'Enter') commitSearch(desktopQuery); if (e.key === 'Escape') setDesktopOpen(false) }}
                autoComplete="off" />
              {desktopQuery && (
                <button onClick={() => { setDesktopQuery(''); setDesktopOpen(false) }} className="px-2 text-ink/40 hover:text-ink transition bg-white">
                  <FiX size={15} />
                </button>
              )}
              <button onClick={() => commitSearch(desktopQuery)} className="flex items-center gap-2 bg-ink px-5 text-sm font-medium text-cream transition-colors hover:bg-ink/90">
                <FiSearch size={16} /><span>Search</span>
              </button>
            </div>
            {desktopOpen && <SearchDropdown query={desktopQuery} onSelect={handleSelect} />}
          </div>

          {/* Right actions */}
          <div className="ml-auto md:ml-0 flex items-center gap-1 md:gap-2">
            <div className="relative" ref={accountRef}>
              <button onClick={() => setAccountOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ink/5 transition text-ink/70">
                <div className="relative w-8 h-8 rounded-full bg-[#0E0E10]/10 flex items-center justify-center shrink-0">
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                    : initials ? <span className="text-xs font-bold text-[#0E0E10]">{initials}</span>
                    : <FiUser size={20} className="text-[#0E0E10]" />}
                  {isSeller && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />}
                </div>
                <span className="hidden md:inline text-sm font-medium max-w-[90px] truncate">{displayName}</span>
              </button>

              <div className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-lift border border-ink/10 transition-all duration-200 origin-top-right z-[200] ${accountOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-ink/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0E0E10]/10 flex items-center justify-center shrink-0">
                          {user.photoURL
                            ? <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                            : <span className="text-sm font-bold text-[#0E0E10]">{initials}</span>}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm text-ink truncate">{displayName}</p>
                          <p className="text-xs text-ink/40 truncate">{user.email}</p>
                          {isSeller && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                              <FaStore size={8} /> Verified Seller
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button onClick={() => goTo('/seller/application-status')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink/70 hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                        <FiClock size={15} className="text-ink/40 group-hover:text-blue-600" />
                        <span className="flex-1 text-left">Seller Status</span>
                        <FiChevronRight size={13} className="ml-auto text-ink/25 group-hover:text-blue-600" />
                      </button>
                      {isSeller && !sellerMode && (
                        <button onClick={handleEnterSellerMode}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink/70 hover:bg-green-50 hover:text-green-600 transition-colors group">
                          <FaStore size={15} className="text-ink/40 group-hover:text-green-600" />
                          <span className="flex-1 text-left">Switch to Seller</span>
                          <FiChevronRight size={13} className="ml-auto text-ink/25 group-hover:text-green-600" />
                        </button>
                      )}
                      {[
                        { icon: <FiUser size={15} />, label: 'My Profile', to: '/profile' },
                        { icon: <FiBox size={15} />, label: 'My Orders', to: '/orders' },
                        { icon: <FiHeart size={15} />, label: 'Wishlist', to: '/wishlist' },
                        { icon: <FiSettings size={15} />, label: 'Settings', to: '/settings' },
                      ].map(({ icon, label, to }) => (
                        <button key={label} onClick={() => goTo(to)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink/70 hover:bg-ink/5 hover:text-[#0E0E10] transition-colors group">
                          <span className="text-ink/40 group-hover:text-[#0E0E10] transition-colors">{icon}</span>
                          {label}
                          <FiChevronRight size={13} className="ml-auto text-ink/25 group-hover:text-[#0E0E10] transition-colors" />
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-ink/10">
                      <button onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200">
                        <FiLogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-ink/40 text-center mb-3 font-medium uppercase tracking-wide">Your Account</p>
                    <button onClick={() => goTo('/login')}
                      className="w-full flex items-center justify-center gap-2 bg-[#0E0E10] hover:bg-[#2A2A2A] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      <FiLogIn size={15} /> Sign In
                    </button>
                    <button onClick={() => goTo('/register')}
                      className="w-full border border-[#0E0E10] text-[#0E0E10] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0E0E10]/5 transition-colors">
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => router.push('/cart')}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-ink/5 transition text-ink/70 group">
              <FiShoppingCart size={22} className="group-hover:text-[#0E0E10] transition-colors" />
              <span className="hidden md:inline text-sm font-medium group-hover:text-[#0E0E10] transition-colors">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative" ref={mobileSearchRef}>
            <div className={`flex overflow-hidden rounded-full border transition-all duration-200 ${mobileDropOpen ? 'border-ink/40 shadow-[0_0_0_3px_rgba(14,14,16,0.06)]' : 'border-ink/10'}`}>
              <input type="text" placeholder="Search products, categories..."
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white placeholder-gray-400"
                value={mobileQuery}
                onChange={e => { setMobileQuery(e.target.value); setMobileDropOpen(true) }}
                onFocus={() => setMobileDropOpen(true)}
                onKeyDown={e => { if (e.key === 'Enter') commitSearch(mobileQuery); if (e.key === 'Escape') setMobileDropOpen(false) }}
                autoComplete="off" />
              {mobileQuery && (
                <button onClick={() => { setMobileQuery(''); setMobileDropOpen(false) }} className="px-2 bg-white text-ink/40"><FiX size={15} /></button>
              )}
              <button onClick={() => commitSearch(mobileQuery)} className="flex items-center bg-ink px-4 text-white">
                <FiSearch size={17} />
              </button>
            </div>
            {mobileDropOpen && <SearchDropdown query={mobileQuery} onSelect={handleSelect} />}
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-[60] flex transition-all duration-300 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`relative flex flex-col bg-white w-[320px] h-full shadow-lift transform transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#0E0E10]">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
                    {user.photoURL
                      ? <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                      : <span className="text-sm font-bold text-white">{initials}</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm leading-tight">{displayName}</p>
                      {isSeller && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                          <FaStore size={7} /> Seller
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs truncate max-w-[160px]">{user.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><FiUser size={20} className="text-white" /></div>
                  <div>
                    <p className="text-white font-semibold text-sm">Hello, Guest</p>
                    <p className="text-white/60 text-xs">Sign in for the best experience</p>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-white">
              <FiX size={18} />
            </button>
          </div>

          {!user && (
            <div className="px-4 py-3 flex gap-2 border-b border-ink/10">
              <button onClick={() => goTo('/login')} className="flex-1 bg-[#0E0E10] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2A2A2A] transition">Sign In</button>
              <button onClick={() => goTo('/register')} className="flex-1 border border-[#0E0E10] text-[#0E0E10] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0E0E10]/5 transition">Register</button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {user && (
              <div className="px-4 py-3 border-b border-ink/10">
                <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2 px-1">My Account</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <FiBox size={18} />, label: 'Orders', to: '/orders' },
                    { icon: <FiHeart size={18} />, label: 'Wishlist', to: '/wishlist' },
                    { icon: <FiUser size={18} />, label: 'Profile', to: '/profile' },
                  ].map(({ icon, label, to }) => (
                    <button key={label} onClick={() => goTo(to)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-sand hover:bg-[#0E0E10]/5 hover:text-[#0E0E10] transition text-ink/60 text-xs font-medium">
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2 px-1">Shop by Category</p>
              <div className="space-y-0.5">
                {categories.map(({ name, icon, to, color }) => (
                  <button key={name} onClick={() => goTo(to)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ink/5 transition group text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
                    <span className="text-sm font-medium text-ink/70 group-hover:text-[#0E0E10] transition-colors flex-1">{name}</span>
                    <FiChevronRight size={14} className="text-ink/25 group-hover:text-[#0E0E10] transition-colors" />
                  </button>
                ))}
                <button onClick={() => setMoreOpen(o => !o)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ink/5 transition group text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-sand text-ink/50"><MdStorefront size={18} /></div>
                  <span className="text-sm font-medium text-ink/70 group-hover:text-[#0E0E10] transition-colors flex-1">More Categories</span>
                  <FiChevronDown size={14} className={`text-ink/25 group-hover:text-[#0E0E10] transition-all duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="ml-3 pl-3 border-l-2 border-ink/10 space-y-0.5">
                    {moreCategories.map(({ name, icon, to, color }) => (
                      <button key={name} onClick={() => goTo(to)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ink/5 transition group text-left">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
                        <span className="text-sm font-medium text-ink/60 group-hover:text-[#0E0E10] transition-colors flex-1">{name}</span>
                        <FiChevronRight size={13} className="text-ink/25 group-hover:text-[#0E0E10] transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-ink/10">
              <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2 px-1">Services & Logistics</p>
              <div className="space-y-0.5">
                <button onClick={() => goTo('/services')} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ink/5 transition group text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-orange-100 text-orange-600"><FaConciergeBell size={16} /></div>
                  <span className="text-sm font-medium text-ink/70 group-hover:text-[#0E0E10] transition-colors flex-1">Campus Services</span>
                  <FiChevronRight size={14} className="text-ink/25 group-hover:text-[#0E0E10] transition-colors" />
                </button>
                <button onClick={() => goTo('/logistics')} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ink/5 transition group text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-green-100 text-green-600"><MdOutlineDeliveryDining size={20} /></div>
                  <span className="text-sm font-medium text-ink/70 group-hover:text-[#0E0E10] transition-colors flex-1">Logistics & Delivery</span>
                  <FiChevronRight size={14} className="text-ink/25 group-hover:text-[#0E0E10] transition-colors" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-ink/10 mt-1">
              <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2 px-1">More</p>
              {[
                { label: 'Flash Sales', to: '/flash-sales' },
                ...(isSeller && !sellerMode ? [{ label: 'Switch to Seller', action: handleEnterSellerMode }] : []),
                ...(isSeller ? [] : [{ label: 'Become a Seller', to: '/become-seller' }]),
                { label: 'Help Center', to: '/help' },
              ].map(({ label, to, action }: any) => (
                <button key={label} onClick={() => action ? action() : goTo(to)}
                  className="w-full text-left px-3 py-2.5 text-sm text-ink/60 hover:text-[#0E0E10] hover:bg-ink/5 rounded-xl transition">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <div className="px-4 py-4 border-t border-ink/10 bg-sand/50">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200">
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
