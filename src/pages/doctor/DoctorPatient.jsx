import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function DoctorPatient() {
  const { user } = useContext(AuthContext)
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [overrideDosha, setOverrideDosha] = useState('')
  const [saving, setSaving] = useState(false)
  const [finalising, setFinalising] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'doctor') { navigate('/unauthorized'); return }
    api.get(`/doctor/patient/${scanId}`)
      .then(r => {
        setScan(r.data)
        const result = Array.isArray(r.data.results) ? r.data.results[0] : r.data.results
        setNotes(result?.doctor_notes || '')
        setOverrideDosha(result?.override_dosha || '')
      })
      .catch(() => navigate('/doctor/dashboard'))
      .finally(() => setLoading(false))
  }, [scanId])

  const result = scan ? (Array.isArray(scan.results) ? scan.results[0] : scan.results) : null
  const sevColor = { mild: '#4A7C59', moderate: '#C4845A', severe: '#C0392B' }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      await api.patch(`/doctor/results/${result.id}`, { doctor_notes: notes, override_dosha: overrideDosha || null })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleFinalise() {
    if (!result) return
    setFinalising(true)
    try {
      await api.post(`/doctor/finalise/${result.id}`)
      setScan(prev => ({ ...prev, results: [{ ...result, finalised: true }] }))
    } catch (e) { console.error(e) }
    setFinalising(false)
  }

  async function handleDownloadPDF() {
    if (!result) return
    try {
      const res = await api.get(`/doctor/report/${result.id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url
      a.download = `sushrutha_report_${result.id.slice(0, 8)}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
  }

  if (loading) return <div style={S.page}><p style={{ padding: '2rem', color: '#6B5E50' }}>Loading...</p></div>

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <nav style={S.nav}>
        <Link to="/doctor/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.logo}>Patient Report</span>
        <span />
      </nav>
      <div style={S.container}>
        <div style={S.header}>
          <div>
            <p style={S.greeting}>Scan Report</p>
            <h1 style={S.name}>{scan?.users?.full_name || 'Patient'}</h1>
            <p style={S.meta}>{scan?.symptoms_text || '—'}</p>
          </div>
          {result?.finalised
            ? <span style={S.badgeFinalised}>Finalised</span>
            : <span style={S.badgePending}>Pending Review</span>}
        </div>

        {result ? (<>
          <div style={S.card}>
            <h3 style={S.cardTitle}>Dosha Analysis</h3>
            <div style={S.doshaRow}>
              {[['Vata', result.vata_pct, '#E8A020'], ['Pitta', result.pitta_pct, '#C0392B'], ['Kapha', result.kapha_pct, '#4A7C59']].map(([l, v, c]) => (
                <div key={l} style={S.doshaCard}>
                  <span style={{ ...S.doshaVal, color: c }}>{v}%</span>
                  <span style={S.doshaLabel}>{l}</span>
                  <div style={S.doshaBar}><div style={{ ...S.doshaFill, width: `${v}%`, background: c }} /></div>
                </div>
              ))}
            </div>
            <div style={S.sevRow}>
              <span style={S.sevLabel}>Severity</span>
              <span style={{ ...S.sevBadge, color: sevColor[result.severity], borderColor: sevColor[result.severity] }}>
                {result.severity?.charAt(0).toUpperCase() + result.severity?.slice(1)}
              </span>
              {result.pulse_used && <span style={S.pulseBadge}>Pulse included</span>}
            </div>
          </div>

          {result.recipe_text && (
            <div style={S.card}>
              <h3 style={S.cardTitle}>Herbal Recipe</h3>
              <p style={S.recipeText}>{result.recipe_text}</p>
            </div>
          )}

          {!result.finalised && (
            <div style={S.card}>
              <h3 style={S.cardTitle}>Doctor Review</h3>
              <label style={S.label}>Override Dominant Dosha</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['', 'Vata', 'Pitta', 'Kapha'].map(d => (
                  <button key={d} onClick={() => setOverrideDosha(d)}
                    style={{ ...S.doshaBtn, ...(overrideDosha === d ? S.doshaBtnActive : {}) }}>
                    {d || 'None'}
                  </button>
                ))}
              </div>
              <label style={S.label}>Doctor Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add clinical observations, treatment plan, follow-up..."
                style={S.textarea} rows={4} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
                <button onClick={handleSave} disabled={saving} style={S.saveBtn}>
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Notes'}
                </button>
                <button onClick={handleFinalise} disabled={finalising} style={S.finaliseBtn}>
                  {finalising ? 'Finalising...' : 'Finalise Report'}
                </button>
              </div>
              <p style={{ color: '#6B5E50', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                Finalising notifies the patient their report is ready.
              </p>
            </div>
          )}

          {result.finalised && (notes || overrideDosha) && (
            <div style={S.card}>
              <h3 style={S.cardTitle}>Doctor Notes</h3>
              {overrideDosha && <p style={{ color: '#E8A020', fontSize: '0.9rem' }}>Override: <strong>{overrideDosha}</strong></p>}
              {notes && <p style={S.recipeText}>{notes}</p>}
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button onClick={handleDownloadPDF} style={S.pdfBtn}>⬇ Download PDF Report</button>
          </div>
        </>) : (
          <div style={S.card}><p style={{ color: '#6B5E50' }}>No diagnosis result found.</p></div>
        )}
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
  container: { maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  greeting: { color: '#6B5E50', fontSize: '0.8rem', margin: '0 0 0.25rem' },
  name: { fontSize: '2rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, margin: '0 0 0.4rem' },
  meta: { color: '#A89880', fontSize: '0.9rem', margin: 0 },
  badgeFinalised: { background: 'rgba(74,124,89,0.2)', color: '#4A7C59', border: '1px solid #4A7C59', padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 },
  badgePending: { background: 'rgba(196,132,90,0.15)', color: '#C4845A', border: '1px solid #C4845A', padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 },
  card: { background: '#1C1712', border: '1px solid #2E2820', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' },
  cardTitle: { fontSize: '0.78rem', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1.2rem', fontWeight: 600 },
  doshaRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' },
  doshaCard: { background: '#0D0B08', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  doshaVal: { fontSize: '1.8rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 },
  doshaLabel: { fontSize: '0.8rem', color: '#6B5E50' },
  doshaBar: { height: '4px', background: '#2E2820', borderRadius: '2px', marginTop: '0.4rem' },
  doshaFill: { height: '100%', borderRadius: '2px' },
  sevRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  sevLabel: { color: '#6B5E50', fontSize: '0.82rem' },
  sevBadge: { border: '1px solid', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  pulseBadge: { background: 'rgba(74,124,89,0.15)', color: '#4A7C59', border: '1px solid #4A7C59', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem' },
  recipeText: { color: '#A89880', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 },
  label: { display: 'block', color: '#6B5E50', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' },
  doshaBtn: { background: '#0D0B08', border: '1px solid #2E2820', color: '#A89880', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  doshaBtnActive: { background: 'rgba(232,160,32,0.15)', border: '1px solid #E8A020', color: '#E8A020' },
  textarea: { width: '100%', background: '#0D0B08', border: '1px solid #2E2820', borderRadius: '8px', color: '#F5EDD6', padding: '0.75rem', fontSize: '0.9rem', resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
  saveBtn: { background: '#2E2820', color: '#F5EDD6', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  finaliseBtn: { background: '#E8A020', color: '#0D0B08', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  pdfBtn: { background: 'none', border: '1px solid #2E2820', color: '#A89880', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
}