import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import PlanGate from '../../components/PlanGate'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement)

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockResult = {
  scanId: 'mock-scan-id',
  vata: 58,
  pitta: 28,
  kapha: 14,
  severity: 'mild',
  dominant: 'Vata',
  recipe_text: `Ashwagandha: Take 1 tsp with warm milk at bedtime.
Shatavari: Mix 1 tsp in warm water, drink after meals.
Brahmi: Take 500mg capsule twice daily with food.
Triphala: Mix 1 tsp in warm water before sleeping.
Trikatu: Take a pinch with honey before meals.`,
  forecast: [
    { day: 'Day 1', value: 20 },
    { day: 'Day 3', value: 35 },
    { day: 'Day 5', value: 48 },
    { day: 'Day 7', value: 58 },
    { day: 'Day 10', value: 70 },
    { day: 'Day 14', value: 82 },
  ],
  pulse_used: false,
}

const VATA_YOGA = [
  {
    title: 'Grounding poses',
    desc: 'Warrior I, Mountain pose, Child\'s pose — hold each for 5 slow breaths.',
  },
  {
    title: 'Oil massage (Abhyanga)',
    desc: 'Self-massage with warm sesame oil before bathing, 10–15 minutes daily.',
  },
  {
    title: 'Daily routine',
    desc: 'Sleep by 10 pm, wake by 6 am. Eat warm, oily, lightly spiced foods at regular times.',
  },
]

const SEVERITY_CONFIG = {
  mild: {
    bg: 'bg-neem/20',
    border: 'border-neem',
    text: 'text-neem',
    label: '🌿 Mild imbalance detected — self-care recommended',
  },
  moderate: {
    bg: 'bg-primary/20',
    border: 'border-primary',
    text: 'text-primary',
    label: '⚠ Moderate imbalance — consult a doctor alongside these tips',
  },
  severe: {
    bg: 'bg-error/20',
    border: 'border-error',
    text: 'text-error',
    label: '🔴 Significant imbalance — please consult a BAMS doctor',
  },
}

const DOSHA_BAR_COLOR = {
  Vata: 'bg-primary',
  Pitta: 'bg-error',
  Kapha: 'bg-neem',
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
            <span className="bg-primary/20 text-primary font-sans text-xs px-2 py-0.5 rounded-full">
              Dominant
            </span>
          )}
        </div>
        <span className="font-mono text-sm text-muted">{value}%</span>
      </div>
      <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
        <div
          className={`${DOSHA_BAR_COLOR[name]} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function RecipeCard({ line }) {
  const colonIdx = line.indexOf(':')
  if (colonIdx === -1) return null
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
    labels: forecast.map((d) => d.day),
    datasets: [
      {
        data: forecast.map((d) => d.value),
        borderColor: '#E8A020',
        backgroundColor: 'rgba(232,160,32,0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#E8A020',
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: '#A89880', font: { family: 'DM Sans', size: 11 } },
        grid: { color: '#2E2820' },
        border: { color: '#2E2820' },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: '#A89880', font: { family: 'DM Sans', size: 11 } },
        grid: { color: '#2E2820' },
        border: { color: '#2E2820' },
      },
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
  const { user, logout } = useAuth()
  usePlan()

  const r = mockResult
  const recipeLines = r.recipe_text.split('\n').filter(Boolean)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2">
        <button
          onClick={() => navigate('/')}
          className="font-display text-primary text-xl tracking-widest"
        >
          SUSHRUTHA AI
        </button>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-hint text-xs hover:text-error transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* 1. Severity banner */}
        <SeverityBanner severity={r.severity} />

        {/* 2. Dosha chart */}
        <section>
          <h2 className="font-display text-3xl text-textMain mb-6">Your Dosha Profile</h2>
          <div className="bg-surface border border-border rounded-card p-6">
            <DoshaBar name="Vata" value={r.vata} dominant={r.dominant === 'Vata'} />
            <DoshaBar name="Pitta" value={r.pitta} dominant={r.dominant === 'Pitta'} />
            <DoshaBar name="Kapha" value={r.kapha} dominant={r.dominant === 'Kapha'} />
          </div>
        </section>

        {/* 3. Recipe — plan-gated */}
        <section>
          <h2 className="font-display text-2xl text-textMain mb-4">Your Ayurvedic Recipe</h2>
          <PlanGate feature="full_recipe" blur>
            <div className="flex flex-col gap-3">
              {recipeLines.map((line) => (
                <RecipeCard key={line} line={line} />
              ))}
            </div>
          </PlanGate>
        </section>

        {/* 4. Yoga — always shown for mild */}
        {r.severity === 'mild' && (
          <section>
            <h2 className="font-display text-2xl text-textMain mb-4">Recommended Practices</h2>
            <div className="flex flex-col gap-3">
              {VATA_YOGA.map((item) => (
                <div key={item.title} className="bg-surface border border-border rounded-card p-4">
                  <p className="font-sans text-sm font-semibold text-textMain mb-1">{item.title}</p>
                  <p className="font-sans text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Forecast — plan-gated */}
        <section>
          <h2 className="font-display text-2xl text-textMain mb-4">14-Day Healing Forecast</h2>
          <PlanGate feature="forecast" blur>
            <ForecastChart forecast={r.forecast} />
          </PlanGate>
        </section>

        {/* 6. Doctor map */}
        <section>
          <h2 className="font-display text-2xl text-textMain mb-4">Find a BAMS Doctor</h2>
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col items-center text-center gap-3">
            <p className="font-sans text-sm text-muted">
              🗺 Doctor map will load here — connecting to verified BAMS doctors nearby
            </p>
            <p className="font-sans text-sm text-muted">
              Share your report with a doctor to get personalised guidance.
            </p>
            <button className="bg-primary text-bg rounded-full px-6 py-2 text-sm font-sans mt-1">
              Share Report
            </button>
          </div>
        </section>

        {/* 7. Scan again */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => navigate('/scan')}
            className="border border-border text-muted rounded-full px-8 py-3 text-sm font-sans"
          >
            Start New Scan
          </button>
        </div>

      </div>
    </div>
  )
}
