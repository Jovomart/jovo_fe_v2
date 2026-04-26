'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCheck, FiRefreshCw, FiShield, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import apiService from '@/services/apiService'

export default function VerifyOTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const [providerId, setProviderId] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  
  // OTP from backend response
  const [backendOTP, setBackendOTP] = useState('')
  const [showOTP, setShowOTP] = useState(true)
  const [copied, setCopied] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const id = localStorage.getItem('sp_pending_id')
    if (!id) {
      router.replace('/services/apply')
    } else {
      setProviderId(id)
      inputRefs.current[0]?.focus()
      
      // Auto-resend OTP when page loads to get one
      const autoResend = async () => {
        try {
          const response = await apiService.resendServiceProviderOTP(id)
          const otpValue = response?.data?.otp || response?.otp || response?.code
          if (otpValue) {
            setBackendOTP(otpValue.toString())
          }
          setCountdown(120)
        } catch (err) {
          console.error('Auto-resend failed:', err)
        }
      }
      autoResend()
    }
  }, [router])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    setError('')
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const next = [...otp]
      next[i - 1] = ''
      setOtp(next)
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length > 0) {
      const filled = [...text.split(''), ...Array(6 - text.length).fill('')]
      setOtp(filled)
      const nextFocus = Math.min(text.length, 5)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) return
    setLoading(true)
    setError('')
    try {
      await apiService.verifyServiceProviderOTP(providerId, code)
      setSuccess(true)
      localStorage.removeItem('sp_pending_id')
      setTimeout(() => router.push('/services/dashboard'), 1800)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check and try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!providerId) return
    setResending(true)
    setError('')
    setBackendOTP('')
    try {
      const response = await apiService.resendServiceProviderOTP(providerId)
      const otpValue = response?.data?.otp || response?.otp || response?.code
      if (otpValue) {
        setBackendOTP(otpValue.toString())
      }
      setCountdown(120)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const autoFillOTP = () => {
    if (backendOTP && backendOTP.length === 6) {
      const digits = backendOTP.split('')
      setOtp(digits)
      // Auto-submit after filling
      setTimeout(() => {
        handleVerify()
      }, 100)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(backendOTP)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const otpFull = otp.every(d => d !== '')
  const mins = Math.floor(countdown / 60)
  const secs = (countdown % 60).toString().padStart(2, '0')

  const dotBg = {
    backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)',
    backgroundSize: '28px 28px',
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#111 40%,#1a0a00 70%,#2a1500 100%)' }}>

      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={dotBg} />
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#FF8C00,transparent 65%)' }} />
      <div className="fixed bottom-0 left-0 w-72 h-72 rounded-full opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#B42225,transparent 65%)' }} />

      <div className="relative z-10 w-full max-w-sm">

        <Link href="/services/apply"
          className="inline-flex items-center gap-2 text-white/40 text-xs font-semibold hover:text-white/70 transition-colors mb-8">
          <FiArrowLeft size={14} /> Back to application
        </Link>

        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>

          {success ? (
            <div className="text-center py-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 16px 40px rgba(5,150,105,0.4)' }}>
                <FiCheck size={32} className="text-white" />
              </div>
              <h2 className="text-white font-black text-2xl mb-2" style={{ fontFamily: "'Georgia',serif" }}>
                You&apos;re verified!
              </h2>
              <p className="text-white/40 text-sm mb-6">Setting up your provider dashboard...</p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#FF8C00] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)' }}>
                <FaWhatsapp size={24} className="text-green-400" />
              </div>

              <h2 className="text-white font-black text-2xl mb-2" style={{ fontFamily: "'Georgia',serif" }}>
                Verify Your Account
              </h2>
              
              <p className="text-white/40 text-sm mb-4 leading-relaxed">
                Enter the 6-digit verification code to activate your provider account.
              </p>

              {/* DEVELOPMENT MODE: Show OTP from backend */}
              {backendOTP && (
                <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF8C00] text-[10px] font-black uppercase tracking-wider">🔧 DEVELOPMENT MODE</span>
                    </div>
                    <button 
                      onClick={() => setShowOTP(!showOTP)}
                      className="text-white/40 hover:text-white/70 transition-colors p-1 rounded-lg"
                      title={showOTP ? "Hide OTP" : "Show OTP"}
                    >
                      {showOTP ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                  
                  {showOTP ? (
                    <>
                      <p className="text-white/60 text-[11px] mb-2">Your verification code is:</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="text-2xl font-mono font-black text-white tracking-wider bg-black/30 px-4 py-2 rounded-xl">
                          {backendOTP.split('').join(' ')}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-white/20"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                          <FiCopy size={12} />
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={autoFillOTP}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}
                        >
                          <FiCheck size={12} /> Auto-fill & Verify
                        </button>
                      </div>
                      <p className="text-white/30 text-[10px] mt-2">
                        Enter this code in the boxes below, or click "Auto-fill & Verify"
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-white/40 text-xs">OTP is hidden</p>
                      <button 
                        onClick={() => setShowOTP(true)}
                        className="mt-1 text-xs text-[#FF8C00] hover:underline"
                      >
                        Click to show
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-black text-white rounded-2xl outline-none transition-all"
                    style={{
                      background: digit ? 'rgba(255,140,0,0.1)' : 'rgba(255,255,255,0.06)',
                      border: digit ? '2px solid rgba(255,140,0,0.5)' : '1px solid rgba(255,255,255,0.12)',
                      boxShadow: digit ? '0 0 0 3px rgba(255,140,0,0.1)' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* error */}
              {error && (
                <div
                  className="p-3.5 rounded-2xl text-red-400 text-xs mb-4 flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <FiShield size={13} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* verify btn */}
              <button
                onClick={handleVerify}
                disabled={!otpFull || loading}
                className="w-full py-3.5 rounded-2xl text-sm font-black text-white mb-5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg,#B42225,#FF8C00)',
                  boxShadow: otpFull && !loading ? '0 8px 28px rgba(180,34,37,0.35)' : 'none',
                }}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                  : 'Verify & Activate Account'}
              </button>

              {/* resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-white/30 text-xs">
                    Resend code in{' '}
                    <span className="text-white/60 font-bold tabular-nums">{mins}:{secs}</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8C00] hover:text-[#FFB347] transition-colors disabled:opacity-50 mx-auto">
                    <FiRefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                    {resending ? 'Sending...' : 'Resend verification code'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!success && backendOTP && (
          <p className="text-center text-white/20 text-[10px] mt-5 flex items-center justify-center gap-1.5">
            <FiShield size={10} /> Development mode: OTP shown above for testing
          </p>
        )}
      </div>
    </div>
  )
}