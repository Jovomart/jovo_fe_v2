'use client'
import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FiPackage, FiChevronRight, FiChevronDown,
  FiCheckCircle, FiTruck, FiClock, FiXCircle,
  FiShoppingBag, FiArrowLeft, FiMapPin, FiPhone,
  FiMail, FiCalendar, FiCopy, FiCheck,
} from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { useCart, SavedOrder } from '@/context/CartContext'
import { AuthContext } from '@/context/AuthContext'
import Footer from '@/components/layout/Footer'

const fmt = (n: number) => `₦${n.toLocaleString()}`

// ─────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SavedOrder['status'], { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  processing: { label: 'Processing',  color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: <FiClock size={14} />,      step: 1 },
  confirmed:  { label: 'Confirmed',   color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: <FiCheckCircle size={14} />, step: 2 },
  shipped:    { label: 'Shipped',     color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: <FiTruck size={14} />,      step: 3 },
  delivered:  { label: 'Delivered',   color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: <FiCheckCircle size={14} />, step: 4 },
  cancelled:  { label: 'Cancelled',   color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: <FiXCircle size={14} />,    step: 0 },
}

const TIMELINE = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered']

// ─────────────────────────────────────────────────────────────
// ORDER CARD
// ─────────────────────────────────────────────────────────────
function OrderCard({ order, defaultOpen }: { order: SavedOrder; defaultOpen?: boolean }) {
  const [open, setOpen]   = useState(defaultOpen ?? false)
  const [copied, setCopied] = useState(false)
  const cfg               = STATUS_CONFIG[order.status]

  const copyRef = () => {
    navigator.clipboard.writeText(order.reference).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.06)', animation: 'fadeUp 0.5s ease both' }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-gray-50/60 transition-colors"
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#FEF2F2,#FFF7ED)' }}
        >
          <FiPackage size={22} className="text-[#B42225]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-gray-900">{order.id}</p>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1"><FiCalendar size={11} /> {dateStr}</span>
            <span className="text-xs text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Total + chevron */}
        <div className="text-right shrink-0">
          <p className="text-base font-black text-[#B42225]">{fmt(order.total)}</p>
          <FiChevronDown size={16} className={`text-gray-400 mt-1 transition-transform duration-300 ${open ? 'rotate-180' : ''} ml-auto`} />
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ animation: 'slideDown 0.3s ease both' }}>
          <div className="border-t border-gray-100" />

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="px-5 md:px-6 py-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Order Progress</p>
              <div className="flex items-start gap-0">
                {TIMELINE.map((label, i) => {
                  const step = i + 1
                  const done = cfg.step >= step
                  const curr = cfg.step === step
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        {i > 0 && (
                          <div className={`flex-1 h-0.5 transition-all duration-700 ${done || cfg.step > step ? '' : 'bg-gray-200'}`}
                            style={done || cfg.step > step ? { background: 'linear-gradient(90deg,#B42225,#FF8C00)' } : {}} />
                        )}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-500 shrink-0"
                          style={
                            done   ? { background: 'linear-gradient(135deg,#B42225,#FF8C00)', borderColor: '#B42225', color: '#fff' } :
                                     { background: '#F9FAFB', borderColor: '#E5E7EB', color: '#9CA3AF' }
                          }
                        >
                          {done ? <FiCheck size={13} /> : step}
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className={`flex-1 h-0.5 ${cfg.step > step ? '' : 'bg-gray-200'}`}
                            style={cfg.step > step ? { background: 'linear-gradient(90deg,#B42225,#FF8C00)' } : {}} />
                        )}
                      </div>
                      <p className={`text-[10px] font-bold mt-2 text-center leading-tight ${done ? 'text-[#B42225]' : 'text-gray-400'}`}>
                        {label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-5 md:px-6 pb-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × {fmt(item.price)}</p>
                  </div>
                  <span className="text-sm font-black text-gray-900 shrink-0">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery + Breakdown */}
          <div className="grid sm:grid-cols-2 gap-4 px-5 md:px-6 py-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Address</p>
              <p className="text-sm font-bold text-gray-800">{order.deliveryInfo.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><FiPhone size={11} /> {order.deliveryInfo.phone}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><FiMail size={11} /> {order.deliveryInfo.email}</p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1"><FiMapPin size={11} className="mt-0.5 shrink-0" /> {order.deliveryInfo.address}, {order.deliveryInfo.city}, {order.deliveryInfo.state}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Payment Summary</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span className="font-bold text-gray-700">{fmt(order.subtotal)}</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>Delivery</span><span className="font-bold text-gray-700">{order.deliveryCost === 0 ? 'Free' : fmt(order.deliveryCost)}</span></div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-1.5 mt-1.5">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-[#B42225]">{fmt(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className="px-5 md:px-6 pb-5">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-500 flex-1 min-w-0">
                Ref: <span className="font-mono text-gray-700 font-bold truncate">{order.reference}</span>
              </p>
              <button onClick={copyRef}
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#B42225] hover:bg-[#B42225]/10 px-2.5 py-1.5 rounded-xl transition">
                {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center" style={{ animation: 'fadeUp 0.6s ease both' }}>
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg,#FEF2F2,#FFF7ED)', animation: 'floatBounce 3s ease-in-out infinite' }}
      >
        <FiShoppingBag size={52} className="text-[#B42225] opacity-60" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: "'Georgia',serif" }}>No orders yet</h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        When you place an order, it will appear here. Start shopping to find great deals!
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
        style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)', boxShadow: '0 8px 30px rgba(180,34,37,0.35)' }}
      >
        <FiShoppingBag size={16} /> Start Shopping
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN ORDERS PAGE
// ─────────────────────────────────────────────────────────────
export default function Orders() {
  const { orders } = useCart()
  const { user }   = useContext(AuthContext)
  const params     = useSearchParams()
  const newOrderId = params.get('ref')

  const [filter, setFilter] = useState<'all' | SavedOrder['status']>('all')

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center">
        <FiPackage size={48} className="text-gray-300" />
        <h2 className="text-xl font-black text-gray-700">Sign in to view your orders</h2>
        <Link href="/login?redirect=/orders"
          className="px-6 py-3 rounded-2xl font-black text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#B42225,#FF8C00)' }}>
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatBounce{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="min-h-screen" style={{ background: '#F7F8FC' }}>

        {/* Banner */}
        <div
          className="relative overflow-hidden py-8 md:py-11"
          style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#1c0202 45%,#B42225 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
            <Link href="/profile" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors">
              <FiArrowLeft size={14} /> Back to Profile
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Georgia',serif" }}>My Orders</h1>
            <p className="text-white/50 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">

          {/* New order success banner */}
          {newOrderId && (
            <div
              className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-green-200"
              style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', animation: 'fadeUp 0.5s ease both' }}
            >
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                <FiCheckCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-green-800">Order placed successfully! 🎉</p>
                <p className="text-xs text-green-600 mt-0.5">Your order <span className="font-mono font-bold">{newOrderId}</span> has been confirmed.</p>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <>
              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap mb-5">
                {(['all', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${filter === f
                      ? 'text-white shadow-md'
                      : 'text-gray-500 bg-white hover:bg-gray-100 border border-gray-200'}`}
                    style={filter === f ? { background: 'linear-gradient(135deg,#B42225,#FF8C00)' } : {}}
                  >
                    {f === 'all' ? `All (${orders.length})` : f}
                  </button>
                ))}
              </div>

              {/* Order list */}
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-16 font-medium">No orders with this status.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((order, i) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      defaultOpen={order.id === newOrderId && i === 0}
                    />
                  ))}
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