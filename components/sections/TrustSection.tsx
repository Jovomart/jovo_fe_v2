'use client'
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved, faTruckFast, faRotateLeft, faLock } from '@fortawesome/free-solid-svg-icons'

const items = [
  { icon: faShieldHalved, title: 'Verified Sellers', desc: 'Every seller on JOVO is ID-verified and campus-authenticated for your safety.' },
  { icon: faTruckFast, title: 'Express Delivery', desc: 'Get your orders delivered anywhere on campus in under 30 minutes.' },
  { icon: faRotateLeft, title: 'Easy Returns', desc: 'Not satisfied? Return within 7 days, no questions asked.' },
  { icon: faLock, title: 'Secure Payments', desc: 'Pay securely online or opt for pay-on-delivery — your choice.' },
]

export default function TrustSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const totalItems = items.length

  // Auto-slide functionality
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems)
      }, 4000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered, totalItems])

  return (
    <section className="bg-white border-t border-b border-gray-100" aria-label="Why trust JOVO">
      
      {/* Desktop View (lg and above) - Grid layout */}
      <div className="hidden lg:block max-w-[1400px] mx-auto">
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {items.map(({ icon, title, desc }) => (
            <article 
              key={title} 
              className="bg-white hover:bg-gray-50 transition-colors duration-300 p-6 flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-[14px] bg-brand-gradient text-white flex items-center justify-center text-[18px] flex-shrink-0">
                <FontAwesomeIcon icon={icon} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-extrabold text-gray-900 mb-[3px]">{title}</h3>
                <p className="text-[12px] text-gray-500 leading-[1.6]">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet View (below lg) - Auto Horizontal Slider */}
      <div 
        className="lg:hidden relative py-3 px-4 bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slider Container */}
        <div className="overflow-hidden max-w-[320px] mx-auto">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map(({ icon, title, desc }) => (
              <article 
                key={title} 
                className="w-full flex-shrink-0 px-3"
              >
                <div className="bg-white rounded-2xl p-1 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-gradient text-white flex items-center justify-center text-[24px] mb-5">
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <h3 className="text-[18px] font-extrabold text-gray-900 mb-3">{title}</h3>
                    <p className="text-[13px] text-gray-500 leading-[1.7] max-w-[260px] mx-auto">{desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Dot Indicators - Clean & Simple */}
        <div className="flex justify-center gap-2 mt-5">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'w-6 bg-brand-red' 
                  : 'w-1.5 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}