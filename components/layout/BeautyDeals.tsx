"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import Image from "next/image";

const BeautyAndCosmeticsDeals = () => {
  const [loading, setLoading] = useState(true);

  // Limit to ONLY 4 beauty products
  const beautyProducts = products
    .filter((product) => product.category === "beauty")
    .slice(0, 4);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full mt-5 bg-[#FDF6F9]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-4 mb-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a0010 0%, #4a0728 40%, #831843 70%, #db2777 100%)",
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
            background: "radial-gradient(circle,#f472b6,transparent 65%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Icon badge */}
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <FiHeart size={16} className="text-pink-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">
              Beauty & Cosmetics
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-white/70">
                Glow up with offers
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/beauty-deals"
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
        >
          See All <FiArrowRight size={12} />
        </Link>
      </div>

      {/* GRID PRODUCTS */}
      <div className="px-4 md:px-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
            ))
          : beautyProducts.map((product) => {
              const discount = Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100,
              );

              return (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="relative h-36 md:h-48 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      width={300}
                      height={192}
                    />

                    <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                      -{discount}%
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="p-3 md:p-4">
                    <p className="font-semibold text-sm md:text-base truncate text-gray-800">
                      {product.name}
                    </p>

                    <div className="mt-2">
                      <span className="text-pink-700 font-bold text-base md:text-lg">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 line-through ml-2 text-xs md:text-sm">
                        ₦{product.oldPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default BeautyAndCosmeticsDeals;
