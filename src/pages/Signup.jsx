import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const role = location.state?.role || 'patient';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bamsNumber, setBamsNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) { setError('Please fill in all required fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (role === 'doctor' && !bamsNumber.trim()) { setError('BAMS registration number is required.'); return; }
    setLoading(true);
    try {
      const body = { full_name: fullName, email, password, role, ...(role === 'doctor' && { bams_number: bamsNumber }) };
      const { data } = await api.post('/auth/register', body);
      login(data.token);
      if (role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/scan');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const t = isDark ? {
    page: 'rgba(13,11,8,0.85)',
    nav: 'rgba(13,11,8,0.6)',
    card: '#1C1712',
    cardBorder: '#2E2820',
    title: '#F5EDD6',
    sub: '#A89880',
    label: '#6B5E50',
    input: '#0D0B08',
    inputBorder: '#2E2820',
    inputText: '#F5EDD6',
    hint: '#6B5E50',
    btnPrimary: '#E8A020',
    btnPrimaryText: '#0D0B08',
    btnGhostBorder: '#2E2820',
    btnGhostText: '#A89880',
    divider: '#2E2820',
    dividerText: '#6B5E50',
    error: '#C0392B',
    logo: '#E8A020',
    back: '#A89880',
    pillPatient: { bg: 'rgba(74,124,89,0.2)', color: '#4A7C59', border: '#4A7C59' },
    pillDoctor: { bg: 'rgba(196,132,90,0.2)', color: '#C4845A', border: '#C4845A' },
  } : {
    page: 'rgba(245,237,214,0.88)',
    nav: 'rgba(245,237,214,0.85)',
    card: 'rgba(255,252,245,0.95)',
    cardBorder: 'rgba(59,42,26,0.12)',
    title: '#2A1A08',
    sub: 'rgba(59,42,26,0.5)',
    label: 'rgba(59,42,26,0.4)',
    input: 'rgba(255,252,245,0.8)',
    inputBorder: 'rgba(59,42,26,0.15)',
    inputText: '#2A1A08',
    hint: 'rgba(59,42,26,0.35)',
    btnPrimary: '#B85A00',
    btnPrimaryText: '#fff',
    btnGhostBorder: 'rgba(59,42,26,0.15)',
    btnGhostText: 'rgba(59,42,26,0.5)',
    divider: 'rgba(59,42,26,0.1)',
    dividerText: 'rgba(59,42,26,0.3)',
    error: '#C0392B',
    logo: '#B85A00',
    back: 'rgba(59,42,26,0.5)',
    pillPatient: { bg: 'rgba(74,124,89,0.1)', color: '#2D6A3F', border: '#4A7C59' },
    pillDoctor: { bg: 'rgba(196,132,90,0.1)', color: '#8B4A1A', border: '#C4845A' },
  };

  const pill = role === 'patient' ? t.pillPatient : t.pillDoctor;

  const inputStyle = {
    width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`,
    borderRadius: 8, padding: '12px 16px', color: t.inputText, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, color: t.label,
    letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500,
  };

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      backgroundImage: 'url(https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1920&q=80)',
      backgroundSize: 'cover', backgroundPosition: 'center', transition: 'all 0.4s ease',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: t.page, transition: 'background 0.4s ease' }} />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: t.nav, transition: 'background 0.4s ease' }}>
        <button onClick={() => navigate('/')} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: t.logo, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sushrutha AI
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <button onClick={() => navigate('/role')} style={{ fontSize: 13, color: t.back, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
        </div>
      </nav>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.4s ease' }}>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: t.title, marginBottom: 10, lineHeight: 1.1 }}>
            Create your account
          </h1>

          {/* Role pill */}
          <span style={{ display: 'inline-block', fontSize: 12, padding: '4px 14px', borderRadius: 20, marginBottom: 24, background: pill.bg, color: pill.color, border: `0.5px solid ${pill.border}` }}>
            {role === 'patient' ? '🌿 Signing up as Individual' : '⚕ Signing up as BAMS Doctor'}
          </span>

          <form onSubmit={handleSubmit} noValidate>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required style={inputStyle} />
            </div>

            {role === 'doctor' && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>BAMS Registration Number</label>
                <input type="text" value={bamsNumber} onChange={(e) => setBamsNumber(e.target.value)} placeholder="BAMS/XXXX/XXXXX" required style={inputStyle} />
                <p style={{ fontSize: 12, color: t.hint, marginTop: 4 }}>Your account will be verified before activation</p>
              </div>
            )}

            {error && <p style={{ color: t.error, fontSize: 13, marginBottom: 8 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: '100%', background: t.btnPrimary, color: t.btnPrimaryText, border: 'none', borderRadius: 8, padding: '13px', fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: 8, transition: 'all 0.3s ease' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <span style={{ flex: 1, height: '0.5px', background: t.divider }} />
              <span style={{ fontSize: 12, color: t.dividerText }}>or</span>
              <span style={{ flex: 1, height: '0.5px', background: t.divider }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: 14, color: t.btnGhostText }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color: t.btnPrimary, cursor: 'pointer', fontWeight: 500 }}>Sign in</span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}