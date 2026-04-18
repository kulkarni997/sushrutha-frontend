import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'

export default function DoctorWalkinReview() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [notes, setNotes] = useState('')
  const [override, setOverride] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const [finalising, setFinalising] = useState(false)
  const [finalised, setFinalised] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    api.get(`/doctor/walkin/${sessionId}`)
      .then(r => {
        setSession(r.data)
        const res = Array.isArray(r.data.results) ? r.data.results[0] : r.data.results
        if (!res) {
          setError('No diagnosis found for this session yet.')
        } else {
          setResult(res)
          setNotes(res.doctor_notes || '')
          setOverride(res.override_dosha || '')
          setFinalised(!!res.finalised)
        }
      })
      .catch(e => setError(e.response?.data?.detail || 'Failed to load session.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  async function saveNotes() {
    if (!result) return
    setSaving(true); setSavedMsg('')
    try {
      await api.patch(`/doctor/results/${result.id}`, {
        doctor_notes: notes,
        override_dosha: override || null,
      })
      setSavedMsg('Saved ✓')
      setTimeout(() => setSavedMsg(''), 2000)
    } catch (e) {
      setSavedMsg('Save failed')
    }
    setSaving(false)
  }

  async function finaliseReport() {
    if (!result || finalised) return
    setFinalising(true)
    try {
      // Save notes first, then finalise
      await api.patch(`/doctor/results/${result.id}`, {
        doctor_notes: notes,
        override_dosha: override || null,
      })
      await api.post(`/doctor/finalise/${result.id}`)
      setFinalised(true)
      setShowQR(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to finalise.')
    }
    setFinalising(false)
  }

  if (loading) return (
    <div style={S.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    </div>
  )

  const claimUrl = session?.claim_token
    ? `${window.location.origin}/claim?token=${session.claim_token}`
    : ''

  const effectiveDosha = override || (result && (() => {
    const scores = { Vata: result.vata_pct, Pitta: result.pitta_pct, Kapha: result.kapha_pct }
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
  })())

  const sevColors = {
    mild: { bg: 'rgba(74,124,89,0.15)', text: '#4A7C59', border: '#4A7C59' },
    moderate: { bg: 'rgba(196,132,90,0.15)', text: '#C4845A', border: '#C4845A' },
    severe: { bg: 'rgba(192,57,43,0.15)', text: '#C0392B', border: '#C0392B' },
  }
  const sev = result?.severity || 'mild'
  const sevC = sevColors[sev] || sevColors.mild

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <nav style={S.nav}>
        <Link to="/doctor/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.logo}>Walk-in Review</span>
        <span />
      </nav>

      <div style={S.container}>
        {error && !result ? (
          <div style={S.card}>
            <p style={{ color: '#C0392B', fontSize: '0.9rem', margin: 0 }}>{error}</p>
            <button onClick={() => navigate('/doctor/walkin')} style={{ ...S.btnPrimary, marginTop: '1rem' }}>
              New Walk-in
            </button>
          </div>
        ) : (
          <>
            {/* Patient header */}
            <div style={S.patientHeader}>
              <h1 style={S.title}>{session?.patient_name}</h1>
              <p style={S.subtitle}>Walk-in scan • {session?.symptoms_text || '—'}</p>
              {finalised && (
                <span style={S.finalisedBadge}>✓ Finalised</span>
              )}
            </div>

            {/* Dosha summary */}
            <div style={S.card}>
              <div style={{ ...S.severityPill, background: sevC.bg, color: sevC.text, borderColor: sevC.border }}>
                {sev.toUpperCase()} IMBALANCE
              </div>

              <h3 style={S.sectionTitle}>Dosha Profile</h3>
              <div style={S.doshaGrid}>
                {[
                  { name: 'Vata', val: result.vata_pct, color: '#E8A020' },
                  { name: 'Pitta', val: result.pitta_pct, color: '#C0392B' },
                  { name: 'Kapha', val: result.kapha_pct, color: '#4A7C59' },
                ].map(d => (
                  <div key={d.name} style={S.doshaItem}>
                    <div style={S.doshaLabel}>
                      <span>{d.name}{effectiveDosha === d.name && <span style={S.dominantTag}>Dominant</span>}</span>
                      <span style={{ color: d.color, fontWeight: 600 }}>{d.val}%</span>
                    </div>
                    <div style={S.barTrack}>
                      <div style={{ ...S.barFill, background: d.color, width: `${d.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {result.pulse_used && (
                <p style={{ color: '#A89880', fontSize: '0.82rem', marginTop: '1rem' }}>
                  ✓ Pulse sensor data included in this diagnosis
                </p>
              )}
            </div>

            {/* Recipe */}
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Generated Recipe</h3>
              <p style={S.recipeText}>{result.recipe_text || '—'}</p>
            </div>

            {/* Doctor controls */}
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Doctor Review</h3>

              <label style={S.label}>Override Dominant Dosha (optional)</label>
              <select
                value={override}
                onChange={e => setOverride(e.target.value)}
                disabled={finalised}
                style={S.select}
              >
                <option value="">No override — use AI result ({effectiveDosha})</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
              </select>

              <label style={{ ...S.label, marginTop: '1rem' }}>Doctor Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={finalised}
                placeholder="Your professional observations and recommendations..."
                style={S.textarea}
                rows={5}
              />

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
                {!finalised && (
                  <>
                    <button onClick={saveNotes} disabled={saving} style={S.btnSecondary}>
                      {saving ? 'Saving...' : 'Save Notes'}
                    </button>
                    <button onClick={finaliseReport} disabled={finalising} style={S.btnPrimary}>
                      {finalising ? 'Finalising...' : 'Finalise Report'}
                    </button>
                  </>
                )}
                {savedMsg && <span style={{ color: '#4A7C59', fontSize: '0.85rem' }}>{savedMsg}</span>}
              </div>
            </div>

            {/* QR code — shown after finalise */}
            {(finalised || showQR) && claimUrl && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Share With Patient</h3>
                <p style={S.qrHint}>
                  Patient scans this QR or opens the link to register and access their finalised report.
                  Link expires in 48 hours.
                </p>
                <div style={S.qrWrapper}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(claimUrl)}&bgcolor=1C1712&color=E8A020&margin=10`}
                    alt="Claim QR"
                    style={S.qrImg}
                  />
                </div>
                <div style={S.linkRow}>
                  <span style={S.linkText}>{claimUrl}</span>
                  <button onClick={() => navigator.clipboard.writeText(claimUrl)} style={S.copyBtn}>Copy</button>
                </div>
                <button onClick={() => navigate('/doctor/walkin')} style={{ ...S.btnPrimary, marginTop: '1.5rem' }}>
                  + New Walk-in Patient
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#0D0B08', color: '#F5EDD6', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  grain: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.04 },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem', borderBottom: '1px solid #2E2820', background: 'rgba(13,11,8,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  back: { color: '#A89880', textDecoration: 'none', fontSize: '0.9rem' },
  logo: { fontSize: '1rem', fontWeight: 700, color: '#E8A020' },
  container: { maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 },
  patientHeader: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  title: { fontSize: '2.2rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, margin: 0 },
  subtitle: { color: '#A89880', fontSize: '0.9rem', margin: 0 },
  finalisedBadge: { display: 'inline-block', marginTop: '0.5rem', background: 'rgba(74,124,89,0.15)', color: '#4A7C59', border: '1px solid #4A7C59', padding: '0.25rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', width: 'fit-content' },
  card: { background: '#1C1712', border: '1px solid #2E2820', borderRadius: '14px', padding: '1.6rem', marginBottom: '1rem' },
  sectionTitle: { fontSize: '0.78rem', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem', fontWeight: 600 },
  severityPill: { display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1.2rem' },
  doshaGrid: { display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  doshaItem: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  doshaLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' },
  dominantTag: { marginLeft: '0.5rem', background: 'rgba(232,160,32,0.15)', color: '#E8A020', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '999px', letterSpacing: '0.05em' },
  barTrack: { width: '100%', height: '6px', background: '#0D0B08', borderRadius: '999px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '999px', transition: 'width 0.4s ease' },
  recipeText: { color: '#D4C4A8', fontSize: '0.92rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  label: { display: 'block', color: '#6B5E50', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' },
  select: { width: '100%', background: '#0D0B08', border: '1px solid #2E2820', borderRadius: '8px', color: '#F5EDD6', padding: '0.65rem 0.75rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#0D0B08', border: '1px solid #2E2820', borderRadius: '8px', color: '#F5EDD6', padding: '0.75rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', boxSizing: 'border-box' },
  btnPrimary: { background: '#E8A020', color: '#0D0B08', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  btnSecondary: { background: '#2E2820', color: '#F5EDD6', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  qrHint: { color: '#A89880', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1rem' },
  qrWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  qrImg: { borderRadius: '12px', border: '1px solid #2E2820' },
  linkRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#0D0B08', border: '1px solid #2E2820', borderRadius: '8px', padding: '0.6rem 0.75rem' },
  linkText: { flex: 1, color: '#A89880', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: { background: '#2E2820', border: 'none', color: '#F5EDD6', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 },
}