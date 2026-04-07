import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const mockNotifications = [
  {
    id: 1,
    type: 'finalised',
    icon: '✓',
    iconCls: 'bg-neem/10 text-neem',
    title: 'Dr Kulkarni reviewed your report',
    description: 'Your Vata scan from Jan 15 has been finalised.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: 2,
    type: 'new_message',
    icon: '💬',
    iconCls: 'bg-accent/10 text-accent',
    title: 'New message from Dr Kulkarni',
    description: 'Yes, avoid cold and dry foods...',
    time: '25 mins ago',
    unread: true,
  },
  {
    id: 3,
    type: 'report_shared',
    icon: '📋',
    iconCls: 'bg-primary/10 text-primary',
    title: 'Report shared successfully',
    description: 'You shared your Jan 15 scan with Dr Kulkarni.',
    time: 'Today 9:41 AM',
    unread: false,
  },
  {
    id: 4,
    type: 'finalised',
    icon: '✓',
    iconCls: 'bg-neem/10 text-neem',
    title: 'Dr Sharma finalised your report',
    description: 'Your Dec 20 scan report is ready.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 5,
    type: 'report_shared',
    icon: '📋',
    iconCls: 'bg-primary/10 text-primary',
    title: 'Walk-in scan available',
    description: "Scan from Dr Kulkarni's clinic. Claim your report.",
    time: '2 days ago',
    unread: false,
  },
]

export default function Notifications() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg font-sans">

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

      {/* Page title */}
      <h1 className="font-display text-4xl text-textMain px-8 pt-8 pb-2">Notifications</h1>
      <p className="text-muted font-sans text-sm px-8 mb-6">Your recent activity</p>

      {/* Notification list */}
      <div className="max-w-2xl mx-auto px-8">
        {mockNotifications.map((n) => (
          <div
            key={n.id}
            className={`bg-surface border border-border rounded-xl px-6 py-4 mb-3 flex items-start gap-4 ${
              n.unread ? 'border-l-2 border-primary' : ''
            }`}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.iconCls}`}>
              <span className="text-base leading-none">{n.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-medium text-textMain">{n.title}</p>
              <p className="font-sans text-xs text-muted mt-1">{n.description}</p>
              <p className="font-sans text-xs text-hint mt-2">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
