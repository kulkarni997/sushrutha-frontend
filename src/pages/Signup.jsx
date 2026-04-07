import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (role === 'doctor' && !bamsNumber.trim()) {
      setError('BAMS registration number is required.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        full_name: fullName,
        email,
        password,
        role,
        ...(role === 'doctor' && { bams_number: bamsNumber }),
      };
      const { data } = await api.post('/auth/register', body);
      login(data.token);
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/scan');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-bg border border-border rounded-lg px-4 py-3 text-textMain text-sm font-sans placeholder:text-hint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200';
  const labelClass =
    'block text-xs text-hint font-sans tracking-widest uppercase mb-1';

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
            Create your account
          </h1>

          {/* Role pill */}
          {role === 'patient' ? (
            <span
              className="text-xs font-sans px-3 py-1 rounded-full mb-6 inline-block border text-neem border-neem"
              style={{ backgroundColor: 'rgba(74, 124, 89, 0.2)' }}
            >
              🌿 Signing up as Individual
            </span>
          ) : (
            <span
              className="text-xs font-sans px-3 py-1 rounded-full mb-6 inline-block border text-accent border-accent"
              style={{ backgroundColor: 'rgba(196, 132, 90, 0.2)' }}
            >
              ⚕ Signing up as BAMS Doctor
            </span>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="mb-4">
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className={inputClass}
              />
            </div>

            {/* BAMS Number — doctor only */}
            {role === 'doctor' && (
              <div className="mb-4">
                <label className={labelClass}>BAMS Registration Number</label>
                <input
                  type="text"
                  value={bamsNumber}
                  onChange={(e) => setBamsNumber(e.target.value)}
                  placeholder="BAMS/XXXX/XXXXX"
                  required
                  className={inputClass}
                />
                <p className="text-xs text-hint mt-1">
                  Your account will be verified before activation
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-error text-xs font-sans mt-1 mb-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-bg font-sans font-medium text-sm py-3 rounded-full mt-2 hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <span className="border-t border-border flex-1" />
              <span className="text-hint text-xs font-sans">or</span>
              <span className="border-t border-border flex-1" />
            </div>

            {/* Sign in link */}
            <p className="text-center font-sans text-sm text-muted">
              Already have an account?{' '}
              <span
                className="text-primary hover:text-accent cursor-pointer transition-colors duration-200"
                onClick={() => navigate('/login')}
              >
                Sign in
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
