"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { products } from "@/data/products";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

const TopSellers = () => {
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const router = useRouter();
  const navigate = (p: string) => router.push(p);

  //  Get top-sellers products (ONLY 4 for homepage)
  const topProducts = products
    .filter((p) => p.category === "top-sellers")
    .slice(0, 4);

  // Shimmer loading
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timeout);
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

  return (
    <div className="w-full bg-[#F5F6F7]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#f1c40f 100%)",
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
            background: "radial-gradient(circle,#FFD700,transparent 65%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Icon badge */}
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FaTrophy size={16} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              Top Sellers
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <FiStar size={10} className="text-yellow-300" />
              <span className="text-xs font-bold text-white/70">
                Best rated
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/top-sellers")}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </button>
      </div>
      {/* PRODUCTS */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-45 md:min-w-60 h-75 bg-white rounded-xl animate-pulse"
              />
            ))
          : topProducts.map((product) => {
              const discount = Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              );

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="min-w-45 md:min-w-60 snap-start bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-40 md:h-52 overflow-hidden rounded-t-xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={240}
                      height={208}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#FF8C00] text-white text-xs px-2 py-1 rounded-full font-bold">
                      -{discount}%
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-sm md:text-base truncate">
                      {product.name}
                    </p>

                    <div className="mt-2">
                      <span className="text-[#FF8C00] font-bold text-lg">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 line-through ml-2 text-sm">
                        ₦{product.oldPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-[#FF8C00] h-2 rounded-full"
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

export default TopSellers;
