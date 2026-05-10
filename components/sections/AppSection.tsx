import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMobileScreen, faBell, faLocationDot, faPercent } from '@fortawesome/free-solid-svg-icons'
import { faApple, faGooglePlay } from '@fortawesome/free-brands-svg-icons'

export default function AppSection() {
  return (
    <section className="py-[80px] px-6 bg-[#FFF8F5] border-t border-gray-200" aria-label="Download the JOVO app">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[56px] items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[.2em] text-brand-red bg-[rgba(180,34,37,.06)] border border-[rgba(180,34,37,.15)] px-[14px] py-[5px] rounded-full mb-[18px]">
            <FontAwesomeIcon icon={faMobileScreen} /> Mobile App
          </div>
          <h2 className="font-display text-[clamp(24px,3vw,40px)] font-black leading-[1.15] text-gray-900 mb-[14px]">
            Shop on the Go with the <em className="text-brand-red">JOVO App</em>
          </h2>
          <p className="text-[14.5px] text-gray-500 leading-[1.8] mb-6">
            Get exclusive app-only deals, instant notifications, and the smoothest shopping experience — right in your pocket.
          </p>
          <ul className="flex flex-col gap-[11px] mb-8">
            {[
              { icon: faBell, text: 'Instant deal alerts & flash sale notifications' },
              { icon: faLocationDot, text: 'Real-time delivery tracking on map' },
              { icon: faPercent, text: 'App-exclusive coupons & cashback offers' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-[11px] text-[13.5px] text-gray-700 font-medium">
                <FontAwesomeIcon icon={icon} className="text-brand-orange mt-[2px] flex-shrink-0" /> {text}
              </li>
            ))}
          </ul>
          <div className="flex gap-3 flex-wrap">
            {[
              { icon: faApple, sub: 'Download on the', main: 'App Store', label: 'Download on the App Store' },
              { icon: faGooglePlay, sub: 'Get it on', main: 'Google Play', label: 'Get it on Google Play' },
            ].map(({ icon, sub, main, label }) => (
              <Link
                key={main}
                href="#"
                aria-label={label}
                className="flex items-center gap-[11px] bg-gray-900 text-white px-5 py-[11px] rounded-[14px] hover:-translate-y-0.5 hover:bg-gray-800 transition-all"
              >
                <FontAwesomeIcon icon={icon} className="text-[22px]" />
                <div>
                  <span className="block text-[9.5px] opacity-60">{sub}</span>
                  <span className="block text-[14px] font-bold">{main}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right — Phone mockup */}
        <div className="flex justify-center items-center" aria-hidden="true">
          <div className="relative w-[250px] animate-float-y">
            {/* Glow */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(255,140,0,.22),transparent_70%)] pointer-events-none" />
            {/* Side buttons */}
            <div className="absolute -left-[9px] top-[90px] w-1 h-8 bg-[#222] rounded-l-sm" />
            <div className="absolute -right-[9px] top-[80px] w-1 h-[22px] bg-[#222] rounded-r-sm" />
            <div className="absolute -right-[9px] top-[112px] w-1 h-9 bg-[#222] rounded-r-sm" />

            <div className="bg-[#1a1a1a] rounded-[42px] border-[7px] border-[#111] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,.35),0_0_0_1px_rgba(255,255,255,.06),inset_0_0_0_1px_rgba(255,255,255,.04)] relative z-10">
              {/* Notch */}
              <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-20 h-[22px] bg-[#111] rounded-b-[14px] z-10" />

              <div className="bg-white pt-8 pb-[14px] px-3 min-h-[400px]">
                {/* Header bar */}
                <div className="flex items-center justify-between px-0.5 pb-[10px]">
                  {/* Replace with actual JOVO logo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image src="/images/Jovo_official_logo.png" alt="JOVO" width={120} height={40} className="h-5 w-20 object-cover" />
                  <FontAwesomeIcon icon={faBell} className="text-[11px] text-gray-400" />
                </div>

                {/* Search */}
                <div className="flex items-center bg-gray-100 rounded-[8px] px-[10px] py-[6px] mb-[10px]">
                  <span className="text-[10px] text-gray-400">Search products...</span>
                </div>

                {/* Banner */}
                <div className="h-[82px] rounded-[12px] mb-[10px] bg-gradient-to-br from-[#0a0a0a] to-[#1a0a00] relative overflow-hidden flex flex-col justify-end p-[10px_12px]">
                  <div className="absolute inset-0 bg-brand-gradient opacity-20" />
                  <span className="relative z-10 text-[13px] font-extrabold text-white">Flash Sales ⚡</span>
                  <span className="relative z-10 text-[10px] text-white/55">Up to 60% OFF today</span>
                </div>

                {/* Categories */}
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[.1em] mb-[6px]">Categories</p>
                <div className="grid grid-cols-4 gap-[5px] mb-[10px]">
                  {[
                    { bg: '#ff8c0018', icon: '📱', label: 'Phones' },
                    { bg: '#b4222518', icon: '📺', label: 'Elec.' },
                    { bg: '#10b98118', icon: '👗', label: 'Fashion' },
                    { bg: '#3b82f618', icon: '🎮', label: 'Games' },
                  ].map(({ bg, label, icon }) => (
                    <div key={label} className="rounded-[9px] py-[7px] px-1 flex flex-col items-center gap-[3px] text-[13px]" style={{ background: bg }}>
                      <span>{icon}</span>
                      <span className="text-[7.5px] font-semibold text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Products */}
                <div className="grid grid-cols-2 gap-[7px] mb-[10px]">
                  <div>
                    <div className="h-14 rounded-[9px] mb-[5px] bg-[rgba(255,140,0,.13)] flex items-center justify-center text-[22px] opacity-60">📱</div>
                    <span className="block text-[11px] font-extrabold text-brand-red">₦850k</span>
                    <span className="block text-[9.5px] text-gray-500 font-medium">iPhone 15</span>
                  </div>
                  <div>
                    <div className="h-14 rounded-[9px] mb-[5px] bg-[rgba(180,34,37,.13)] flex items-center justify-center text-[22px] opacity-60">💻</div>
                    <span className="block text-[11px] font-extrabold text-brand-red">₦185k</span>
                    <span className="block text-[9.5px] text-gray-500 font-medium">MacBook</span>
                  </div>
                </div>

                <div className="bg-brand-gradient text-white text-center py-[9px] rounded-[10px] text-[11px] font-extrabold">
                  Shop Now At JOVO
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}