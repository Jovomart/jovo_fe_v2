'use client'

import { useEffect, useState } from 'react'
import { FiCheck, FiMapPin, FiCopy, FiPrinter } from 'react-icons/fi'

interface CompanyRecord {
  registrationId: string
  companyName: string
  website: string
  status: string
  registrationDate: string
  expiryDate: string
  planType: string
  securityCompliance: string
  headquarters: string
  country: string
}

// Official JOVO Technologies company record
const companyDatabase: CompanyRecord[] = [
  {
    registrationId: 'JV-2026-00001',
    companyName: 'JOVO Technologies Ltd',
    website: 'jovo.ng',
    status: 'Verified',
    registrationDate: '2026-01-10',
    expiryDate: '2029-01-09',
    planType: 'Campus E-Commerce Platform',
    securityCompliance: 'ISO 27001 & SOC 2 Type II',
    headquarters: 'Lagos',
    country: 'Nigeria',
  },
]

export function VerificationCard() {
  const [regIdValue, setRegIdValue] = useState('')
  const [result, setResult] = useState<CompanyRecord | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleVerify = () => {
    const regId = regIdValue.trim().toUpperCase()
    if (!regId) return

    const found = companyDatabase.find((c) => c.registrationId === regId)
    if (!found) {
      setResult(null)
      setNotFound(true)
      return
    }

    setResult(found)
    setNotFound(false)
  }

  const handleReset = () => {
    setRegIdValue('')
    setResult(null)
    setNotFound(false)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const copyLink = () => {
    if (!result) return
    const link = `${window.location.origin}/verify?id=${result.registrationId}`
    navigator.clipboard.writeText(link)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      const regId = id.toUpperCase()
      setRegIdValue(regId)
      const found = companyDatabase.find((c) => c.registrationId === regId)
      if (found) {
        setResult(found)
      } else {
        setNotFound(true)
      }
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search Input */}
      <div
        className="rounded-3xl bg-white p-6 sm:p-8"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-ink/50">
          Enter JOVO Registration ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="e.g., JV-2026-00001"
            value={regIdValue}
            onChange={(e) => setRegIdValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="flex-1 rounded-2xl border border-ink/10 bg-[#F4F5F9] px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink/30 focus:border-[#0E0E10] focus:ring-2 focus:ring-[#0E0E10]/10"
          />
          <button
            onClick={handleVerify}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#0E0E10] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1a1a1c]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Verify ID
          </button>
        </div>
      </div>

      {/* Success Result */}
      {result && (
        <div
          className="mt-6 overflow-hidden rounded-3xl bg-white"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          <div
            className="border-b border-ink/10 px-6 py-5 sm:px-8"
            style={{ background: '#0E0E10' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[19px] font-bold text-white">{result.companyName}</h3>
                <p className="mt-1 font-mono text-[11.5px] text-white/80">
                  {result.registrationId} • {result.website}
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-400 px-3.5 py-1.5 text-[11.5px] font-bold text-green-900">
                <FiCheck size={14} />
                {result.status}
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {/* Location confirmation */}
            <div
              className="mb-6 flex items-center gap-3 rounded-2xl p-4"
              style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
            >
              <FiMapPin size={20} className="shrink-0 text-green-600" />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">
                  Registered Location Confirmed
                </p>
                <p className="text-[12px] text-ink/60">
                  {result.headquarters}, {result.country}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailBlock label="Registration ID" value={result.registrationId} />
              <DetailBlock label="Official Domain" value={result.website} />
              <DetailBlock label="Registration Date" value={formatDate(result.registrationDate)} />
              <DetailBlock label="Expiry Date" value={formatDate(result.expiryDate)} />
              <DetailBlock label="Service Type" value={result.planType} />
              <DetailBlock label="Security Compliance" value={result.securityCompliance} />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={copyLink}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-[#F4F5F9] px-5 py-3 text-[12.5px] font-medium text-ink transition-all hover:bg-ink/5"
              >
                <FiCopy size={16} />
                Copy Link
              </button>
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0E0E10] px-5 py-3 text-[12.5px] font-semibold text-white transition-all hover:bg-[#1a1a1c]"
              >
                <FiPrinter size={16} />
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Not Found */}
      {notFound && (
        <div
          className="mt-6 rounded-3xl bg-white p-8 text-center"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-[17px] font-bold text-ink">Record Not Found</h3>
          <p className="mb-6 text-[13px] text-ink/60">
            No record found for this Registration ID. Please check the ID and try again.
          </p>
          <button
            onClick={handleReset}
            className="rounded-2xl border border-ink/10 bg-[#F4F5F9] px-5 py-2.5 text-[12.5px] font-medium text-ink transition-all hover:bg-ink/5"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quick Demo Info */}
      <div
        className="mt-6 rounded-2xl p-5 text-center"
        style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
      >
        <p className="mb-3 text-[12px] text-ink/60">Official JOVO Registration ID:</p>
        <button
          onClick={() => {
            setRegIdValue('JV-2026-00001')
            setResult(null)
            setNotFound(false)
          }}
          className="rounded-xl border border-[#0E0E10]/20 bg-white px-4 py-2 font-mono text-[12.5px] font-semibold text-[#0E0E10] transition-all hover:bg-[#F4F5F9]"
        >
          JV-2026-00001
        </button>
      </div>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-[#F4F5F9] p-4">
      <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink/50">{label}</p>
      <p className="text-[13.5px] font-semibold text-ink">{value}</p>
    </div>
  )
}
