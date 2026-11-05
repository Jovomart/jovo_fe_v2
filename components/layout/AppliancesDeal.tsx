'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from "react";
import { products } from "@/data/products";
import { FiArrowRight, FiHome, FiTool } from "react-icons/fi";

const AppliancesDeals = () => {
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const router = useRouter()
  const navigate = (p: string) => router.push(p)

  // Limit to ONLY 4 appliances for homepage
  const appliances = products
    .filter((p) => p.category === "appliances")
    .slice(0, 4);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = 0;

    const autoScroll = setInterval(() => {
      scrollAmount += 280;

      if (scrollAmount >= container.scrollWidth - container.clientWidth) {
        scrollAmount = 0;
      }

      container.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }, 4500);

    return () => clearInterval(autoScroll);
  }, []);

  return (
    <div className="w-full mt-5 bg-[#FBEFE3]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#e67e22 0%,#f39c12 50%,#ffb347 100%)",
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
            <FiTool size={16} className="text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-white tracking-tight leading-none">
              Appliances Deals
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-white/70">
                Save big on appliances
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/appliances-deals")}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </button>
      </div>

      {/* PRODUCTS */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 md:px-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-44 md:min-w-64 h-80 bg-sand rounded-xl animate-pulse"
              />
            ))
          : appliances.map((product) => {
              const discount = Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              );

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="min-w-44 md:min-w-64 snap-start bg-white rounded-xl shadow-soft hover:shadow-lift transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative h-44 md:h-56 overflow-hidden rounded-t-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#B42225] text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                      -{discount}%
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-sm md:text-base truncate">
                      {product.name}
                    </p>

                    <div className="mt-2">
                      <span className="text-ink font-bold text-lg">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-ink/40 line-through ml-2 text-sm">
                        ₦{product.oldPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default AppliancesDeals;
