import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

function DonutChart({ data, size = 120 }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  if (total === 0) return <p style={{ color: '#6B5E50', fontSize: '0.85rem' }}>No data</p>

  const colors = { Vata: '#E8A020', Pitta: '#C0392B', Kapha: '#4A7C59' }
  const r = 40
  const circ = 2 * Math.PI * r
  let offset = 0
  const slices = Object.entries(data).map(([key, val]) => {
    const pct = val / total
    const dash = pct * circ
    const slice = { key, val, dash, offset: offset * circ, color: colors[key] }
    offset += pct
    return slice
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#2E2820" strokeWidth="18" />
        {slices.map(s => (
          <circle
            key={s.key} cx="50" cy="50" r={r} fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        ))}
        <text x="50" y="54" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F5EDD6">
          {total}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {slices.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            <span style={{ color: '#A89880', fontSize: '0.82rem' }}>{s.key}</span>
            <span style={{ color: '#F5EDD6', fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: '#6B5E50', fontSize: '0.85rem' }}>No data</p>
  const max = Math.max(...data.map(d => d.scans), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '100px' }}>
      {data.map(d => (
        <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
          <span style={{ color: '#A89880', fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace" }}>{d.scans}</span>
          <div style={{
            width: '100%', background: '#E8A020', borderRadius: '4px 4px 0 0',
            height: `${(d.scans / max) * 80}px`, minHeight: '4px',
          }} />
          <span style={{ color: '#6B5E50', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
            {d.month.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DoctorAnalytics() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'doctor') { navigate('/unauthorized'); return }
    api.get('/doctor/analytics')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <nav style={S.nav}>
        <Link to="/doctor/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.logo}>Analytics</span>
        <span />
      </nav>

      <div style={S.container}>
        <h1 style={S.title}>Practice Analytics</h1>
        <p style={S.subtitle}>Overview of your patient diagnoses</p>

        {loading ? (
          <p style={S.muted}>Loading analytics...</p>
        ) : !data ? (
          <p style={S.muted}>No data available.</p>
        ) : (
          <>
            <div style={S.statsRow}>
              {[
                { label: 'Total Scans', value: data.total_scans, color: '#E8A020' },
                { label: 'Finalised', value: data.finalised, color: '#4A7C59' },
                { label: 'Pending Review', value: data.pending, color: '#C4845A' },
              ].map(s => (
                <div key={s.label} style={S.statCard}>
                  <span style={{ ...S.statVal, color: s.color }}>{s.value}</span>
                  <span style={S.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={S.chartsRow}>
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Dosha Distribution</h3>
                <DonutChart data={data.dosha_distribution} />
              </div>

              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Severity Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {[
                    { key: 'mild', label: 'Mild', color: '#4A7C59' },
                    { key: 'moderate', label: 'Moderate', color: '#C4845A' },
                    { key: 'severe', label: 'Severe', color: '#C0392B' },
                  ].map(s => {
                    const val = data.severity_breakdown[s.key] || 0
                    const pct = data.total_scans > 0 ? Math.round((val / data.total_scans) * 100) : 0
                    return (
                      <div key={s.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ color: '#A89880', fontSize: '0.82rem' }}>{s.label}</span>
                          <span style={{ color: s.color, fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            {val} ({pct}%)
                          </span>
                        </div>
                        <div style={{ background: '#2E2820', borderRadius: '4px', height: '6px' }}>
                          <div style={{ background: s.color, width: `${pct}%`, height: '100%', borderRadius: '4px' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Monthly Trend</h3>
                <BarChart data={data.monthly_trend} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#0D0B08', color: '#F5EDD6', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem', borderBottom: '1px solid #2E2820', background: 'rgba(13,11,8,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  back: { color: '#A89880', textDecoration: 'none', fontSize: '0.9rem' },
  logo: { fontSize: '1rem', fontWeight: 700, color: '#E8A020' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 },
  title: { fontSize: '2rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, margin: '0 0 0.25rem' },
  subtitle: { color: '#6B5E50', fontSize: '0.9rem', margin: '0 0 2rem' },
  muted: { color: '#6B5E50', fontSize: '0.85rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#1C1712', border: '1px solid #2E2820', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  statVal: { fontSize: '2rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 },
  statLabel: { fontSize: '0.78rem', color: '#6B5E50', letterSpacing: '0.05em', textTransform: 'uppercase' },
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  chartCard: { background: '#1C1712', border: '1px solid #2E2820', borderRadius: '12px', padding: '1.4rem' },
  chartTitle: { fontSize: '0.8rem', color: '#A89880', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 1rem', fontWeight: 600 },
}