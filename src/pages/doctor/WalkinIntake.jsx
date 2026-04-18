import { useParams, useNavigate } from 'react-router-dom'

export default function WalkinIntake() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0B08',
      color: '#F5EDD6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '2rem',
        color: '#E8A020',
        marginBottom: '0.5rem'
      }}>Walk-in Intake</h1>
      <p style={{ color: '#A89880', marginBottom: '1rem' }}>
        Session ID: <code style={{ color: '#F5EDD6' }}>{id}</code>
      </p>
      <p style={{ color: '#6B5E50', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Scan intake coming soon — building now.
      </p>
      <button
        onClick={() => navigate('/doctor/dashboard')}
        style={{
          background: '#E8A020',
          color: '#0D0B08',
          border: 'none',
          padding: '0.7rem 1.6rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 700
        }}
      >
        Back to Dashboard
      </button>
    </div>
  )
}