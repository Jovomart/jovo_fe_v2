'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeOpenText, faArrowRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { showToast } from '@/components/ui/toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      showToast('Please enter a valid email address', 'error')
      return
    }
    setSubmitted(true)
    showToast("🎉 You're subscribed! Welcome to JOVO deals.", 'success')
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 3000)
  }

  return (
    <section className="relative overflow-hidden py-[50px] sm:py-[68px] px-4 sm:px-6 bg-brand-gradient" aria-label="Subscribe to newsletter">
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:30px_30px] sm:bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-[600px] mx-auto text-center px-2 sm:px-0">
        <div className="text-[32px] sm:text-[40px] text-white/30 mb-3 sm:mb-4" aria-hidden="true">
          <FontAwesomeIcon icon={faEnvelopeOpenText} />
        </div>
        <h2 className="font-display text-[22px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-black text-white mb-2 sm:mb-[10px]">
          Never Miss a Deal Again
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-white/75 leading-[1.6] sm:leading-[1.75] mb-5 sm:mb-[26px] px-2 sm:px-0">
          Subscribe for exclusive flash sale alerts, new arrivals, and campus-only offers. Zero spam, unsubscribe anytime.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-full p-2 sm:p-[5px] shadow-[0_18px_56px_rgba(0,0,0,.2)] mb-3 sm:mb-[14px] gap-2 sm:gap-0" noValidate>
          <label htmlFor="nl-email" className="sr-only">Your email address</label>
          <input
            id="nl-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            required
            aria-required="true"
            autoComplete="email"
            className="flex-1 border-none outline-none bg-transparent font-body text-[13px] sm:text-[14px] text-gray-900 px-3 sm:px-[14px] py-2.5 sm:py-[9px] placeholder-gray-400 min-w-0 rounded-full sm:rounded-l-full"
          />
          <button
            type="submit"
            className={`flex items-center justify-center gap-[5px] rounded-full px-4 sm:px-[22px] py-2.5 sm:py-[10px] text-[13px] sm:text-[14px] font-bold text-white font-body whitespace-nowrap transition-opacity hover:opacity-90 ${submitted ? 'bg-[#22c55e]' : 'bg-brand-gradient'}`}
          >
            {submitted ? (
              <><FontAwesomeIcon icon={faCircleCheck} className="text-[12px] sm:text-[14px]" /> Subscribed!</>
            ) : (
              <>Subscribe <FontAwesomeIcon icon={faArrowRight} className="text-[11px] sm:text-[12px]" /></>
            )}
          </button>
        </form>

        <p className="text-[10px] sm:text-[11.5px] text-white/55 px-2 sm:px-0">
          By subscribing you agree to our{' '}
          <Link href="/privacy" className="text-white/80 underline hover:text-white transition-colors">Privacy Policy</Link>.
          {' '}Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}