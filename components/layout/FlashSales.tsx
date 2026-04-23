'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from "react";
import { products } from "@/data/products";
import { FaFire } from "react-icons/fa";
import { FiZap, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
const promoCategories = [
  {
    id: 1,
    title: "Phones & Tablets",
    discount: 25,
    image:
      "https://plus.unsplash.com/premium_photo-1661629397204-9e4b46f94301?w=1000&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "Appliances",
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1171&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "TV & Audio",
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1646861039459-fd9e3aabf3fb?w=1000&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    title: "Beauty Deals",
    discount: 60,
    image:
      "https://plus.unsplash.com/premium_photo-1684407616442-8d5a1b7c978e?w=1000&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    title: "Home & Office",
    discount: 40,
    image:
      "https://images.unsplash.com/photo-1626065830935-a854cc9d6bf9?w=1000&auto=format&fit=crop&q=60",
  },
  {
    id: 6,
    title: "Fashion",
    discount: 70,
    image:
      "https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?w=1000&auto=format&fit=crop&q=60",
  },
  {
    id: 7,
    title: "Computing",
    discount: 10,
    image:
      "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=1000&auto=format&fit=crop&q=60",
  },
  {
    id: 8,
    title: "Gaming",
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=1000&auto=format&fit=crop&q=60",
  },
];

const FlashSales = () => {
  const router = useRouter()
  const navigate = (p: string) => router.push(p)
  const [timeLeft, setTimeLeft] = useState(36000);
  const scrollRef = useRef(null);

  // Get ALL flash sales products
  const flashProducts = products.filter(
    (product) => product.category === "flash-sales",
  );

  // Limit to ONLY 4 for homepage
  const limitedFlashProducts = flashProducts.slice(0, 4);

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = 0;

    const autoScroll = setInterval(() => {
      scrollAmount += 250;

      if (scrollAmount >= container.scrollWidth - container.clientWidth) {
        scrollAmount = 0;
      }

      container.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }, 4000);

    return () => clearInterval(autoScroll);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="w-full md:mt-0  bg-[#F5F6F7]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#7f0d0f 0%,#B42225 50%,#d63a1a 100%)",
        }}
      >
        {/* Background dot texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle,#FF8C00,transparent 65%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Icon badge */}
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FaFire size={16} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              Flash Sales
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <FiZap size={10} className="text-yellow-300" />
              <span className="text-xs font-bold text-white/70">Ends in:</span>
              <span className="text-xs font-black text-yellow-300 tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/flash-sales")}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </button>
      </div>

      {/* PRODUCTS */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {limitedFlashProducts.map((product) => {
          const discount = Math.round(
            ((product.oldPrice - product.price) / product.oldPrice) * 100,
          );

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="min-w-45 md:min-w-60 snap-start bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer"
            >
              <div className="relative h-40 md:h-52 overflow-hidden rounded-t-xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#d60404] text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{discount}%
                </div>
              </div>

              <div className="p-4">
                <p className="font-semibold truncate">{product.name}</p>

                <div className="mt-2">
                  <span className="text-[#B42225] font-bold text-lg">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 line-through ml-2 text-sm">
                    ₦{product.oldPrice.toLocaleString()}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-[#B42225] h-2 rounded-full"
                      style={{ width: `${product.stock}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {product.stock}% remaining
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSales;
