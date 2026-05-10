export interface Product {
  id: number
  tab: 'phones' | 'electronics' | 'computing' | 'fashion'
  brand: string
  name: string
  price: number
  oldPrice: number | null
  rating: number
  reviews: number
  image: string
  alt: string
}

export interface FlashProduct {
  id: number
  name: string
  price: number
  oldPrice: number
  discount: number
  sold: number
  image: string
  alt: string
}

export interface Testimonial {
  id: number
  name: string
  role: string
  text: string
  initial: string
  avatarColor: string
}

export interface Category {
  id: number
  name: string
  href: string
  count: string
  image: string
  alt: string
  icon: string
  color: string
  large?: boolean
}
