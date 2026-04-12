import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'

export default function Messages() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { threadId } = useParams()

  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/messages')
      .then(r => {
        const t = r.data || []
        setThreads(t)
        if (threadId) {
          const found = t.find(th => th.thread_id === threadId)
          if (found) setActiveThread(found)
        } else if (t.length > 0) {
          setActiveThread(t[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeThread) return
    api.get(`/messages/${activeThread.thread_id}`)
      .then(r => setMessages(r.data || []))
      .catch(console.error)
  }, [activeThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!body.trim() || !activeThread) return
    setSending(true)
    try {
      const res = await api.post('/messages', {
        receiver_id: activeThread.other_user_id,
        scan_id: activeThread.scan_id,
        body: body.trim()
      })
      setMessages(prev => [...prev, res.data])
      setBody('')
    } catch (e) { console.error(e) }
    setSending(false)
  }

  function handleLogout() { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col">
      <nav className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0" style={{ height: '64px' }}>
        <span className="font-display text-primary text-xl tracking-widest">SUSHRUTHA AI</span>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-hint text-xs hover:text-error transition-colors duration-200">Logout</button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* Thread list */}
        <div className="w-80 border-r border-border bg-surface flex flex-col overflow-y-auto flex-shrink-0">
          <div className="px-6 py-4 border-b border-border flex-shrink-0">
            <h2 className="font-display text-xl text-textMain">Messages</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : threads.length === 0 ? (
            <p className="text-muted text-sm font-sans px-6 py-4">No conversations yet.</p>
          ) : threads.map((thread) => (
            <div
              key={thread.thread_id}
              onClick={() => setActiveThread(thread)}
              className={`px-6 py-4 border-b border-border cursor-pointer hover:bg-bg transition-colors duration-150 ${
                activeThread?.thread_id === thread.thread_id ? 'bg-orange-50 border-l-2 border-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-sm font-medium text-textMain">{thread.other_name || 'User'}</span>
              </div>
              <p className="text-xs text-muted truncate">{thread.last_message || 'No messages yet'}</p>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeThread ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted font-sans text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-surface border-b border-border flex-shrink-0">
                <h3 className="font-display text-xl text-textMain">{activeThread.other_name || 'User'}</h3>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user.id
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 max-w-md rounded-xl ${isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-surface text-textMain rounded-tl-none border border-border'}`}>
                        <p className="text-sm font-sans">{msg.body}</p>
                      </div>
                      <span className="text-xs text-hint mt-1">
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <div className="px-6 py-4 bg-surface border-t border-border flex gap-3 flex-shrink-0">
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 h-12 resize-none bg-bg border border-border rounded-card px-4 py-2 text-sm text-textMain font-sans focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !body.trim()}
                  className="bg-primary text-bg px-6 rounded-card font-sans text-sm disabled:opacity-50"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}