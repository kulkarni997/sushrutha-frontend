import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const stats = [
  { label: 'Total Patients',     value: '24'   },
  { label: 'Reports Reviewed',   value: '18'   },
  { label: 'Walk-in Sessions',   value: '12'   },
  { label: 'Avg Response Time',  value: '2.4h' },
]

const doshaDist = [
  { label: 'Vata dominant',  pct: 45, bar: 'bg-primary' },
  { label: 'Pitta dominant', pct: 35, bar: 'bg-accent'  },
  { label: 'Kapha dominant', pct: 20, bar: 'bg-neem'    },
]

const severityDist = [
  { label: 'Mild',     pct: 60, bar: 'bg-neem'    },
  { label: 'Moderate', pct: 30, bar: 'bg-warning'  },
  { label: 'Severe',   pct: 10, bar: 'bg-error'    },
]

const activity = [
  { text: 'Ravi Kumar report finalised',  time: 'Today 10:15 AM', dot: 'bg-neem'    },
  { text: 'Meena Patil walk-in session',  time: 'Today 9:00 AM',  dot: 'bg-primary'  },
  { text: 'Suresh Nair report shared',    time: 'Yesterday',       dot: 'bg-primary'  },
  { text: 'New message from Ravi Kumar',  time: 'Yesterday',       dot: 'bg-accent'   },
  { text: 'Walk-in session completed',    time: '2 days ago',      dot: 'bg-primary'  },
]

function BarRow({ label, pct, bar }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-sm text-muted w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-surfaceAlt rounded-full h-4 overflow-hidden">
        <div className={`${bar} h-4 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-sm text-textMain w-12 text-right">{pct}%</span>
    </div>
  )
}

export default function DoctorAnalytics() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-surface border-b border-border">
        <span onClick={() => navigate('/')} className="font-display text-xl text-primary cursor-pointer">
          SUSHRUTHA AI
        </span>
        <div className="flex items-center gap-6">
          <span className="font-sans text-sm text-muted">Dr {user?.name}</span>
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="font-sans text-sm text-muted hover:text-primary"
          >
            Dashboard
          </button>
          <button
            onClick={logout}
            className="font-sans text-sm text-muted hover:text-error"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page title */}
      <div className="px-8 py-6">
        <h1 className="font-display text-4xl text-textMain mb-1">Analytics</h1>
        <p className="text-muted font-sans text-sm">Your patient insights this month</p>
      </div>

      {/* Section 1 — Stat cards */}
      <div className="grid grid-cols-4 gap-4 px-8 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-6">
            <p className="font-mono text-4xl text-primary mb-2">{s.value}</p>
            <p className="text-muted text-sm font-sans">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section 2 — Distribution charts */}
      <div className="grid grid-cols-2 gap-6 px-8 mb-6">

        {/* Dosha distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-display text-xl text-textMain mb-5">Dosha Distribution</h3>
          <div className="flex flex-col gap-4">
            {doshaDist.map((row) => (
              <BarRow key={row.label} {...row} />
            ))}
          </div>
        </div>

        {/* Severity breakdown */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-display text-xl text-textMain mb-5">Severity Breakdown</h3>
          <div className="flex flex-col gap-4">
            {severityDist.map((row) => (
              <BarRow key={row.label} {...row} />
            ))}
          </div>
        </div>
      </div>

      {/* Section 3 — Recent activity */}
      <div className="px-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-display text-xl text-textMain mb-4">Recent Activity</h3>
          <div>
            {activity.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-3 ${i < activity.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                <span className="font-sans text-sm text-textMain flex-1">{item.text}</span>
                <span className="font-sans text-xs text-hint ml-auto">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
