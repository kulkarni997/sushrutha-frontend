import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token);
      const { role } = data;
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/scan');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
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
    inputPlaceholder: '#6B5E50',
    btnPrimary: '#E8A020',
    btnPrimaryText: '#0D0B08',
    btnGhost: 'transparent',
    btnGhostBorder: '#2E2820',
    btnGhostText: '#A89880',
    divider: '#2E2820',
    dividerText: '#6B5E50',
    error: '#C0392B',
    logo: '#E8A020',
    back: '#A89880',
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
    inputPlaceholder: 'rgba(59,42,26,0.3)',
    btnPrimary: '#B85A00',
    btnPrimaryText: '#fff',
    btnGhost: 'transparent',
    btnGhostBorder: 'rgba(59,42,26,0.15)',
    btnGhostText: 'rgba(59,42,26,0.5)',
    divider: 'rgba(59,42,26,0.1)',
    dividerText: 'rgba(59,42,26,0.3)',
    error: '#C0392B',
    logo: '#B85A00',
    back: 'rgba(59,42,26,0.5)',
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundImage: 'url(https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'all 0.4s ease',
    }}>
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: t.page, transition: 'background 0.4s ease' }} />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: t.nav, transition: 'background 0.4s ease' }}>
        <button onClick={() => navigate('/')} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: t.logo, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sushrutha AI
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <button onClick={() => navigate('/role')} style={{ fontSize: 13, color: t.back, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            ← Back
          </button>
        </div>
      </nav>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 380, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.4s ease' }}>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: t.title, marginBottom: 6, lineHeight: 1.1 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: t.sub, marginBottom: 28, fontWeight: 300 }}>
            Sign in to your Sushrutha AI account
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: t.label, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: '12px 16px', color: t.inputText, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'all 0.3s ease' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 10, color: t.label, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: '12px 16px', color: t.inputText, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'all 0.3s ease' }}
              />
            </div>

            {error && <p style={{ color: t.error, fontSize: 13, marginBottom: 8 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: t.btnPrimary, color: t.btnPrimaryText, border: 'none', borderRadius: 8, padding: '13px', fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: 8, transition: 'all 0.3s ease' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <span style={{ flex: 1, height: '0.5px', background: t.divider }} />
              <span style={{ fontSize: 12, color: t.dividerText }}>or</span>
              <span style={{ flex: 1, height: '0.5px', background: t.divider }} />
            </div>

            <button
              type="button"
              onClick={() => navigate('/role')}
              style={{ width: '100%', background: t.btnGhost, border: `1px solid ${t.btnGhostBorder}`, borderRadius: 8, padding: '12px', fontSize: 14, color: t.btnGhostText, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              Create an account
            </button>

          </form>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
    </div>
  );
}