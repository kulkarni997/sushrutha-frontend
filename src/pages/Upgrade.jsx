import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlan } from '../hooks/usePlan'
import api from '../api/axios'

const PLANS = [
  {
    key: 'free',
    label: 'FREE',
    price: '₹0',
    colorClass: 'text-hint',
    borderClass: 'border border-border',
    priceClass: 'text-textMain',
    buttonClass: 'bg-surface border border-border text-hint cursor-not-allowed',
    buttonLabel: 'Current Plan',
    features: [
      { text: '2 scans per month', included: true },
      { text: 'Basic dosha analysis', included: true },
      { text: 'Doctor map access', included: true },
      { text: 'Scan history', included: false },
      { text: 'Full recipe', included: false },
      { text: 'Pulse sensor', included: false },
      { text: '14-day forecast', included: false },
    ],
  },
  {
    key: 'basic',
    label: 'BASIC',
    price: '₹99',
    colorClass: 'text-primary',
    borderClass: 'border-2 border-primary',
    priceClass: 'text-primary',
    buttonClass: 'bg-primary text-bg hover:opacity-90',
    buttonLabel: 'Upgrade to Basic',
    upgradePlan: 'basic',
    features: [
      { text: '8 scans per month', included: true },
      { text: 'Full herbal recipe', included: true },
      { text: 'Scan history', included: true },
      { text: '14-day forecast', included: true },
      { text: 'Pulse sensor', included: false },
      { text: 'PDF export', included: false },
    ],
  },
  {
    key: 'pro',
    label: 'PRO',
    price: '₹299',
    colorClass: 'text-accent',
    borderClass: 'border border-accent',
    priceClass: 'text-accent',
    buttonClass: 'bg-accent text-bg hover:opacity-90',
    buttonLabel: 'Upgrade to Pro',
    upgradePlan: 'pro',
    features: [
      { text: 'Unlimited scans', included: true },
      { text: 'All 4 AI signals', included: true },
      { text: 'Pulse sensor support', included: true },
      { text: 'PDF export', included: true },
      { text: 'Priority doctor listing', included: true },
      { text: 'Full recipe + forecast', included: true },
    ],
  },
  {
    key: 'pro_family',
    label: 'FAMILY',
    price: '₹499',
    colorClass: 'text-neem',
    borderClass: 'border border-neem',
    priceClass: 'text-neem',
    buttonClass: 'bg-neem text-textMain hover:opacity-90',
    buttonLabel: 'Upgrade to Family',
    upgradePlan: 'pro_family',
    features: [
      { text: '20-30 shared scans', included: true },
      { text: '3-5 family profiles', included: true },
      { text: 'All PRO features', included: true },
      { text: 'Per-member history', included: true },
    ],
  },
]

export default function Upgrade() {
  const navigate = useNavigate()
  const { plan: currentPlan } = usePlan()
  const [loading, setLoading] = useState(null)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState(null)

  async function handleUpgrade(newPlan) {
    setLoading(newPlan)
    setError(null)
    setToast(null)
    try {
      await api.post('/auth/subscribe', { plan: newPlan })
      setToast('Plan upgraded successfully!')
      setTimeout(() => navigate('/scan'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upgrade failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const planLabel = currentPlan === 'pro_family' ? 'FAMILY' : currentPlan.toUpperCase()

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="font-display text-lg text-textMain tracking-wide"
        >
          SUSHRUTHA AI
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted hover:text-textMain transition-colors"
        >
          Back
        </button>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neem text-textMain text-sm px-5 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-error text-textMain text-sm px-5 py-2 rounded-full shadow-lg">
          {error}
        </div>
      )}

      {/* Hero */}
      <div className="flex flex-col items-center pt-12 pb-4 px-6">
        <h1 className="font-display text-4xl text-textMain mb-2 text-center">
          Choose your plan
        </h1>
        <p className="font-sans text-sm text-muted mb-8 text-center">
          Unlock the full power of Ayurvedic AI
        </p>

        {/* Current plan pill */}
        <span className="bg-surface border border-border text-muted text-xs font-sans px-4 py-1 rounded-full mb-12">
          Current plan: {planLabel}
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-6 pb-4">
        {PLANS.map((p) => {
          const isCurrent = currentPlan === p.key
          const isLoading = loading === p.upgradePlan

          return (
            <div
              key={p.key}
              className={`bg-surface rounded-card p-6 flex flex-col gap-4 ${p.borderClass}`}
            >
              {/* Badge + price */}
              <div>
                <span className={`text-xs font-sans font-medium ${p.colorClass}`}>
                  {p.label}
                </span>
                <div className="flex items-end gap-1 mt-1">
                  <span className={`font-display text-4xl ${p.priceClass}`}>
                    {p.price}
                  </span>
                  <span className="text-xs text-muted mb-1">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2">
                {p.features.map((f) => (
                  <li
                    key={f.text}
                    className={`font-sans text-sm flex items-center gap-2 ${
                      f.included ? 'text-muted' : 'text-hint'
                    }`}
                  >
                    <span>{f.included ? '✓' : '✗'}</span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                disabled={isCurrent || isLoading || !p.upgradePlan}
                onClick={() => p.upgradePlan && !isCurrent && handleUpgrade(p.upgradePlan)}
                className={`mt-auto w-full py-2 rounded-full text-sm font-sans font-medium transition-opacity ${
                  isCurrent || !p.upgradePlan
                    ? 'bg-surface border border-border text-hint cursor-not-allowed'
                    : p.buttonClass
                }`}
              >
                {isLoading ? 'Processing...' : isCurrent ? 'Current Plan' : p.buttonLabel}
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <p className="text-hint text-xs text-center mt-8 mb-12 px-6">
        * Payment integration coming soon.{' '}
        Upgrades are simulated for demo purposes.
      </p>
    </div>
  )
}
