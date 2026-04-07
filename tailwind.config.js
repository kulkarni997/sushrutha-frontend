/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        surfaceAlt: '#F5EFE6',
        border: '#E8E0D5',
        primary: '#C45C1A',
        'primary-h': '#A34A12',
        accent: '#E8834A',
        textMain: '#1A1208',
        muted: '#6B5E50',
        hint: '#A89880',
        neem: '#4A7C59',
        error: '#C0392B',
        warning: '#D4A017',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}
