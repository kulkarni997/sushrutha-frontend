import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function DoctorWalkin() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [patientName, setPatientName] = useState('')
  const [session, setSession] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [claimUrl, setClaimUrl] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'doctor') navigate('/unauthorized')
  }, [])

  async function handleCreate() {
    if (!patientName.trim()) { setError('Please enter the patient name.'); return }
    setCreating(true); setError('')
    try {
      const res = await api.post('/doctor/walkin', { patient_name: patientName.trim() })
      setSession(res.data)
      const base = window.location.origin
      setClaimUrl(`${base}/claim?token=${res.data.claim_token}`)
    } catch (e) {
      setError('Failed to create session. Please try again.')
    }
    setCreating(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(claimUrl)
  }

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <nav style={S.nav}>
        <Link to="/doctor/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.logo}>Walk-in Session</span>
        <span />
      </nav>

      <div style={S.container}>
        <h1 style={S.title}>New Walk-in Patient</h1>
        <p style={S.subtitle}>Create a session for a patient without an account.</p>

        {!session ? (
          <div style={S.card}>
            <label style={S.label}>Patient Name</label>
            <input
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Ramesh Kumar"
              style={S.input}
            />
            {error && <p style={S.error}>{error}</p>}
            <button onClick={handleCreate} disabled={creating} style={S.createBtn}>
              {creating ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        ) : (
          <div style={S.card}>
            <div style={S.successRow}>
              <div style={S.successDot} />
              <p style={S.successText}>Session created for <strong style={{ color: '#F5EDD6' }}>{session.patient_name}</strong></p>
            </div>

            <div style={S.qrSection}>
              <p style={S.qrLabel}>Claim Link</p>
              <p style={S.qrHint}>
                Share this link with the patient after the session. They can scan the QR or
                open the link to register and access their report. Link expires in 48 hours.
              </p>

              {/* QR code via Google Charts API */}
              <div style={S.qrWrapper}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(claimUrl)}&bgcolor=1C1712&color=E8A020&margin=10`}
                  alt="Claim QR Code"
                  style={S.qrImg}
                />
              </div>

              <div style={S.linkRow}>
                <span style={S.linkText}>{claimUrl}</span>
                <button onClick={handleCopy} style={S.copyBtn}>Copy</button>
              </div>
            </div>

            <div style={S.tokenInfo}>
              <span style={S.tokenLabel}>Session ID</span>
              <span style={S.tokenVal}>{session.id?.slice(0, 8)}...</span>
              <span style={S.tokenLabel}>Expires</span>
              <span style={S.tokenVal}>48 hours</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => { setSession(null); setPatientName('') }} style={S.newBtn}>
                + New Patient
              </button>
              <button onClick={() => navigate(`/doctor/walkin/${session.id}`)} style={S.viewBtn}>
                View Session
              </button>
            </div>
          </div>
        )}

        <div style={S.infoCard}>
          <h3 style={S.infoTitle}>How walk-in works</h3>
          <div style={S.steps}>
            {[
              ['1', 'Create a session with the patient\'s name'],
              ['2', 'Run the full Ayurvedic scan (tongue, voice, pulse sensor)'],
              ['3', 'Review results, add notes, and finalise the report'],
              ['4', 'Share the QR / claim link — patient can register to access their report'],
              ['5', 'Patient\'s scan appears in their profile once they claim it'],
            ].map(([n, t]) => (
              <div key={n} style={S.step}>
                <span style={S.stepNum}>{n}</span>
                <span style={S.stepText}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#0D0B08', color: '#F5EDD6', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem', borderBottom: '1px solid #2E2820', background: 'rgba(13,11,8,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  back: { color: '#A89880', textDecoration: 'none', fontSize: '0.9rem' },
  logo: { fontSize: '1rem', fontWeight: 700, color: '#E8A020' },
  container: { maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 },
  title: { fontSize: '2rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, margin: '0 0 0.25rem' },
  subtitle: { color: '#6B5E50', fontSize: '0.9rem', margin: '0 0 2rem' },
  card: { background: '#1C1712', border: '1px solid #2E2820', borderRadius: '14px', padding: '1.8rem', marginBottom: '1rem' },
  label: { display: 'block', color: '#6B5E50', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' },
  input: { width: '100%', background: '#0D0B08', border: '1px solid #2E2820', borderRadius: '8px', color: '#F5EDD6', padding: '0.75rem 1rem', fontSize: '1rem', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', marginBottom: '1rem' },
  error: { color: '#C0392B', fontSize: '0.85rem', marginBottom: '0.75rem', margin: '0 0 0.75rem' },
  createBtn: { background: '#E8A020', color: '#0D0B08', border: 'none', padding: '0.7rem 1.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' },
  successRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' },
  successDot: { width: 10, height: 10, borderRadius: '50%', background: '#4A7C59', flexShrink: 0 },
  successText: { color: '#A89880', fontSize: '0.95rem' },
  qrSection: {},
  qrLabel: { color: '#6B5E50', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  qrHint: { color: '#A89880', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1.2rem' },
  qrWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' },
  qrImg: { borderRadius: '12px', border: '1px solid #2E2820' },
  linkRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#0D0B08', border: '1px solid #2E2820', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '1.2rem' },
  linkText: { flex: 1, color: '#A89880', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: { background: '#2E2820', border: 'none', color: '#F5EDD6', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 },
  tokenInfo: { display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '0.4rem 0.75rem', alignItems: 'center' },
  tokenLabel: { color: '#6B5E50', fontSize: '0.78rem' },
  tokenVal: { color: '#A89880', fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace" },
  newBtn: { background: '#2E2820', color: '#F5EDD6', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  viewBtn: { background: 'none', color: '#E8A020', border: '1px solid #E8A020', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  infoCard: { background: '#1C1712', border: '1px solid #2E2820', borderRadius: '14px', padding: '1.5rem', marginTop: '1rem' },
  infoTitle: { fontSize: '0.78rem', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem', fontWeight: 600 },
  steps: { display: 'flex', flexDirection: 'column', gap: '0.7rem' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  stepNum: { background: 'rgba(232,160,32,0.15)', color: '#E8A020', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 },
  stepText: { color: '#A89880', fontSize: '0.88rem', lineHeight: 1.5, paddingTop: '0.15rem' },
}