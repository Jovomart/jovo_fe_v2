'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { FiArrowRight, FiPhone } from "react-icons/fi";

const PhoneDeals = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const navigate = (p: string) => router.push(p)

  //  Limit to ONLY 4 phone products
  const phones = products.filter((p) => p.category === "phones").slice(0, 4);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full mt-0 bg-[#F8FAFC]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 50%, #023E8A 100%)",
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

        {/* Circuit line pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        {/* Glow orb */}
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle,#00f2fe,transparent 65%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Icon badge */}
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FiPhone size={16} className="text-cyan-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              Phone Deals
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-cyan-100">
                Latest smartphone offers
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/phone-deals")}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </button>
      </div>

      {/* GRID PRODUCTS */}
      <div className="px-4 md:px-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
            ))
          : phones.map((product) => {
              const discount = Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              );

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group overflow-hidden cursor-pointer border border-gray-100 hover:border-cyan-200"
                >
                  <div className="relative h-36 md:h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                      -{discount}%
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-cyan-400 text-[9px] px-2 py-1 rounded-full font-semibold">
                      🔥 HOT
                    </div>
                  </div>

                  <div className="p-3 md:p-4">
                    <p className="font-semibold truncate text-gray-800">{product.name}</p>
                    <div className="mt-2">
                      <span className="font-bold text-cyan-600 text-lg">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 line-through ml-2 text-sm">
                        ₦{product.oldPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-cyan-500">⚡ Free Shipping</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400">In Stock</span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default PhoneDeals;