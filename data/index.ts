import type { Product, FlashProduct, Testimonial, Category } from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: 1,
    category: "phones",
    brand: "Apple",
    name: "iPhone 15 Pro Max",
    price: 1100000,
    oldPrice: 1400000,
    rating: 4.9,
    reviews: 328,
    image:
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400&auto=format&fit=crop&q=80",
    alt: "Apple iPhone 15 Pro Max",
  },
  {
    id: 2,
    category: "electronics",
    brand: "Sony",
    name: "WH-1000XM5 Headphones",
    price: 185000,
    oldPrice: 298000,
    rating: 4.8,
    reviews: 512,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80",
    alt: "Sony WH-1000XM5",
  },
  {
    id: 3,
    category: "computing",
    brand: "Apple",
    name: "MacBook Air M3",
    price: 1350000,
    oldPrice: 1600000,
    rating: 4.9,
    reviews: 184,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
    alt: "MacBook Air M3",
  },
  {
    id: 4,
    category: "fashion",
    brand: "Nike",
    name: "Air Jordan 1 Retro High",
    price: 95000,
    oldPrice: 130000,
    rating: 4.7,
    reviews: 891,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
    alt: "Air Jordan 1",
  },
  {
    id: 5,
    category: "electronics",
    brand: "Samsung",
    name: '65" QLED 4K Smart TV',
    price: 620000,
    oldPrice: 820000,
    rating: 4.8,
    reviews: 267,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
    alt: "Samsung QLED TV",
  },
  {
    id: 6,
    category: "computing",
    brand: "Dell",
    name: "XPS 15 Laptop i9",
    price: 1450000,
    oldPrice: null,
    rating: 4.7,
    reviews: 143,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80",
    alt: "Dell XPS 15",
  },
  {
    id: 7,
    category: "phones",
    brand: "Samsung",
    name: "Galaxy Z Fold 5",
    price: 980000,
    oldPrice: 1200000,
    rating: 4.6,
    reviews: 209,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80",
    alt: "Galaxy Z Fold 5",
  },
  {
    id: 8,
    category: "fashion",
    brand: "Zara",
    name: "Premium Linen Shirt",
    price: 28000,
    oldPrice: 45000,
    rating: 4.5,
    reviews: 432,
    image:
      "https://images.unsplash.com/photo-1751522937993-46b83342398b?w=400&auto=format&fit=crop&q=80",
    alt: "Zara Linen Shirt",
  },
];

export const FLASH_PRODUCTS: FlashProduct[] = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra",
    price: 620000,
    oldPrice: 1127273,
    discount: 45,
    sold: 72,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80",
    alt: "Samsung Galaxy S24 Ultra",
  },
  {
    id: 2,
    name: "Sony WH-1000XM5",
    price: 185000,
    oldPrice: 298387,
    discount: 38,
    sold: 58,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80",
    alt: "Sony WH-1000XM5 headphones",
  },
  {
    id: 3,
    name: "Dyson V15 Vacuum",
    price: 265000,
    oldPrice: 552083,
    discount: 52,
    sold: 85,
    image:
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&auto=format&fit=crop&q=80",
    alt: "Dyson V15 vacuum cleaner",
  },
  {
    id: 4,
    name: "Anker PowerCore 26800",
    price: 18000,
    oldPrice: 45000,
    discount: 60,
    sold: 91,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&auto=format&fit=crop&q=80",
    alt: "Anker PowerCore portable charger",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Chukwuemeka Nwosu",
    role: "200L Computer Science, FUTO",
    text: "JOVO changed how I shop on campus. Got my laptop delivered in 25 minutes — insane! The seller was super professional and the price was way better than Jumia.",
    initial: "C",
    avatarColor: "#ff8c00",
  },
  {
    id: 2,
    name: "Adaeze Okafor",
    role: "Verified Seller, 300L Engineering",
    text: "I've been selling on JOVO for 3 months and made over ₦400k already! The seller dashboard is smooth and payouts hit my account every week without fail.",
    initial: "A",
    avatarColor: "#b42225",
  },
  {
    id: 3,
    name: "Tunde Adeleke",
    role: "400L Medicine, UNILAG",
    text: "Flash sales are real on JOVO! Grabbed Airpods at 40% off — couldn't believe it. Everything is legit, no scams. The verification system gives real confidence.",
    initial: "T",
    avatarColor: "#3b82f6",
  },
  {
    id: 4,
    name: "Fatima Aliyu",
    role: "100L Law, ABU Zaria",
    text: "The campus service section helped me find an amazing photographer for my birthday shoot. So affordable and talented. JOVO is really building something special here.",
    initial: "F",
    avatarColor: "#10b981",
  },
  {
    id: 5,
    name: "Oluwaseun Balogun",
    role: "500L Architecture, OAU",
    text: "I ordered groceries and a new charger at the same time — both arrived together in under 30 minutes. JOVO logistics is honestly next level for a campus marketplace.",
    initial: "O",
    avatarColor: "#8b5cf6",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Phones & Tablets",
    href: "/phone-deals",
    count: "12,400+ items",
    image:
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=600&auto=format&fit=crop&q=80",
    alt: "Phones and Tablets",
    icon: "mobile-screen",
    color: "#ff8c00",
    large: true,
  },
  {
    id: 2,
    name: "Electronics",
    href: "/electronic-deals",
    count: "8,200+ items",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
    alt: "Electronics",
    icon: "tv",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "Health & Beauty",
    href: "/beauty-deals",
    count: "6,500+ items",
    image:
      "https://plus.unsplash.com/premium_photo-1679134540232-c6e66ceee11c?w=400&auto=format&fit=crop&q=80",
    alt: "Health and Beauty",
    icon: "spa",
    color: "#ec4899",
  },
  {
    id: 4,
    name: "Fashion",
    href: "/fashion-deals",
    count: "9,100+ items",
    image:
      "https://images.unsplash.com/photo-1751522937993-46b83342398b?w=400&auto=format&fit=crop&q=80",
    alt: "Fashion",
    icon: "shirt",
    color: "#b42225",
  },
  {
    id: 5,
    name: "Computing",
    href: "/computing-deals",
    count: "4,300+ items",
    image:
      "https://images.unsplash.com/photo-1640955014216-75201056c829?w=400&auto=format&fit=crop&q=80",
    alt: "Computing",
    icon: "laptop",
    color: "#06b6d4",
  },
  {
    id: 6,
    name: "Gaming",
    href: "/gaming-deals",
    count: "3,800+ items",
    image:
      "https://images.unsplash.com/photo-1629429407756-4a7703614972?w=400&auto=format&fit=crop&q=80",
    alt: "Gaming",
    icon: "gamepad",
    color: "#10b981",
  },
];
