'use client'

import Footer from '@/components/layout/Footer'
import { VerificationCard } from '@/components/VerificationCard'
import { Shield, Lock, FileText } from 'lucide-react'
import Link from 'next/link'
import { FiChevronRight } from 'react-icons/fi'

export default function VerifyPage() {
  return (
    <>
      <div className="min-h-screen bg-[#F4F5F9]">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#0a0a0a 0%,#1a0303 35%,#2d0808 65%,#0E0E10 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute -top-16 right-1/4 h-80 w-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,#0E0E10,transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/3 h-60 w-60 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#FF6B00,transparent 70%)' }}
          />

          <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-12 md:px-8">
            <div className="mb-8 flex items-center gap-2 text-xs text-white/30">
              <Link href="/" className="transition-colors hover:text-white/60">
                Home
              </Link>
              <FiChevronRight size={11} />
              <span className="text-white/60">Company Verification</span>
            </div>

            <div className="flex items-start gap-5">
              <div
                className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl"
                style={{
                  background: 'rgba(180,34,37,0.25)',
                  border: '1px solid rgba(252,165,165,0.3)',
                }}
              >
                <Shield size={26} className="text-red-300" />
              </div>
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-300/70"
                    style={{
                      background: 'rgba(180,34,37,0.2)',
                      border: '1px solid rgba(252,165,165,0.2)',
                    }}
                  >
                    Official Verification
                  </span>
                </div>
                <h1
                  className="mb-4 text-4xl font-semibold leading-tight text-white md:text-5xl"
                  style={{
                    fontFamily: "'Instrument Sans',sans-serif",
                    textShadow: '0 4px 30px rgba(180,34,37,0.4)',
                  }}
                >
                  Company
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(90deg,#fca5a5,#fdba74,#fca5a5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Verification
                  </span>
                </h1>
                <p className="max-w-lg text-sm leading-relaxed text-white/45">
                  Verify JOVO's official registration and company details. Confirm the
                  authenticity of our platform and services.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { icon: <Shield size={11} />, text: 'Verified Business' },
                    { icon: <Lock size={11} />, text: 'Secure Platform' },
                    { icon: <FileText size={11} />, text: 'Licensed Operator' },
                  ].map(({ icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <span className="text-red-300">{icon}</span> {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z" fill="#F4F5F9" />
          </svg>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
          <VerificationCard />

          {/* Info Section */}
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div
              className="group rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: '#FEF2F2', color: '#0E0E10' }}
              >
                <Shield size={20} />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Authenticity</h3>
              <p className="text-xs leading-relaxed text-ink/60">
                Confirm you're working with the official JOVO platform and not an impersonator.
              </p>
            </div>

            <div
              className="group rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: '#EFF6FF', color: '#2563EB' }}
              >
                <Lock size={20} />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Trust</h3>
              <p className="text-xs leading-relaxed text-ink/60">
                Verify our registration details, operational status, and compliance certifications.
              </p>
            </div>

            <div
              className="group rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: '#FFFBEB', color: '#D97706' }}
              >
                <FileText size={20} />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Transparency</h3>
              <p className="text-xs leading-relaxed text-ink/60">
                Access public records of our company registration and service offerings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
