import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

const TYPE_CONFIG = {
  report_finalised: { icon: '✓', iconCls: 'bg-neem/10 text-neem' },
  new_message:      { icon: '💬', iconCls: 'bg-primary/10 text-primary' },
  report_shared:    { icon: '📋', iconCls: 'bg-primary/10 text-primary' },
  claim_available:  { icon: '🔗', iconCls: 'bg-primary/10 text-primary' },
  default:          { icon: '🔔', iconCls: 'bg-surface text-muted' },
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

export default function Notifications() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifications(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))

    // Mark all as seen
    api.patch('/notifications/seen').catch(() => {})
  }, [])

  function handleLogout() { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <nav className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="font-display text-primary text-xl tracking-widest">SUSHRUTHA AI</span>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-hint text-xs hover:text-error transition-colors duration-200">Logout</button>
        </div>
      </nav>

      <h1 className="font-display text-4xl text-textMain px-8 pt-8 pb-2">Notifications</h1>
      <p className="text-muted font-sans text-sm px-8 mb-6">Your recent activity</p>

      <div className="max-w-2xl mx-auto px-8">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-6 py-10 text-center">
            <p className="text-muted font-sans text-sm">No notifications yet.</p>
          </div>
        ) : notifications.map((n) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default
          return (
            <div
              key={n.id}
              onClick={() => n.reference_id && navigate(`/results/${n.reference_id}`)}
              className={`bg-surface border border-border rounded-xl px-6 py-4 mb-3 flex items-start gap-4 ${
                !n.seen ? 'border-l-2 border-primary' : ''
              } ${n.reference_id ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconCls}`}>
                <span className="text-base leading-none">{cfg.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-textMain">{n.type?.replace(/_/g, ' ')}</p>
                <p className="font-sans text-xs text-muted mt-1">{n.reference_id ? `Scan ID: ${n.reference_id.slice(0, 8)}...` : ''}</p>
                <p className="font-sans text-xs text-hint mt-2">{formatTime(n.created_at)}</p>
              </div>
              {!n.seen && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}