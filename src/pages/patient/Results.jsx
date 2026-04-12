import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import PlanGate from '../../components/PlanGate'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler)

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  mild: {
    bg: 'bg-neem/20', border: 'border-neem', text: 'text-neem',
    label: '🌿 Mild imbalance detected — self-care recommended',
  },
  moderate: {
    bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary',
    label: '⚠ Moderate imbalance — consult a doctor alongside these tips',
  },
  severe: {
    bg: 'bg-error/20', border: 'border-error', text: 'text-error',
    label: '🔴 Significant imbalance — please consult a BAMS doctor immediately',
  },
}

const DOSHA_BAR_COLOR = { Vata: 'bg-primary', Pitta: 'bg-error', Kapha: 'bg-neem' }

const YOGA_BY_DOSHA = {
  Vata: [
    { title: 'Grounding poses', desc: "Warrior I, Mountain pose, Child's pose — hold each for 5 slow breaths." },
    { title: 'Oil massage (Abhyanga)', desc: 'Self-massage with warm sesame oil before bathing, 10–15 minutes daily.' },
    { title: 'Daily routine', desc: 'Sleep by 10 pm, wake by 6 am. Eat warm, oily, lightly spiced foods at regular times.' },
  ],
  Pitta: [
    { title: 'Cooling poses', desc: 'Moon salutation, seated forward bend, cobra pose — avoid overheating.' },
    { title: 'Cooling pranayama', desc: 'Sheetali breathing — curl tongue, inhale through mouth, exhale through nose.' },
    { title: 'Diet', desc: 'Avoid spicy, sour, fermented foods. Favour sweet, bitter, astringent tastes.' },
  ],
  Kapha: [
    { title: 'Energising poses', desc: 'Sun salutation, warrior II, camel pose — move briskly and dynamically.' },
    { title: 'Kapalabhati breathing', desc: 'Rapid exhales through nose, 30 reps × 3 rounds every morning.' },
    { title: 'Diet', desc: 'Avoid heavy, cold, oily foods. Favour light, dry, spicy, and warm foods.' },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityBanner({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.mild
  return (
    <div className={`${cfg.bg} ${cfg.border} ${cfg.text} border rounded-card p-4 font-sans text-sm mb-6`}>
      {cfg.label}
    </div>
  )
}

function DoshaBar({ name, value, dominant }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm text-textMain">{name}</span>
          {dominant && (
            <span className="bg-primary/20 text-primary font-sans text-xs px-2 py-0.5 rounded-full">Dominant</span>
          )}
        </div>
        <span className="font-mono text-sm text-muted">{value}%</span>
      </div>
      <div className="w-full bg-bg rounded-full h-3 overflow-hidden">
        <div className={`${DOSHA_BAR_COLOR[name]} h-3 rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function RecipeCard({ line }) {
  const colonIdx = line.indexOf(':')
  if (colonIdx === -1) return <div className="bg-surface border border-border rounded-card p-4"><p className="font-sans text-sm text-muted">{line}</p></div>
  const herb = line.slice(0, colonIdx).trim()
  const instruction = line.slice(colonIdx + 1).trim()
  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <p className="font-sans text-sm font-semibold text-primary mb-1">{herb}</p>
      <p className="font-sans text-sm text-muted">{instruction}</p>
    </div>
  )
}

function ForecastChart({ forecast }) {
  const data = {
    labels: forecast.map((d) => `Day ${d.day}`),
    datasets: [{
      data: forecast.map((d) => d.healing_score),
      borderColor: '#E8A020',
      backgroundColor: 'rgba(232,160,32,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#E8A020',
      pointRadius: 4,
      tension: 0.35,
      fill: true,
    }],
  }
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#A89880', font: { family: 'DM Sans', size: 11 } }, grid: { color: '#2E2820' }, border: { color: '#2E2820' } },
      y: { min: 0, max: 100, ticks: { color: '#A89880', font: { family: 'DM Sans', size: 11 } }, grid: { color: '#2E2820' }, border: { color: '#2E2820' } },
    },
  }
  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <Line data={data} options={options} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Results() {
  const navigate = useNavigate()
  const { scanId } = useParams()
  const { user, logout } = useAuth()
  const { hasFeature } = usePlan()

  const [result, setResult] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [doctorId, setDoctorId] = useState('')

  useEffect(() => {
    if (!scanId) return

    // Fetch scan + result
    api.get(`/scans/${scanId}`)
      .then(r => {
        const scanData = r.data
        const res = Array.isArray(scanData.results) ? scanData.results[0] : scanData.results
        if (!res) { setError('No diagnosis result found.'); setLoading(false); return }
        setResult({ ...res, symptoms_text: scanData.symptoms_text })

        // Fetch forecast only if not severe and plan allows
        if (res.severity !== 'severe' && hasFeature('forecast')) {
          return api.get(`/forecast/${scanId}`)
        }
      })
      .then(r => { if (r?.data?.forecast) setForecast(r.data.forecast) })
      .catch(e => setError(e.response?.data?.detail || 'Failed to load results.'))
      .finally(() => setLoading(false))
  }, [scanId])

  async function handleShare() {
    if (!doctorId.trim()) return
    setSharing(true)
    try {
      await api.patch(`/scans/${scanId}/share`, { doctor_id: doctorId.trim() })
      setShareSuccess(true)
    } catch (e) {
      console.error(e)
    }
    setSharing(false)
  }

  function handleLogout() { logout(); navigate('/') }

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Spinner message="Loading your results..." />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <p className="text-error font-sans text-sm">{error}</p>
      <button onClick={() => navigate('/scan')} className="bg-primary text-bg rounded-full px-6 py-2 text-sm font-sans">Try Again</button>
    </div>
  )

  const dominant = result.override_dosha ||
    (['Vata', 'Pitta', 'Kapha'].reduce((a, b) =>
      ({ Vata: result.vata_pct, Pitta: result.pitta_pct, Kapha: result.kapha_pct }[a] >
       { Vata: result.vata_pct, Pitta: result.pitta_pct, Kapha: result.kapha_pct }[b] ? a : b)
    ))

  const recipeLines = (result.recipe_text || '').split('\n').filter(Boolean)
  const yogaTips = YOGA_BY_DOSHA[dominant] || YOGA_BY_DOSHA.Vata
  const isSevere = result.severity === 'severe'

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans">
      <nav className="flex items-center justify-between px-6 pt-6 pb-2">
        <button onClick={() => navigate('/')} className="font-display text-primary text-xl tracking-widest">SUSHRUTHA AI</button>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-hint text-xs hover:text-error transition-colors duration-200">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* 1. Severity banner */}
        <SeverityBanner severity={result.severity} />

        {/* 2. Dosha profile */}
        <section>
          <h2 className="font-display text-3xl text-textMain mb-6">Your Dosha Profile</h2>
          <div className="bg-surface border border-border rounded-card p-6">
            <DoshaBar name="Vata" value={result.vata_pct} dominant={dominant === 'Vata'} />
            <DoshaBar name="Pitta" value={result.pitta_pct} dominant={dominant === 'Pitta'} />
            <DoshaBar name="Kapha" value={result.kapha_pct} dominant={dominant === 'Kapha'} />
            {result.pulse_used && (
              <p className="font-sans text-xs text-neem mt-4">✓ Pulse sensor data included in this diagnosis</p>
            )}
            {result.override_dosha && (
              <p className="font-sans text-xs text-primary mt-2">Doctor override applied: {result.override_dosha}</p>
            )}
          </div>
        </section>

        {/* 3. Recipe — gated, hidden for severe */}
        {!isSevere && (
          <section>
            <h2 className="font-display text-2xl text-textMain mb-4">Your Ayurvedic Recipe</h2>
            <PlanGate feature="full_recipe" blur>
              <div className="flex flex-col gap-3">
                {recipeLines.length > 0
                  ? recipeLines.map((line, i) => <RecipeCard key={i} line={line} />)
                  : <p className="text-muted text-sm font-sans">Recipe not available.</p>
                }
              </div>
            </PlanGate>
          </section>
        )}

        {/* 4. Yoga — always shown if not severe */}
        {!isSevere && (
          <section>
            <h2 className="font-display text-2xl text-textMain mb-4">Recommended Practices</h2>
            <div className="flex flex-col gap-3">
              {yogaTips.map((item) => (
                <div key={item.title} className="bg-surface border border-border rounded-card p-4">
                  <p className="font-sans text-sm font-semibold text-textMain mb-1">{item.title}</p>
                  <p className="font-sans text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Doctor notes (if finalised) */}
        {result.finalised && result.doctor_notes && (
          <section>
            <h2 className="font-display text-2xl text-textMain mb-4">Doctor Notes</h2>
            <div className="bg-surface border border-border rounded-card p-4">
              <p className="font-sans text-sm text-muted">{result.doctor_notes}</p>
            </div>
          </section>
        )}

        {/* 6. Forecast — gated */}
        {!isSevere && (
          <section>
            <h2 className="font-display text-2xl text-textMain mb-4">14-Day Healing Forecast</h2>
            <PlanGate feature="forecast" blur>
              {forecast && forecast.length > 0
                ? <ForecastChart forecast={forecast} />
                : <p className="text-muted text-sm font-sans">Forecast not available yet.</p>
              }
            </PlanGate>
          </section>
        )}

        {/* 7. Share with doctor */}
        <section>
          <h2 className="font-display text-2xl text-textMain mb-4">Find a BAMS Doctor</h2>
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-4">
            {isSevere && (
              <p className="text-error font-sans text-sm">Your imbalance is severe. Please consult a BAMS doctor immediately.</p>
            )}
            {shareSuccess ? (
              <p className="text-neem font-sans text-sm">✓ Report shared successfully. The doctor will be notified.</p>
            ) : (
              <>
                <p className="font-sans text-sm text-muted">Enter a doctor's ID to share your report with them.</p>
                <input
                  value={doctorId}
                  onChange={e => setDoctorId(e.target.value)}
                  placeholder="Doctor ID"
                  className="w-full bg-bg border border-border rounded-card px-4 py-2 text-textMain text-sm font-sans placeholder:text-hint focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleShare}
                  disabled={sharing || !doctorId.trim()}
                  className="bg-primary text-bg rounded-full px-6 py-2 text-sm font-sans self-start disabled:opacity-50"
                >
                  {sharing ? 'Sharing...' : 'Share Report'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* 8. Scan again */}
        <div className="flex justify-center pb-4">
          <button onClick={() => navigate('/scan')} className="border border-border text-muted rounded-full px-8 py-3 text-sm font-sans">
            Start New Scan
          </button>
        </div>

      </div>
    </div>
  )
}