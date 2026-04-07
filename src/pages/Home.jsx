import React from 'react';
import { useNavigate } from 'react-router-dom';

const MandalaSVG = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 0.04 }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="mandala" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
        <circle cx="200" cy="200" r="180" fill="none" stroke="#E8A020" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="#E8A020" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#E8A020" strokeWidth="0.3" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#E8A020" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#E8A020" strokeWidth="0.3" />
        <circle cx="200" cy="200" r="80" fill="none" stroke="#E8A020" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="60" fill="none" stroke="#E8A020" strokeWidth="0.3" />
        <circle cx="200" cy="200" r="40" fill="none" stroke="#E8A020" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="20" fill="none" stroke="#E8A020" strokeWidth="0.5" />
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={angle}
            x1={200 + 180 * Math.cos((angle * Math.PI) / 180)}
            y1={200 + 180 * Math.sin((angle * Math.PI) / 180)}
            x2={200 - 180 * Math.cos((angle * Math.PI) / 180)}
            y2={200 - 180 * Math.sin((angle * Math.PI) / 180)}
            stroke="#E8A020"
            strokeWidth="0.3"
          />
        ))}
        {[22.5, 67.5, 112.5, 157.5].map((angle) => (
          <line
            key={angle}
            x1={200 + 160 * Math.cos((angle * Math.PI) / 180)}
            y1={200 + 160 * Math.sin((angle * Math.PI) / 180)}
            x2={200 - 160 * Math.cos((angle * Math.PI) / 180)}
            y2={200 - 160 * Math.sin((angle * Math.PI) / 180)}
            stroke="#E8A020"
            strokeWidth="0.2"
          />
        ))}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={angle}
            cx={200 + 80 * Math.cos((angle * Math.PI) / 180)}
            cy={200 + 80 * Math.sin((angle * Math.PI) / 180)}
            rx="30"
            ry="12"
            fill="none"
            stroke="#E8A020"
            strokeWidth="0.3"
            transform={`rotate(${angle}, ${200 + 80 * Math.cos((angle * Math.PI) / 180)}, ${200 + 80 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#mandala)" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen bg-bg text-textMain font-sans overflow-hidden flex flex-col"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Light overlay */}
      <div className="absolute inset-0 z-0 bg-white/70" />

      {/* Mandala pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <MandalaSVG />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6 bg-white/80 backdrop-blur-sm">
        <span className="font-display text-primary text-lg tracking-widest uppercase">
          Sushrutha AI
        </span>
        <button
          onClick={() => navigate('/login')}
          className="text-primary text-sm font-sans transition-colors duration-200"
        >
          Login
        </button>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="font-display text-6xl md:text-8xl text-primary font-semibold tracking-wide leading-tight mb-4">
          Sushrutha AI
        </h1>

        <p className="text-sm tracking-widest text-muted font-sans uppercase mb-6">
          Ancient wisdom. Modern diagnosis.
        </p>

        <p className="text-textMain font-sans text-sm max-w-md text-center leading-relaxed mb-10">
          AI-powered Ayurvedic screening for patients and BAMS doctors.
          <br className="hidden sm:block" />
          Understand your dosha from home — tongue, voice, and pulse analysis.
        </p>

        <button
          onClick={() => navigate('/role')}
          className="bg-primary text-bg font-sans font-medium px-8 py-3 rounded-full hover:bg-accent hover:scale-105 transition-all duration-300 mb-8"
        >
          Get Started
        </button>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Tongue Analysis', 'Voice Dosha', 'Pulse Screening'].map((label) => (
            <span
              key={label}
              className="border border-primary text-primary font-sans text-sm px-5 py-2 rounded-full bg-white/80"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="relative z-10 text-center text-hint text-xs pb-6">
        Powered by Ayurvedic wisdom · Built for India
      </p>
    </div>
  );
}
