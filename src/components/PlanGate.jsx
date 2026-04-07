import { useNavigate } from 'react-router-dom'
import { usePlan } from '../hooks/usePlan.js'

export default function PlanGate({ feature, children, fallback, blur = false }) {
  const { hasFeature } = usePlan()
  const navigate = useNavigate()
  const allowed = hasFeature(feature)

  if (allowed) return children

  if (fallback) return fallback

  if (blur) {
    return (
      <div className="relative">
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
          {children}
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'rgba(13,11,8,0.85)' }}
        >
          <span className="text-2xl">🔒</span>
          <p className="font-sans text-sm text-cream text-center mt-2">
            This feature requires an upgrade
          </p>
          <button
            className="bg-turmeric text-bg font-sans text-xs px-6 py-2 rounded-full mt-3 cursor-pointer"
            onClick={() => navigate('/upgrade')}
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-card p-6 flex flex-col items-center justify-center gap-3">
      <span className="text-2xl text-muted">🔒</span>
      <p className="font-sans text-xs text-muted text-center">
        Feature not available on your current plan
      </p>
      <button
        className="border border-turmeric text-turmeric font-sans text-xs px-6 py-2 rounded-full"
        onClick={() => navigate('/upgrade')}
      >
        See upgrade options
      </button>
    </div>
  )
}
