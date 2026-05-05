'use client'
import { useState, useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiShoppingCart, FiTrash2, FiPlus, FiMinus,
  FiTag, FiChevronRight, FiShield, FiTruck,
  FiRefreshCw, FiX, FiCheck, FiAlertCircle,
  FiLock, FiZap, FiArrowLeft, FiPackage,
} from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { useCart } from '@/context/CartContext'
import { AuthContext } from '@/context/AuthContext'
import Footer from '@/components/layout/Footer'

// ─────────────────────────────────────────────────────────────
// DEMO PROMO CODES
// ─────────────────────────────────────────────────────────────
const PROMOS: Record<string, { pct: number; label: string }> = {
  JOVO10:  { pct: 0.10, label: '10% off your order' },
  WELCOME: { pct: 0.15, label: '15% welcome discount' },
  FUTO20:  { pct: 0.20, label: '20% FUTO student discount' },
}

const fmt = (n: number) => `₦${n.toLocaleString()}`

// ─────────────────────────────────────────────────────────────
// CART ITEM CARD
// ─────────────────────────────────────────────────────────────
function CartItemCard({
  item,
  index,
  onQty,
  onRemove,
}: {
  item: ReturnType<typeof useCart>['items'][number]
  index: number
  onQty: (id: number, qty: number) => void
  onRemove: (id: number) => void
}) {
  const [exiting, setExiting]     = useState(false)
  const [qtyAnim, setQtyAnim]     = useState<'up' | 'down' | null>(null)

  const discount = item.oldPrice
    ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
    : 0

  const handleRemove = () => {
    setExiting(true)
    setTimeout(() => onRemove(item.id), 340)
  }

  const handleQty = (dir: 'up' | 'down') => {
    setQtyAnim(dir)
    setTimeout(() => setQtyAnim(null), 280)
    onQty(item.id, dir === 'up' ? item.quantity + 1 : item.quantity - 1)
  }

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden"
      style={{
        boxShadow: '0 2px 20px rgba(0,0,0,0.055)',
        animation: exiting
          ? 'cartItemOut 0.34s cubic-bezier(.4,0,.6,1) forwards'
          : `cartItemIn 0.45s cubic-bezier(.34,1.06,.64,1) ${index * 70}ms both`,
      }}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Thumbnail */}
        <Link href={`/product/${item.id}`} className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {discount > 0 && (
            <span
              className="absolute -top-1.5 -left-1.5 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg,#B42225,#FF6B00)' }}
            >
              -{discount}%
            </span>
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {item.brand && (
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-bold text-[#B42225] uppercase tracking-wider">{item.brand}</span>
                  <MdVerified className="text-[#B42225]" size={10} />
                </div>
              )}
              <Link href={`/product/${item.id}`}>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug hover:text-[#B42225] transition-colors">
                  {item.name}
                </h3>
              </Link>
              <span className="inline-block mt-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                {item.category}
              </span>
            </div>

            <button
              onClick={handleRemove}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-gray-300
                         hover:text-red-500 hover:bg-red-50 transition-all duration-200
                         opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Remove item"
            >
              <FiTrash2 size={14} />
            </button>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2 mt-auto flex-wrap">
            <span className="text-base font-black text-gray-900">{fmt(item.price)}</span>
            {item.oldPrice && (
              <span className="text-xs text-gray-400 line-through">{fmt(item.oldPrice)}</span>
            )}
          </div>

          {/* Qty + line total */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Stepper */}
            <div className="flex items-center rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
              <button
                onClick={() => handleQty('down')}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                {item.quantity === 1 ? <FiTrash2 size={12} /> : <FiMinus size={12} />}
              </button>
              <span
                className="w-9 text-center text-sm font-black text-gray-800 select-none transition-all duration-200"
                style={{
                  transform: qtyAnim === 'up' ? 'scale(1.35)' : qtyAnim === 'down' ? 'scale(0.75)' : 'scale(1)',
                  color: qtyAnim ? '#B42225' : undefined,
                  display: 'inline-block',
                }}
              >
                {item.quantity}
              </span>
              <button
                onClick={() => handleQty('up')}
                disabled={item.quantity >= item.stock}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiPlus size={12} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Line total: <span className="text-[#B42225] font-bold">{fmt(item.price * item.quantity)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hover accent bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
        style={{ background: 'linear-gradient(90deg,#B42225,#FF8C00)' }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center col-span-full"
      style={{ animation: 'fadeUp 0.6s ease both' }}
    >
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg,#FEF2F2,#FFF7ED)',
          animation: 'floatBounce 3s ease-in-out infinite',
        }}
      >
        <FiShoppingCart size={52} className="text-[#B42225] opacity-60" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: "'Georgia', serif" }}>
        Your cart is empty
      </h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        Looks like you haven't added anything yet. Explore thousands of deals waiting for you.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-sm
                   transition-all hover:scale-105 active:scale-95 shadow-xl"
        style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 8px 30px rgba(180,34,37,0.35)' }}
      >
        <FiZap size={16} /> Shop Now
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AUTH PROMPT MODAL
// ─────────────────────────────────────────────────────────────
function AuthPrompt({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeUp 0.3s ease both' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-8 text-center relative"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.25)', animation: 'scaleIn 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
          <FiX size={16} />
        </button>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}
        >
          <FiLock size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>Sign in to continue</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Create an account or sign in to securely complete your purchase on Jovo.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/login?redirect=/checkout')}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 8px 24px rgba(180,34,37,0.35)' }}
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/register?redirect=/checkout')}
            className="w-full py-3.5 rounded-2xl font-black text-[#B42225] text-sm border-2 border-[#B42225] hover:bg-[#B42225] hover:text-white transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN CART PAGE
// ─────────────────────────────────────────────────────────────
export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, itemCount } = useCart()
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [promoInput, setPromoInput]   = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; pct: number; label: string } | null>(null)
  const [promoError, setPromoError]   = useState('')
  const [promoOk, setPromoOk]         = useState(false)
  const [showClear, setShowClear]     = useState(false)
  const [showAuth, setShowAuth]       = useState(false)

  const discount    = appliedPromo ? subtotal * appliedPromo.pct : 0
  const orderTotal  = subtotal - discount
  const savings     = (items.reduce((s, i) => s + (i.oldPrice ?? i.price) * i.quantity, 0)) - subtotal + discount

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Please enter a promo code'); return }
    const promo = PROMOS[code]
    if (!promo) { setPromoError('Invalid or expired promo code'); return }
    setAppliedPromo({ code, ...promo })
    setPromoError('')
    setPromoOk(true)
    setTimeout(() => setPromoOk(false), 3000)
  }

  const removePromo = () => { setAppliedPromo(null); setPromoInput(''); setPromoError('') }

  const handleCheckout = () => {
    if (!user) { setShowAuth(true); return }
    if (appliedPromo) sessionStorage.setItem('jovo_promo', JSON.stringify(appliedPromo))
    else sessionStorage.removeItem('jovo_promo')
    router.push('/cart/checkout')
  }

  return (
    <>
      <style>{`
        @keyframes cartItemIn  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cartItemOut { to{opacity:0;transform:translateX(30px) scale(.96);max-height:0;padding:0;margin:0} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes scaleIn     { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        @keyframes badgePop    {
          0%{transform:scale(0) rotate(-20deg);opacity:0}
          60%{transform:scale(1.25) rotate(5deg);opacity:1}
          100%{transform:scale(1) rotate(0);opacity:1}
        }
      `}</style>

      {showAuth && <AuthPrompt onClose={() => setShowAuth(false)} />}

      <div className="min-h-screen" style={{ background: '#F7F8FC' }}>

        {/* ── TOP BANNER ── */}
        <div
          className="relative overflow-hidden py-8 md:py-11"
          style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#1c0202 45%,#B42225 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#FF8C00,transparent 65%)' }} />

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors">
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Georgia',serif" }}>
                  My Cart
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} ready for checkout` : 'Your cart is waiting to be filled'}
                </p>
              </div>
              {itemCount > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white"
                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                  >
                    <FiShoppingCart size={16} />
                    {fmt(subtotal)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {itemCount === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

              {/* ── LEFT: ITEMS ── */}
              <div className="flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-gray-800">
                    Cart Items <span className="text-gray-400 font-semibold">({itemCount})</span>
                  </h2>
                  <button
                    onClick={() => setShowClear(true)}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <FiTrash2 size={12} /> Clear all
                  </button>
                </div>

                {/* Clear confirm */}
                {showClear && (
                  <div
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-100"
                    style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)', animation: 'fadeUp 0.3s ease both' }}
                  >
                    <FiAlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm text-gray-700 flex-1 font-medium">Remove all items from your cart?</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setShowClear(false)} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition">Cancel</button>
                      <button onClick={() => { clearCart(); setShowClear(false) }}
                        className="text-xs font-bold text-white px-3 py-1.5 rounded-xl transition"
                        style={{ background: 'linear-gradient(135deg,#B42225,#FF6B00)' }}>
                        Clear Cart
                      </button>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="flex flex-col gap-3">
                  {items.map((item, i) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      index={i}
                      onQty={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>

                {/* Savings banner */}
                {savings > 0 && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', animation: 'fadeUp 0.5s ease both' }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                      <FiCheck size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-green-800">You're saving {fmt(savings)}!</p>
                      <p className="text-xs text-green-600 mt-0.5">Combined discounts from deals and promo codes.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: SUMMARY ── */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-24">

                {/* Promo code */}
                <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <FiTag size={16} className="text-[#B42225]" />
                    <h3 className="text-sm font-black text-gray-800">Promo Code</h3>
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-2xl border border-green-200" style={{ animation: 'scaleIn 0.3s ease both' }}>
                      <FiCheck size={16} className="text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-green-800">{appliedPromo.code}</p>
                        <p className="text-xs text-green-600">{appliedPromo.label}</p>
                      </div>
                      <button onClick={removePromo} className="shrink-0 w-6 h-6 rounded-full bg-green-200 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition text-green-700">
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code..."
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value); setPromoError('') }}
                        onKeyDown={e => e.key === 'Enter' && applyPromo()}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#B42225] focus:ring-2 focus:ring-[#B42225]/15 transition bg-gray-50 font-medium"
                      />
                      <button
                        onClick={applyPromo}
                        className="px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.03] active:scale-95 shrink-0"
                        style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-red-500 mt-2 font-medium">{promoError}</p>}
                  {promoOk   && <p className="text-xs text-green-600 mt-2 font-black">✓ Promo applied!</p>}
                </div>

                {/* Order summary */}
                <div className="bg-white rounded-3xl p-6" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.06)' }}>
                  <h3 className="text-base font-black text-gray-900 mb-5" style={{ fontFamily: "'Georgia',serif" }}>
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                      <span className="font-bold text-gray-800">{fmt(subtotal)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <FiTag size={12} /> {appliedPromo.code}
                        </span>
                        <span className="font-bold text-green-600">-{fmt(discount)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <FiTruck size={13} /> Delivery fee
                      </span>
                      <span className="text-gray-400 font-medium text-xs">Calculated at checkout</span>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between">
                      <span className="font-black text-gray-900">Estimated Total</span>
                      <span className="text-xl font-black text-[#B42225]">{fmt(orderTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-2xl"
                    style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 8px 30px rgba(180,34,37,0.4)' }}
                  >
                    <FiLock size={15} />
                    Proceed to Checkout
                    <FiChevronRight size={15} />
                  </button>

                  <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <FiShield size={11} /> Secured with SSL encryption
                  </p>
                </div>

                {/* Trust badges */}
                <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.06)' }}>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <FiShield size={18} className="text-green-500" />, label: 'Secure', sub: 'SSL protected' },
                      { icon: <FiTruck size={18} className="text-blue-500" />, label: 'Fast', sub: 'Quick delivery' },
                      { icon: <FiRefreshCw size={18} className="text-purple-500" />, label: 'Returns', sub: '7-day policy' },
                    ].map(({ icon, label, sub }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 text-center">
                        {icon}
                        <p className="text-[11px] font-black text-gray-700">{label}</p>
                        <p className="text-[10px] text-gray-400">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}