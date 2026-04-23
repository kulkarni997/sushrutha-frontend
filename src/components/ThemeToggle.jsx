import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: isDark ? 'rgba(28,20,12,0.8)' : 'rgba(255,252,245,0.9)',
        border: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(59,42,26,0.15)',
        borderRadius: 20,
        padding: '5px 14px',
        cursor: 'pointer',
        fontSize: 13,
        color: isDark ? 'rgba(245,237,214,0.6)' : 'rgba(59,42,26,0.6)',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
      }}
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}