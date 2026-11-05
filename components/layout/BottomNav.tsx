'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useContext } from 'react'
import { FiHome, FiBookOpen, FiHelpCircle, FiRadio } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { AuthContext } from '@/context/AuthContext'

const NAV_ITEMS_RIGHT = [
  { label: 'Guide', icon: FiBookOpen, path: '/campus-guide' },
  { label: 'Help', icon: FiHelpCircle, path: '/help' },
]

const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: any
  label: string
  path: string
  active: boolean
  onClick: () => void
  badge?: string | number
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
  >
    <div className="relative">
      <Icon size={21} className={`transition-all duration-200 ${active ? 'text-ink' : 'text-ink/45'}`} />
      {badge && (
        <span className="absolute -right-2.5 -top-2 min-w-4 rounded-full bg-ink px-1 py-0.5 text-center text-[9px] font-bold leading-none text-white">
          {badge}
        </span>
      )}
    </div>

    <span
      className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
        active ? 'text-ink' : 'text-ink/45'
      }`}
    >
      {label}
    </span>

    {active && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute -top-1 h-0.5 w-6 rounded-full bg-ink"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 24 }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
)

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="9" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
    <path
      d="M9 9V6.5C9 4.5 10.5 3 12.5 3h3C17.5 3 19 4.5 19 6.5V9"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
    />
    <line x1="11" y1="13" x2="11" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="12.5" x2="14" y2="19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="13" x2="17" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export default function BottomNavbar() {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const pathname = usePathname()
  const { sellerMode } = useContext(AuthContext)
  const isActive = (p: string) => pathname === p

  const NAV_ITEMS_LEFT = [
    { label: 'Home', icon: FiHome, path: sellerMode ? '/seller/dashboard' : '/' },
    { label: 'Deals', icon: FiRadio, path: '/deals' },
  ]

  const hiddenPaths = ['/login', '/register', '/forgot-password', '/verify-email']
  if (hiddenPaths.includes(pathname)) return null
  if (sellerMode) return null
  if (pathname?.startsWith('/seller') && pathname !== '/seller/dashboard') return null

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
        <div className="relative bg-cream/95 backdrop-blur-md">
          <div className="absolute left-0 top-0 h-px w-full bg-ink/[.06]" />

          <div className="relative flex items-center justify-between px-4 py-2">
            <div className="flex max-w-[45%] flex-1 justify-around">
              {NAV_ITEMS_LEFT.map(({ label, icon, path }) => (
                <NavItem
                  key={label}
                  icon={icon}
                  label={label}
                  path={path}
                  active={isActive(path)}
                  onClick={() => navigate(path)}
                />
              ))}
            </div>

            <div className="relative w-16">
              <div className="absolute left-1/2 -top-12 -translate-x-1/2">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={() => router.push('/cart')}
                  aria-label="Shopping cart"
                  className="relative flex h-14 w-14 origin-center items-center justify-center rounded-full bg-ink text-white shadow-pill"
                >
                  <div className="absolute inset-0 rounded-full border-2 border-white/25" />
                  <CartIcon />
                </motion.button>

                <div className="absolute left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold tracking-wider text-ink/60">
                  CART
                </div>
              </div>
            </div>

            <div className="flex max-w-[45%] flex-1 justify-around">
              {NAV_ITEMS_RIGHT.map(({ label, icon, path }) => (
                <NavItem
                  key={path}
                  icon={icon}
                  label={label}
                  path={path}
                  active={isActive(path)}
                  onClick={() => navigate(path)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[72px] md:hidden" />
    </>
  )
}
