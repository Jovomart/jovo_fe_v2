'use client'
import { useRouter } from 'next/navigation'
// src/components/home/AccommodationDeals.jsx
import { useState, useEffect } from "react";
import { accommodations } from "@/data/accommodation";

const AccommodationDeals = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const navigate = (p: string) => router.push(p)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full mt-5 py-10 bg-linear-to-br from-gray-900 via-black to-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 md:px-8 mb-10">
        <h2 className="text-xl md:text-4xl font-bold text-white">
          Accommodation Deals
        </h2>
        <button
          onClick={() => router.push("/accommodations")}
          className="text-xl md:text-3xl font-light text-[#B42225] hover:underline"
        >
          See All
        </button>
      </div>

      {/* GRID */}
      <div className="px-0 md:px-8 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 md:h-96 bg-gray-700 rounded-2xl animate-pulse" />
            ))
          : accommodations.slice(0, 4).map((place) => (
              <div
                key={place.id}
                className="relative group rounded-2xl overflow-hidden shadow-lift hover:scale-[1.02] transition duration-500 cursor-pointer"
                onClick={() => navigate(`/accommodation/${place.id}`)}
              >
                {/* IMAGE */}
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-72 md:h-96 object-cover group-hover:scale-110 transition duration-700"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

                {/* CONTENT */}
                <div className="absolute bottom-0 p-4 md:p-6 text-white w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white text-black text-xs px-2 py-1 rounded-full font-bold">
                      ⭐ {place.rating}
                    </span>
                    <span className="text-xs text-ink/25">({place.reviews} reviews)</span>
                  </div>
                  <h3 className="text-sm md:text-xl font-bold">{place.name}</h3>
                  <p className="text-xs md:text-sm text-ink/25 mt-1">📍 {place.location}</p>
                  <div className="mt-3 md:mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-lg md:text-2xl font-bold">₦{place.price.toLocaleString()}</span>
                      <span className="text-xs md:text-sm text-ink/25"> /year</span>
                    </div>
                    <button className="bg-yellow-400 text-black text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full font-semibold hover:bg-yellow-300 transition">
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default AccommodationDeals;