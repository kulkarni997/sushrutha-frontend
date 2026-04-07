import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Claim() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-sans">
      <div className="bg-surface border border-border rounded-xl p-10 max-w-md w-full mx-4 shadow-sm">

        {/* Icon */}
        <div className="text-5xl text-center mb-4">🌿</div>

        {/* Title */}
        <h1 className="font-display text-3xl text-textMain text-center mb-2">Claim Your Report</h1>
        <p className="text-muted text-sm font-sans text-center mb-8">
          Create a free account to save your Ayurvedic scan permanently.
        </p>

        {/* Form */}
        <label className="block text-xs text-muted font-sans mb-1">Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="input mb-4"
        />

        <label className="block text-xs text-muted font-sans mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="input mb-4"
        />

        <label className="block text-xs text-muted font-sans mb-1">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          className="input mb-6"
        />

        <button className="btn-primary w-full">
          Claim My Report
        </button>

        <p className="text-xs text-hint text-center mt-4 font-sans">
          Token expires in 48 hours. No spam, ever.
        </p>
      </div>
    </div>
  )
}
