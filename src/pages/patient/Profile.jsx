import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const mockScans = [
  {
    id: 1,
    date: 'Jan 15, 2025',
    result: 'Vata 58%, Pitta 28%, Kapha 14%',
    severity: 'mild',
    scanId: 'scan-1',
  },
  {
    id: 2,
    date: 'Dec 20, 2024',
    result: 'Pitta 52%, Vata 32%, Kapha 16%',
    severity: 'moderate',
    scanId: 'scan-2',
  },
  {
    id: 3,
    date: 'Nov 5, 2024',
    result: 'Kapha 61%, Vata 25%, Pitta 14%',
    severity: 'severe',
    scanId: 'scan-3',
  },
]

const SEVERITY = {
  mild:     'bg-neem/10 text-neem border border-neem',
  moderate: 'bg-warning/10 text-warning border border-warning',
  severe:   'bg-error/10 text-error border border-error',
}

const doshaTrend = [
  { month: 'Jan', dosha: 'Vata',  cls: 'bg-primary/10 text-primary' },
  { month: 'Dec', dosha: 'Pitta', cls: 'bg-accent/10 text-accent'   },
  { month: 'Nov', dosha: 'Kapha', cls: 'bg-neem/10 text-neem'       },
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="font-display text-primary text-xl tracking-widest">SUSHRUTHA AI</span>
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

      {/* Section 1 — Profile header */}
      <div className="px-8 py-6 bg-surface border-b border-border flex items-center gap-5 mt-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl text-primary">RK</span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-textMain">Ravi Kumar</h2>
          <p className="text-muted text-sm font-sans">r***@gmail.com</p>
          <span className="self-start bg-primary text-white text-xs px-3 py-1 rounded-full font-sans font-medium mt-1">
            PRO
          </span>
        </div>
      </div>

      {/* Section 2 — Stat pills */}
      <div className="flex gap-4 px-8 py-4">
        {[
          { value: '8',        label: 'Scans'           },
          { value: '3',        label: 'Doctors'         },
          { value: 'Jan 2025', label: 'Active since'    },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl px-6 py-4 text-center">
            <p className="font-mono text-2xl text-primary">{s.value}</p>
            <p className="text-xs text-muted font-sans mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section 3 — Two col */}
      <div className="grid grid-cols-3 gap-6 px-8 py-6">

        {/* LEFT — Scan History */}
        <div className="col-span-2">
          <h3 className="font-display text-xl text-textMain mb-4">Scan History</h3>
          <div className="flex flex-col gap-3">
            {mockScans.map((scan) => (
              <div
                key={scan.id}
                className="bg-surface border border-border rounded-xl px-6 py-4 flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted font-sans">{scan.date}</span>
                  <span className="text-textMain font-sans font-medium text-sm">{scan.result}</span>
                  <span className={`self-start text-xs px-2 py-0.5 rounded-full font-sans capitalize mt-0.5 ${SEVERITY[scan.severity]}`}>
                    {scan.severity}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/results/${scan.scanId}`)}
                  className="border border-primary text-primary font-sans text-sm px-4 py-2 rounded-full hover:bg-primary hover:text-bg transition-all duration-200 flex-shrink-0"
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Dosha Trend */}
        <div className="col-span-1">
          <h3 className="font-display text-xl text-textMain mb-4">Dosha Trend</h3>
          <div className="bg-surface border border-border rounded-xl p-6">
            <p className="text-xs text-muted font-sans mb-4">Your dominant dosha over time</p>
            <div className="flex flex-col gap-3">
              {doshaTrend.map((row) => (
                <div key={row.month} className="flex items-center gap-3">
                  <span className="font-sans text-sm text-muted w-8">{row.month}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-sans font-medium ${row.cls}`}>
                    {row.dosha}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center mt-6 font-sans">
              Upgrade to PRO for full trend chart
            </p>
            <button
              onClick={() => navigate('/upgrade')}
              className="bg-primary text-bg font-sans font-medium text-sm px-5 py-2 rounded-full w-full mt-2 hover:bg-accent transition-all duration-200"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
