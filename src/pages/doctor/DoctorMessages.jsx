import { useContext, useEffect, useState, useRef } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function DoctorMessages() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [threads, setThreads] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user || user.role !== 'doctor') { navigate('/unauthorized'); return }
    api.get('/messages').then(r => setThreads(r.data || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    api.get(`/messages/${selected.thread_id}`).then(r => setMessages(r.data || [])).catch(console.error)
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!body.trim() || !selected) return
    setSending(true)
    try {
      const res = await api.post('/messages', {
        receiver_id: selected.other_user_id,
        scan_id: selected.scan_id,
        body: body.trim()
      })
      setMessages(prev => [...prev, res.data])
      setBody('')
    } catch (e) { console.error(e) }
    setSending(false)
  }

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <nav style={S.nav}>
        <Link to="/doctor/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.logo}>Messages</span>
        <span />
      </nav>

      <div style={S.layout}>
        {/* Thread list */}
        <div style={S.sidebar}>
          <p style={S.sidebarTitle}>Conversations</p>
          {loading ? <p style={S.muted}>Loading...</p> :
            threads.length === 0 ? <p style={S.muted}>No conversations yet.</p> :
            threads.map(t => (
              <div key={t.thread_id} onClick={() => setSelected(t)}
                style={{ ...S.thread, ...(selected?.thread_id === t.thread_id ? S.threadActive : {}) }}>
                <div style={S.threadAvatar}>{(t.other_name || 'P')[0].toUpperCase()}</div>
                <div>
                  <p style={S.threadName}>{t.other_name || 'Patient'}</p>
                  <p style={S.threadPreview}>{t.last_message || 'No messages yet'}</p>
                </div>
              </div>
            ))
          }
        </div>

        {/* Chat area */}
        <div style={S.chat}>
          {!selected ? (
            <div style={S.empty}>
              <p style={S.emptyIcon}>💬</p>
              <p style={S.emptyText}>Select a conversation</p>
              <p style={S.muted}>You can message patients after they share a report with you.</p>
            </div>
          ) : (
            <>
              <div style={S.chatHeader}>
                <p style={S.chatName}>{selected.other_name || 'Patient'}</p>
              </div>
              <div style={S.messages}>
                {messages.map(m => {
                  const isMine = m.sender_id === user.id
                  return (
                    <div key={m.id} style={{ ...S.msgRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ ...S.bubble, ...(isMine ? S.bubbleMine : S.bubbleTheirs) }}>
                        <p style={S.bubbleText}>{m.body}</p>
                        <p style={S.bubbleTime}>{new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div style={S.inputRow}>
                <input
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  style={S.input}
                />
                <button onClick={handleSend} disabled={sending || !body.trim()} style={S.sendBtn}>
                  {sending ? '...' : '→'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0B08', color: '#F5EDD6', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem', borderBottom: '1px solid #2E2820', background: 'rgba(13,11,8,0.9)', backdropFilter: 'blur(12px)', zIndex: 100, flexShrink: 0 },
  back: { color: '#A89880', textDecoration: 'none', fontSize: '0.9rem' },
  logo: { fontSize: '1rem', fontWeight: 700, color: '#E8A020' },
  layout: { display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 },
  sidebar: { width: '280px', borderRight: '1px solid #2E2820', overflowY: 'auto', padding: '1rem 0', flexShrink: 0 },
  sidebarTitle: { color: '#6B5E50', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 1.2rem', marginBottom: '0.75rem' },
  muted: { color: '#6B5E50', fontSize: '0.85rem', padding: '0 1.2rem' },
  thread: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.2rem', cursor: 'pointer', borderBottom: '1px solid #1C1712' },
  threadActive: { background: '#1C1712', borderLeft: '2px solid #E8A020' },
  threadAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(232,160,32,0.15)', color: '#E8A020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  threadName: { color: '#F5EDD6', fontSize: '0.9rem', fontWeight: 600, margin: 0 },
  threadPreview: { color: '#6B5E50', fontSize: '0.78rem', margin: '0.15rem 0 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '180px' },
  chat: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  emptyIcon: { fontSize: '2.5rem', margin: 0 },
  emptyText: { color: '#A89880', fontSize: '1.1rem', margin: 0 },
  chatHeader: { padding: '1rem 1.5rem', borderBottom: '1px solid #2E2820', background: '#0D0B08' },
  chatName: { color: '#F5EDD6', fontWeight: 600, margin: 0 },
  messages: { flex: 1, overflowY: 'auto', padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  msgRow: { display: 'flex' },
  bubble: { maxWidth: '70%', padding: '0.65rem 0.9rem', borderRadius: '12px' },
  bubbleMine: { background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.3)', borderBottomRightRadius: '4px' },
  bubbleTheirs: { background: '#1C1712', border: '1px solid #2E2820', borderBottomLeftRadius: '4px' },
  bubbleText: { color: '#F5EDD6', fontSize: '0.9rem', margin: '0 0 0.3rem', lineHeight: 1.5 },
  bubbleTime: { color: '#6B5E50', fontSize: '0.7rem', margin: 0, textAlign: 'right' },
  inputRow: { display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #2E2820', background: '#0D0B08' },
  input: { flex: 1, background: '#1C1712', border: '1px solid #2E2820', borderRadius: '8px', color: '#F5EDD6', padding: '0.65rem 1rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" },
  sendBtn: { background: '#E8A020', color: '#0D0B08', border: 'none', width: '42px', height: '42px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' },
}