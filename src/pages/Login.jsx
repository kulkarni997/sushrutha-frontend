import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  return (
    <div
      className="relative min-h-screen bg-bg text-textMain font-sans flex flex-col overflow-hidden"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(13, 11, 8, 0.85)' }} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center px-8 py-5">
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(13, 11, 8, 0.60)' }} />
        <button
          onClick={() => navigate('/')}
          className="relative font-display text-primary text-xl tracking-widest uppercase cursor-pointer"
        >
          Sushrutha AI
        </button>
        <button
          onClick={() => navigate('/role')}
          className="relative text-muted hover:text-textMain text-sm font-sans cursor-pointer transition-colors duration-200"
        >
          Back
        </button>
      </nav>

      {/* Center card */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-24 pb-16">
        <div className="bg-surface border border-border rounded-card p-8 w-full max-w-sm mx-auto">

          <h1 className="font-display text-3xl text-textMain font-normal mb-1">
            Welcome back
          </h1>
          <p className="font-sans text-sm text-muted mb-8">
            Sign in to your Sushrutha AI account
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs text-hint font-sans tracking-widest uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-textMain text-sm font-sans placeholder:text-hint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-xs text-hint font-sans tracking-widest uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-textMain text-sm font-sans placeholder:text-hint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-error text-xs font-sans mt-1 mb-2">{error}</p>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-bg font-sans font-medium text-sm py-3 rounded-full mt-2 hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <span className="border-t border-border flex-1" />
              <span className="text-hint text-xs font-sans">or</span>
              <span className="border-t border-border flex-1" />
            </div>

            {/* Create account */}
            <button
              type="button"
              onClick={() => navigate('/role')}
              className="w-full border border-border text-muted font-sans text-sm py-3 rounded-full hover:border-primary hover:text-textMain transition-all duration-300"
            >
              Create an account
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
