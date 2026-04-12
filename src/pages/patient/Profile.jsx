import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

const SEVERITY = {
  mild:     'bg-neem/10 text-neem border border-neem',
  moderate: 'bg-primary/10 text-primary border border-primary',
  severe:   'bg-error/10 text-error border border-error',
}

const DOSHA_COLOR = {
  Vata:  'bg-primary/10 text-primary',
  Pitta: 'bg-error/10 text-error',
  Kapha: 'bg-neem/10 text-neem',
}

function getDominant(result) {
  if (!result) return 'Vata'
  const scores = { Vata: result.vata_pct, Pitta: result.pitta_pct, Kapha: result.kapha_pct }
  return Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0]
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { plan } = usePlan()

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/history')
      .then(r => setScans(r.data || []))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() { logout(); navigate('/') }

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  // Dosha trend from scan history
  const doshaTrend = scans
    .filter(s => s.results && (Array.isArray(s.results) ? s.results[0] : s.results))
    .slice(0, 5)
    .map(s => {
      const result = Array.isArray(s.results) ? s.results[0] : s.results
      return {
        date: formatDate(s.created_at),
        dominant: getDominant(result),
      }
    })

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="font-display text-primary text-xl tracking-widest">SUSHRUTHA AI</span>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/scan')} className="text-muted text-sm hover:text-primary transition-colors">New Scan</button>
          <button onClick={handleLogout} className="text-hint text-xs hover:text-error transition-colors duration-200">Logout</button>
        </div>
      </nav>

      {/* Profile header */}
      <div className="px-8 py-6 bg-surface border-b border-border flex items-center gap-5 mt-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl text-primary">{initials}</span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-textMain">{user?.name}</h2>
          <span className="self-start bg-primary text-bg text-xs px-3 py-1 rounded-full font-sans font-medium mt-1 capitalize">
            {plan}
          </span>
        </div>
        <button
          onClick={() => navigate('/upgrade')}
          className="ml-auto border border-primary text-primary font-sans text-sm px-4 py-2 rounded-full hover:bg-primary hover:text-bg transition-all duration-200"
        >
          Upgrade Plan
        </button>
      </div>

      {/* Stat pills */}
      <div className="flex gap-4 px-8 py-4">
        {[
          { value: loading ? '—' : scans.length, label: 'Total Scans' },
          { value: loading ? '—' : scans.filter(s => {
              const r = Array.isArray(s.results) ? s.results[0] : s.results
              return r?.finalised
            }).length, label: 'Finalised' },
          { value: loading ? '—' : scans.filter(s => {
              const r = Array.isArray(s.results) ? s.results[0] : s.results
              return r?.severity === 'severe'
            }).length, label: 'Severe Cases' },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl px-6 py-4 text-center">
            <p className="font-mono text-2xl text-primary">{s.value}</p>
            <p className="text-xs text-muted font-sans mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two col */}
      <div className="grid grid-cols-3 gap-6 px-8 py-6">

        {/* LEFT — Scan History */}
        <div className="col-span-2">
          <h3 className="font-display text-xl text-textMain mb-4">Scan History</h3>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : error ? (
            <p className="text-error text-sm font-sans">{error}</p>
          ) : scans.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl px-6 py-10 text-center">
              <p className="text-muted font-sans text-sm">No scans yet.</p>
              <button onClick={() => navigate('/scan')} className="bg-primary text-bg rounded-full px-6 py-2 text-sm font-sans mt-4">
                Start First Scan
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {scans.map((scan) => {
                const result = Array.isArray(scan.results) ? scan.results[0] : scan.results
                const dominant = getDominant(result)
                const sev = result?.severity || 'mild'
                return (
                  <div key={scan.id} className="bg-surface border border-border rounded-xl px-6 py-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted font-sans">{formatDate(scan.created_at)}</span>
                      {result ? (
                        <span className="text-textMain font-sans font-medium text-sm">
                          V{result.vata_pct}% · P{result.pitta_pct}% · K{result.kapha_pct}%
                        </span>
                      ) : (
                        <span className="text-muted font-sans text-sm">No result yet</span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-sans capitalize ${SEVERITY[sev]}`}>
                          {sev}
                        </span>
                        {result?.finalised && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-sans bg-neem/10 text-neem border border-neem">
                            Finalised
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/results/${scan.id}`)}
                      className="border border-primary text-primary font-sans text-sm px-4 py-2 rounded-full hover:bg-primary hover:text-bg transition-all duration-200 flex-shrink-0"
                    >
                      View Report
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Dosha Trend */}
        <div className="col-span-1">
          <h3 className="font-display text-xl text-textMain mb-4">Dosha Trend</h3>
          <div className="bg-surface border border-border rounded-xl p-6">
            <p className="text-xs text-muted font-sans mb-4">Your dominant dosha over time</p>
            {doshaTrend.length === 0 ? (
              <p className="text-xs text-muted font-sans text-center py-4">No history yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {doshaTrend.map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-sans text-xs text-muted w-16 shrink-0">{row.date}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-sans font-medium ${DOSHA_COLOR[row.dominant]}`}>
                      {row.dominant}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/upgrade')}
              className="bg-primary text-bg font-sans font-medium text-sm px-5 py-2 rounded-full w-full mt-6 hover:opacity-90 transition-opacity duration-200"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}