import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'

const mockPatients = [
  { id: 1, name: 'Ravi Kumar',  dosha: 'Vata',  date: 'Today, 9:41 AM', severity: 'mild',     new: true  },
  { id: 2, name: 'Meena Patil', dosha: 'Pitta', date: 'Yesterday',       severity: 'moderate', new: false },
  { id: 3, name: 'Suresh Nair', dosha: 'Kapha', date: '2 days ago',      severity: 'severe',   new: false },
]

const DOSHA_BADGE = {
  Vata:  'bg-turmeric/20 text-turmeric',
  Pitta: 'bg-kumkum/20 text-kumkum',
  Kapha: 'bg-neem/20 text-neem',
}

const SEVERITY_DOT = {
  mild:     'bg-neem',
  moderate: 'bg-turmeric',
  severe:   'bg-kumkum',
}

// ─── Patient card ─────────────────────────────────────────────────────────────

function PatientCard({ patient, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-card p-4 hover:border-turmeric transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-sans font-medium text-cream text-sm">{patient.name}</span>
        {patient.new && (
          <span className="bg-turmeric text-bg text-xs px-2 py-0.5 rounded-full font-sans">
            NEW
          </span>
        )}
        <span className="text-hint text-xs ml-auto">{patient.date}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`${DOSHA_BADGE[patient.dosha]} text-xs px-2 py-0.5 rounded-full font-sans`}>
          {patient.dosha}
        </span>
        <span className={`${SEVERITY_DOT[patient.severity]} w-2 h-2 rounded-full ml-2`} />
        <span className="text-hint text-xs ml-1 capitalize">{patient.severity}</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  usePlan()

  const [toast, setToast] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  function showToast() {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Doctor'

  return (
    <div className="min-h-screen bg-bg text-cream font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded-card px-5 py-3 font-sans text-sm text-muted shadow-lg">
          Coming soon — export will be available in a future update.
        </div>
      )}

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="font-display text-turmeric text-xl tracking-widest">SUSHRUTHA AI</span>
        <div className="flex items-center gap-6">
          <span className="text-muted text-sm">{user?.name}</span>
          <button
            onClick={() => navigate('/doctor/analytics')}
            className="text-muted text-sm hover:text-cream transition-colors duration-200"
          >
            Analytics
          </button>
          <button
            onClick={handleLogout}
            className="text-hint text-xs hover:text-kumkum transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Heading */}
        <h1 className="font-display text-4xl text-cream mb-1">
          Good morning, {firstName}
        </h1>
        <p className="text-muted text-sm font-sans mb-8">Your clinic dashboard</p>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Shared reports */}
          <div>
            <h2 className="font-display text-2xl text-cream mb-4">Shared Reports</h2>

            {mockPatients.length > 0 ? (
              <div className="flex flex-col gap-3">
                {mockPatients.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    onClick={() => navigate(`/doctor/patient/${p.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-card p-8 text-center">
                <p className="text-muted text-sm font-sans">No reports shared yet.</p>
                <p className="text-muted text-sm font-sans mt-1">
                  Patients who find you on the map can share their scan reports here.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — Walk-in */}
          <div>
            <h2 className="font-display text-2xl text-cream mb-4">Walk-in Session</h2>

            <div className="bg-surface border border-border rounded-card p-8 flex flex-col items-center text-center gap-4">
              <span className="text-5xl">🏥</span>
              <h3 className="font-display text-2xl text-cream">Start a walk-in session</h3>
              <p className="font-sans text-sm text-muted max-w-xs leading-relaxed">
                Patient walked in without an appointment? Create a guest session and scan them
                right here using your clinic device.
              </p>
              <button
                onClick={() => navigate('/doctor/walkin')}
                className="bg-turmeric text-bg font-sans font-medium text-sm px-8 py-3 rounded-full w-full max-w-xs hover:bg-sandalwood transition-all duration-300"
              >
                New Walk-in Session
              </button>

              {/* Stats */}
              <div className="flex gap-6 justify-center mt-4">
                {[
                  { value: '12', label: 'Sessions this month' },
                  { value: '8',  label: 'Reports reviewed'   },
                  { value: '4',  label: 'Active patients'    },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <span className="font-mono text-2xl text-cream">{s.value}</span>
                    <span className="font-sans text-xs text-muted">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-4 mt-8 flex-wrap">
          <button
            onClick={() => navigate('/doctor/messages')}
            className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans hover:border-turmeric hover:text-cream transition-all duration-200"
          >
            Message Patients
          </button>
          <button
            onClick={() => navigate('/doctor/analytics')}
            className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans hover:border-turmeric hover:text-cream transition-all duration-200"
          >
            View Analytics
          </button>
          <button
            onClick={showToast}
            className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans hover:border-turmeric hover:text-cream transition-all duration-200"
          >
            Export Reports
          </button>
        </div>

      </div>
    </div>
  )
}
