export default function AnnouncementBar() {
  const items = [
    '⚡ Flash Sale: Up to 60% OFF Electronics',
    '🛵 Campus Delivery in Under 30 Minutes',
    '🎓 Student-Exclusive Deals Every Day',
    '💳 Pay on Delivery Available',
    '🏪 5,000+ Verified Campus Sellers',
    '📦 50,000+ Products Listed',
  ]
  // Duplicate for seamless loop
  const all = [...items, ...items]

  return (
    <div
      className="bg-[#0A0A0A] h-[34px] overflow-hidden flex items-center border-b border-[rgba(255,140,0,.15)]"
      role="banner"
      aria-label="Promotions"
    >
      <div className="w-full overflow-hidden ticker-mask">
        <div className="flex items-center whitespace-nowrap animate-ticker">
          {all.map((text, i) => (
            <span
              key={i}
              className={`text-[11.5px] font-medium px-9 border-r border-white/[.08] ${i % 2 === 0 ? 'text-white/80' : 'text-white/60'}`}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
