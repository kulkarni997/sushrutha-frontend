import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const mockThreads = [
  {
    id: 1,
    name: 'Dr Kulkarni',
    preview: 'Yes, avoid cold and dry foods...',
    time: 'Today',
    unread: true,
  },
  {
    id: 2,
    name: 'Dr Sharma',
    preview: 'Please come for follow-up next...',
    time: 'Yesterday',
    unread: false,
  },
]

const mockMessages = [
  { id: 1, from: 'doctor',  text: 'Hello. I reviewed your report. Your Vata is quite elevated. Please start with Ashwagandha 500mg twice daily.', time: '10:05 AM' },
  { id: 2, from: 'patient', text: 'Thank you doctor. Should I avoid any specific foods?', time: '10:08 AM' },
  { id: 3, from: 'doctor',  text: 'Yes, avoid cold and dry foods. Prefer warm, oily, grounding foods like ghee and sesame.', time: '10:10 AM' },
  { id: 4, from: 'patient', text: 'Thank you doctor, I will follow the advice carefully.', time: '10:15 AM' },
  { id: 5, from: 'doctor',  text: 'Great. Please come back after 2 weeks and we can review your progress.', time: '10:20 AM' },
]

export default function Messages() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [activeThread, setActiveThread] = useState(1)
  const [message, setMessage] = useState('')

  function handleLogout() {
    logout()
    navigate('/')
  }

  const active = mockThreads.find((t) => t.id === activeThread)

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0" style={{ height: '64px' }}>
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

      {/* Two-column layout */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* LEFT — Thread list */}
        <div className="w-80 border-r border-border bg-surface flex flex-col overflow-y-auto flex-shrink-0">
          <div className="px-6 py-4 border-b border-border flex-shrink-0">
            <h2 className="font-display text-xl text-textMain">Messages</h2>
          </div>

          {mockThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className={`px-6 py-4 border-b border-border cursor-pointer hover:bg-bg transition-colors duration-150 ${
                activeThread === thread.id
                  ? 'bg-orange-50 border-l-2 border-primary'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-medium text-textMain">{thread.name}</span>
                  {thread.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-hint">{thread.time}</span>
              </div>
              <p className="text-xs text-muted truncate">{thread.preview}</p>
            </div>
          ))}
        </div>

        {/* RIGHT — Active thread */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Thread header */}
          <div className="px-6 py-4 bg-surface border-b border-border flex-shrink-0">
            <h3 className="font-display text-xl text-textMain">{active?.name}</h3>
            <p className="text-xs text-muted">Re: Your Ayurvedic scan · Vata dominant</p>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.from === 'patient' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-4 py-3 max-w-md rounded-xl ${
                    msg.from === 'patient'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surfaceAlt text-textMain rounded-tl-none'
                  }`}
                >
                  <p className="text-sm font-sans">{msg.text}</p>
                </div>
                <span className={`text-xs text-hint mt-1 ${msg.from === 'patient' ? 'text-right' : ''}`}>
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="px-6 py-4 bg-surface border-t border-border flex gap-3 flex-shrink-0">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="input flex-1 h-12 resize-none"
            />
            <button
              onClick={() => setMessage('')}
              className="btn-primary px-6"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
