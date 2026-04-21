import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function DoctorDashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'doctor') { navigate('/unauthorized'); return }
    Promise.all([
      api.get('/doctor/patients'),
      api.get('/doctor/analytics'),
    ]).then(([pRes, aRes]) => {
      setPatients(pRes.data || [])
      setAnalytics(aRes.data || null)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const pending   = patients.filter(p => !p.results?.[0]?.finalised)
  const finalised = patients.filter(p =>  p.results?.[0]?.finalised)

  return (
    <div style={s.page}>
      <div style={s.grain} />
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span>🌿</span>
          <span style={s.logoText}>Sushrutha</span>
        </div>
        <nav style={s.nav}>
          {NAV.map(n => (
            <Link key={n.path} to={n.path} style={s.navItem}>
              <span>{n.icon}</span><span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.doctorCard}>
            <div style={s.avatar}>{user?.name?.[0] || 'D'}</div>
            <div>
              <div style={s.doctorName}>{user?.name}</div>
              <div style={s.doctorRole}>BAMS Practitioner</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={s.logoutBtn}>Sign out</button>
        </div>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.greeting}>Good day, Dr. {user?.name?.split(' ')[0]}</h1>
            <p style={s.sub}>Your practice overview</p>
          </div>
          <button onClick={() => navigate('/doctor/walkin')} style={s.walkinBtn}>+ New Walk-in</button>
        </header>

        {analytics && (
          <div style={s.statsRow}>
            <StatCard label="Total Scans"    value={analytics.total_scans}                    color="#E8A020" />
            <StatCard label="Pending Review" value={analytics.pending}                        color="#C4845A" />
            <StatCard label="Finalised"      value={analytics.finalised}                      color="#4A7C59" />
            <StatCard label="Severe Cases"   value={analytics.severity_breakdown?.severe || 0} color="#C0392B" />
          </div>
        )}

        <Section title="Pending Review" count={pending.length} color="#C4845A">
          {loading ? <Empty text="Loading..." /> :
           pending.length === 0 ? <Empty text="All caught up ✓" /> :
           pending.map(s => <PatientRow key={s.id} scan={s} navigate={navigate} />)}
        </Section>

        <Section title="Finalised Reports" count={finalised.length} color="#4A7C59">
          {finalised.length === 0 ? <Empty text="No finalised reports yet" /> :
           finalised.map(s => <PatientRow key={s.id} scan={s} navigate={navigate} done />)}
        </Section>
      </main>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ ...s.statVal, color }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  )
}

function Section({ title, count, color, children }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#C4845A' }}>{title}</h2>
        <span style={{ background: color, color: '#0D0B08', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </section>
  )
}

function Empty({ text }) {
  return <p style={{ color: '#6B5E50', fontSize: 14, margin: 0 }}>{text}</p>
}

function PatientRow({ scan, navigate, done }) {
  const r = scan.results?.[0]
  const dominant = r ? ['Vata','Pitta','Kapha'].reduce((a,b) =>
    (r[`${a.toLowerCase()}_pct`]||0) >= (r[`${b.toLowerCase()}_pct`]||0) ? a : b) : '—'
  const sev = r?.severity || '—'
  const sevColor = { mild:'#4A7C59', moderate:'#C4845A', severe:'#C0392B' }[sev] || '#A89880'
  return (
    <div style={s.row} onClick={() => navigate(`/doctor/patient/${scan.id}`)}>
      <div style={s.rowAvatar}>{(scan.users?.full_name||'P')[0].toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F5EDD6' }}>{scan.users?.full_name || 'Patient'}</div>
        <div style={{ fontSize: 12, color: '#6B5E50', marginTop: 2 }}>
          {new Date(scan.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
        </div>
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <span style={s.doshaTag}>{dominant}</span>
        <span style={{ ...s.sevTag, color: sevColor, borderColor: sevColor }}>{sev}</span>
        {done && <span style={s.doneTag}>✓ Done</span>}
      </div>
      <span style={{ color:'#6B5E50', fontSize:20 }}>›</span>
    </div>
  )
}

const NAV = [
  { path:'/doctor/dashboard', icon:'*', label:'Dashboard' },
  { path:'/doctor/analytics', icon:'o', label:'Analytics' },
  { path:'/doctor/walkin',    icon:'+', label:'Walk-in'   },
]

const s = {
  page:{ display:'flex', minHeight:'100vh', background:'#0D0B08', color:'#F5EDD6', fontFamily:'"DM Sans",sans-serif', position:'relative' },
  grain:{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.04, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` },
  sidebar:{ width:220, background:'#1C1712', borderRight:'1px solid #2E2820', display:'flex', flexDirection:'column', padding:'28px 0', position:'sticky', top:0, height:'100vh', zIndex:10 },
  logo:{ display:'flex', alignItems:'center', gap:10, padding:'0 24px 32px' },
  logoText:{ fontSize:18, fontWeight:700, color:'#E8A020', fontFamily:'"Cormorant Garamond",serif', letterSpacing:1 },
  nav:{ display:'flex', flexDirection:'column', gap:2, padding:'0 12px', flex:1 },
  navItem:{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:8, color:'#A89880', textDecoration:'none', fontSize:14 },
  sidebarBottom:{ padding:'0 16px', display:'flex', flexDirection:'column', gap:12 },
  doctorCard:{ display:'flex', alignItems:'center', gap:10, padding:12, background:'#0D0B08', borderRadius:10 },
  avatar:{ width:36, height:36, borderRadius:'50%', background:'#E8A020', color:'#0D0B08', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 },
  doctorName:{ fontSize:13, fontWeight:600, color:'#F5EDD6' },
  doctorRole:{ fontSize:11, color:'#6B5E50' },
  logoutBtn:{ background:'transparent', border:'1px solid #2E2820', color:'#6B5E50', padding:8, borderRadius:8, cursor:'pointer', fontSize:13, width:'100%' },
  main:{ flex:1, padding:'32px 40px', overflowY:'auto', zIndex:1 },
  header:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 },
  greeting:{ margin:0, fontSize:26, fontWeight:700, fontFamily:'"Cormorant Garamond",serif' },
  sub:{ margin:'4px 0 0', color:'#6B5E50', fontSize:14 },
  walkinBtn:{ background:'#E8A020', color:'#0D0B08', border:'none', padding:'10px 20px', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14 },
  statsRow:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:36 },
  statCard:{ background:'#1C1712', borderRadius:12, padding:'20px 24px', border:'1px solid #2E2820' },
  statVal:{ fontSize:32, fontWeight:700, fontFamily:'"Cormorant Garamond",serif', lineHeight:1 },
  statLabel:{ fontSize:12, color:'#6B5E50', marginTop:6, textTransform:'uppercase', letterSpacing:1 },
  row:{ display:'flex', alignItems:'center', gap:14, background:'#1C1712', border:'1px solid #2E2820', borderRadius:10, padding:'14px 18px', cursor:'pointer' },
  rowAvatar:{ width:38, height:38, borderRadius:'50%', background:'#2E2820', color:'#C4845A', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 },
  doshaTag:{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#2E2820', color:'#E8A020', fontWeight:600 },
  sevTag:{ fontSize:11, padding:'3px 10px', borderRadius:20, border:'1px solid', fontWeight:600 },
  doneTag:{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#4A7C59', color:'#fff', fontWeight:600 },
}