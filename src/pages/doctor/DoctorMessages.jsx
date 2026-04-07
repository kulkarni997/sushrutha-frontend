import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const mockThreads = [
  {
    id: 1,
    name: 'Ravi Kumar',
    preview: 'Thank you doctor, I will follow the...',
    time: 'Today',
    unread: true,
  },
  {
    id: 2,
    name: 'Meena Patil',
    preview: 'When should I come for the follow...',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 3,
    name: 'Suresh Nair',
    preview: 'The ashwagandha is helping a lot',
    time: '2 days ago',
    unread: false,
  },
]

const mockMessages = [
  { id: 1, from: 'patient', text: 'Hello doctor, I have been experiencing the symptoms for 2 weeks now.', time: '10:00 AM' },
  { id: 2, from: 'doctor',  text: 'Hello Ravi. I reviewed your report. Your Vata is quite elevated. Please start with Ashwagandha.', time: '10:05 AM' },
  { id: 3, from: 'patient', text: 'Thank you doctor. Should I avoid any specific foods?', time: '10:08 AM' },
  { id: 4, from: 'doctor',  text: 'Yes, avoid cold and dry foods. Prefer warm, oily, and grounding foods like ghee and sesame.', time: '10:10 AM' },
  { id: 5, from: 'patient', text: 'Thank you doctor, I will follow the advice carefully.', time: '10:15 AM' },
]

export default function DoctorMessages() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [activeThread, setActiveThread] = useState(1)
  const [message, setMessage] = useState('')

  const active = mockThreads.find((t) => t.id === activeThread)

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-surface border-b border-border flex-shrink-0">
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

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">

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
            <p className="text-xs text-muted">Re: Scan report · Vata dominant</p>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.from === 'doctor' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-4 py-3 max-w-md rounded-xl ${
                    msg.from === 'doctor'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surface border border-border text-textMain rounded-tl-none'
                  }`}
                >
                  <p className="text-sm font-sans">{msg.text}</p>
                </div>
                <span className={`text-xs text-hint mt-1 ${msg.from === 'doctor' ? 'text-right' : ''}`}>
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
