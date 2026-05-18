import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const chartBars = [30, 45, 38, 62, 55, 80, 100];

export default function SellerBanner() {
  return (
    <section
      className="relative overflow-hidden py-[80px] px-6 bg-[#0A0A0A]"
      aria-label="Become a seller on JOVO"
    >
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] -top-[150px] -left-[100px] rounded-full bg-[radial-gradient(circle,rgba(180,34,37,.3),transparent_70%)]" />
        <div className="absolute w-[400px] h-[400px] -bottom-[100px] right-0 rounded-full bg-[radial-gradient(circle,rgba(255,140,0,.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[56px] items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[.2em] text-brand-orange bg-[rgba(255,140,0,.08)] border border-[rgba(255,140,0,.25)] px-[14px] py-[5px] rounded-full mb-[18px]">
            <FontAwesomeIcon icon={faStore} /> For Sellers
          </div>
          <h2 className="font-display text-[clamp(26px,3.2vw,44px)] font-black leading-[1.1] text-white mb-[14px]">
            Turn Your Products
            <br />
            Into <em className="not-italic text-brand-orange">Profit</em>
          </h2>
          <p className="text-[14.5px] text-white/70 leading-[1.8] mb-6">
            Join 5,000+ campus sellers already earning on JOVO. List your
            products for free, reach thousands of buyers, and get paid weekly.
          </p>
          <ul
            className="flex flex-col gap-[9px] mb-8"
            aria-label="Seller benefits"
          >
            {[
              "Free to list, no hidden fees",
              "Verified seller badge & storefront",
              "Weekly payouts to your bank",
              "Logistics support included",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-[10px] text-[13.5px] text-white/85 font-medium"
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-brand-orange text-[11px]"
                />{" "}
                {item}
              </li>
            ))}
          </ul>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/become-seller"
              className="inline-flex items-center gap-2 bg-brand-gradient text-white px-[26px] py-[13px] rounded-full text-[14px] font-extrabold shadow-[0_6px_22px_rgba(255,140,0,.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(255,140,0,.45)] transition-all"
            >
              Start Selling Free <FontAwesomeIcon icon={faArrowRight} />
            </Link>
            <Link
              href="/seller/login"
              className="inline-flex items-center bg-transparent text-white/60 px-[26px] py-[13px] rounded-full text-[14px] font-bold border border-white/20 hover:border-white/50 hover:text-white transition-all"
            >
              Seller Login
            </Link>
          </div>
        </div>

        {/* Right — stats card */}
        <div aria-hidden="true">
          <div className="bg-white/[.06] border border-white/10 rounded-[28px] p-7 backdrop-blur-[10px]">
            <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
              {[
                { value: "₦2.4M+", label: "Avg monthly earnings" },
                { value: "5,000+", label: "Active sellers" },
                { value: "48hrs", label: "Account approval" },
                { value: "4.9★", label: "Seller satisfaction" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/[.06] rounded-[14px] p-[16px_14px] text-center"
                >
                  <strong className="block text-[20px] font-extrabold gradient-text mb-[3px]">
                    {value}
                  </strong>
                  <span className="text-[10.5px] text-white/40">{label}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div
              className="flex items-end gap-[5px] h-[72px] mt-[18px] mb-2 px-1"
              role="img"
              aria-label="Revenue growth chart showing upward trend"
            >
              {chartBars.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[4px] transition-colors hover:opacity-80 ${i === chartBars.length - 1 ? "bg-brand-gradient" : "bg-white/12 hover:bg-white/22"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="text-[10.5px] text-white/55 text-center">
              Revenue growth over 7 weeks 📈
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
