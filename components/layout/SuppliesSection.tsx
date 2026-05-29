"use client";
import Link from "next/link";
// src/components/home/SuppliesSection.jsx
import { useEffect, useState } from "react";
import Image from "next/image";

const categories = [
  {
    id: 1,
    name: "Groceries & Snacks",
    route: "/groceries",
    image:
      "https://plus.unsplash.com/premium_photo-1661380663916-b47a2b62ed0b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z3JvY2VyeSUyMHN0b3JlfGVufDB8fDB8fHww",
  },
  {
    id: 2,
    name: "Perishable Items",
    route: "/perishable",
    image:
      "https://images.unsplash.com/photo-1699581913577-cc877cdae36b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGVyaXNoYWJsZSUyMGl0ZW1zfGVufDB8fDB8fHww",
  },
  {
    id: 3,
    name: "Beauty & Cosmetics",
    route: "/beauty-deals",
    image:
      "https://images.unsplash.com/photo-1586359526010-3b87482012ef?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXR5JTIwYW5kJTIwY29zbWV0aWNzfGVufDB8fDB8fHww",
  },
  {
    id: 4,
    name: "Personal Care",
    route: "/personal-care",
    image:
      "https://plus.unsplash.com/premium_photo-1679049601788-357a729a2e78?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29uYWwlMjBjYXJlfGVufDB8fDB8fHww",
  },
  {
    id: 5,
    name: "Cleaning & Hygiene",
    route: "/cleaning-hygiene",
    image:
      "https://plus.unsplash.com/premium_photo-1765302374657-1cbd4af23327?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2xlYW5pbmclMjBhbmQlMjBoeWdpZW5lfGVufDB8fDB8fHww",
  },
  {
    id: 6,
    name: "Men & Women Fashion",
    route: "/fashion-deals",
    image:
      "https://images.unsplash.com/photo-1635650805023-f2529440b5aa?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1lbiUyMGFuZCUyMHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
  },
];

const SuppliesSection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full mt-5 py-10 bg-linear-to-br from-gray-900 via-black to-gray-800">
      {/* HEADER */}
      <div className="flex justify-center items-center px-4 md:px-10 mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white">
          Premium Supplies
        </h2>
      </div>

      {/* GRID */}
      <div className="px-4 md:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 md:gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 md:h-64 bg-gray-700 rounded-2xl animate-pulse"
              />
            ))
          : categories.map((category) => (
              <Link
                key={category.id}
                href={category.route}
                className="relative group rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.03] transition duration-500 cursor-pointer block"
              >
                {/* IMAGE */}
                <Image
                  src={category.image}
                  alt={category.name}
                  className="w-full h-44 md:h-64 object-cover group-hover:scale-110 transition duration-700"
                  width={300}
                  height={256}
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

                {/* CATEGORY TEXT */}
                <div className="absolute bottom-0 p-4 md:p-6 w-full">
                  <h3 className="text-sm md:text-lg font-bold text-white">
                    {category.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 mt-1">
                    Explore top deals →
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default SuppliesSection;