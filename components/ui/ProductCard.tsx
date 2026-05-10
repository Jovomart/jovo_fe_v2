'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid, faBagShopping, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import type { Product } from '@/types'
import { showToast } from '@/components/ui/toast'
import { CART_EVENT } from '@/components/layout/Header'

let globalCartCount = 0

interface Props {
  product: Product
}

export default function ProductCard({ product: p }: Props) {
  const [wished, setWished] = useState(false)
  const [added, setAdded] = useState(false)

  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : null

  const toggleWishlist = () => {
    setWished((prev) => {
      const next = !prev
      showToast(next ? 'Added to wishlist ❤️' : 'Removed from wishlist', next ? 'success' : 'info')
      return next
    })
  }

  const addToCart = () => {
    setAdded(true)
    globalCartCount++
    window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: globalCartCount }))
    showToast('Added to cart 🛍️', 'success')
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article className="product-card w-[230px] flex-shrink-0 border border-gray-200 rounded-[20px] overflow-hidden bg-white hover:-translate-y-1 hover:shadow-brand-md transition-all duration-250 relative" role="listitem">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={p.image}
          alt={p.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="230px"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-extrabold px-2 py-[3px] rounded-full">-{discount}%</span>
        )}
        <button
          onClick={toggleWishlist}
          className={`product-wishlist absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/90 backdrop-blur-[8px] flex items-center justify-center text-[13px] transition-all hover:scale-110 opacity-0 ${wished ? '!opacity-100 text-brand-red' : 'text-gray-400 hover:text-brand-red'}`}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FontAwesomeIcon icon={wished ? faHeartSolid : faHeartRegular} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-[10px] font-bold text-brand-orange uppercase tracking-[.08em]">{p.brand}</p>
        <h3 className="text-[12.5px] font-bold text-gray-900 mt-[3px] mb-[6px] leading-[1.35]">
          <Link href={`/product/${p.id}`} className="hover:text-brand-red transition-colors">{p.name}</Link>
        </h3>
        <div className="flex items-center gap-1 mb-[7px]" aria-label={`${p.rating} stars, ${p.reviews} reviews`}>
          <span className="text-brand-orange text-[10.5px]" aria-hidden="true">{'★'.repeat(Math.floor(p.rating))}{p.rating % 1 >= 0.5 ? '☆' : ''}</span>
          <span className="text-[10px] text-gray-400">({p.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-1.5 mb-[10px] flex-wrap">
          <span className="text-[15px] font-extrabold text-brand-red">₦{p.price.toLocaleString()}</span>
          {p.oldPrice && <span className="text-[11px] text-gray-400"><del>₦{p.oldPrice.toLocaleString()}</del></span>}
        </div>
        <button
          onClick={addToCart}
          aria-label={`Add ${p.name} to cart`}
          className={`w-full flex items-center justify-center gap-[5px] py-[7.5px] rounded-[8px] text-[12px] font-bold transition-all font-body ${added ? '!bg-[#22c55e] !text-white' : 'bg-gray-100 text-gray-900 hover:bg-brand-gradient hover:text-white'}`}
          style={added ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' } : {}}
        >
          <FontAwesomeIcon icon={added ? faCheck : faBagShopping} />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
