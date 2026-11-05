const items = [
  'Flash sale: up to 60% off electronics',
  'Campus delivery in under 30 minutes',
  'Student-only deals, every day',
  'Pay on delivery available',
  '5,000+ verified campus sellers',
  '50,000+ products listed',
]

/** Thin ink ticker that sits above the storefront header. */
export default function TickerBar() {
  const all = [...items, ...items]

  return (
    <div className="flex h-9 items-center overflow-hidden bg-ink" role="banner" aria-label="Promotions">
      <div className="ticker-mask w-full overflow-hidden">
        <div className="flex w-max animate-ticker items-center whitespace-nowrap">
          {all.map((text, i) => (
            <span key={i} className="flex items-center gap-2.5 px-6 text-[10.5px] font-medium sm:text-[11px]">
              <span className="h-1 w-1 shrink-0 rounded-full bg-mint/70" aria-hidden="true" />
              <span className={i % 2 === 0 ? 'text-white/70' : 'text-white/45'}>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
