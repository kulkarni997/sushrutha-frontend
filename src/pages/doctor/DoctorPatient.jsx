import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const mock = {
  patientName: 'Ravi Kumar',
  sharedAt: 'Today, 9:41 AM',
  symptoms: 'Patient reports feeling bloated, fatigued, and experiencing dry skin for the past 2 weeks. Also mentions disturbed sleep and occasional anxiety.',
  vata: 58, pitta: 28, kapha: 14,
  severity: 'mild',
  pulseUsed: true,
  recipe: 'Ashwagandha — 500mg twice daily with warm milk before bed.\nTriphala — 1 tsp with lukewarm water at night.\nShatavari — 500mg once daily after meals.\n\nYoga: Balasana, Viparita Karani, Nadi Shodhana pranayama.'
}

export default function DoctorPatient() {
  const navigate = useNavigate()
  const { scanId } = useParams()
  const { user, logout } = useAuth()

  const severityColor = {
    mild: 'bg-neem/10 text-neem border-neem',
    moderate: 'bg-warning/10 text-warning border-warning',
    severe: 'bg-error/10 text-error border-error'
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-surface border-b border-border">
        <span onClick={() => navigate('/')} className="font-display text-xl text-primary cursor-pointer">SUSHRUTHA AI</span>
        <div className="flex items-center gap-6">
          <span className="font-sans text-sm text-muted">Dr {user?.name}</span>
          <button onClick={() => navigate('/doctor/dashboard')} className="font-sans text-sm text-muted hover:text-primary">Dashboard</button>
          <button onClick={logout} className="font-sans text-sm text-muted hover:text-error">Logout</button>
        </div>
      </nav>

      {/* Patient summary bar */}
      <div className="bg-surface border-b border-border px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-textMain">{mock.patientName}</h2>
          <p className="text-muted text-sm font-sans">Shared their report · {mock.sharedAt}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-orange-100 text-primary border border-primary">Vata {mock.vata}%</span>
          <span className="badge bg-surfaceAlt text-muted border border-border">Pitta {mock.pitta}%</span>
          <span className="badge bg-surfaceAlt text-muted border border-border">Kapha {mock.kapha}%</span>
          <span className={`badge border ${severityColor[mock.severity]} capitalize`}>{mock.severity}</span>
          <button className="btn-primary text-sm px-4 py-2">Finalise Report</button>
        </div>
      </div>

      {/* Main content */}
      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        {/* Left col */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Symptoms */}
          <div className="card">
            <h3 className="font-display text-xl text-textMain mb-3">Symptoms Reported</h3>
            <p className="font-sans text-sm text-muted leading-relaxed">{mock.symptoms}</p>
          </div>

          {/* AI Diagnosis */}
          <div className="card">
            <h3 className="font-display text-xl text-textMain mb-4">AI Diagnosis</h3>
            <div className="flex flex-col gap-3">
              {[['Vata', mock.vata, 'bg-primary'], ['Pitta', mock.pitta, 'bg-accent'], ['Kapha', mock.kapha, 'bg-neem']].map(([label, val, color]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-sans text-sm text-muted w-12">{label}</span>
                  <div className="flex-1 bg-surfaceAlt rounded-full h-3">
                    <div className={`${color} h-3 rounded-full`} style={{ width: `${val}%` }}></div>
                  </div>
                  <span className="font-mono text-sm text-textMain w-10 text-right">{val}%</span>
                </div>
              ))}
            </div>
            <p className="font-sans text-xs text-muted mt-4">Pulse data used: {mock.pulseUsed ? 'Yes' : 'No'}</p>
          </div>

          {/* Recipe */}
          <div className="card">
            <h3 className="font-display text-xl text-textMain mb-3">Herbal Recipe</h3>
            <p className="font-sans text-sm text-muted leading-relaxed whitespace-pre-line">{mock.recipe}</p>
          </div>
        </div>

        {/* Right col */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Override */}
          <div className="card">
            <h3 className="font-display text-xl text-textMain mb-4">Doctor Override</h3>
            <p className="font-sans text-xs text-muted mb-2">AI suggests: <span className="text-primary font-medium">Vata dominant</span></p>
            <select className="input mb-3">
              <option>Vata</option>
              <option>Pitta</option>
              <option>Kapha</option>
              <option>Tridosha</option>
            </select>
            <textarea className="input h-32 resize-none mb-3" placeholder="Add clinical notes..."></textarea>
            <button className="btn-outline w-full">Save Notes</button>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="font-display text-xl text-textMain mb-4">Actions</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/doctor/messages')} className="btn-outline w-full">Message Patient</button>
              <button className="btn-outline w-full">Export PDF</button>
              <button className="btn-primary w-full">Finalise Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
