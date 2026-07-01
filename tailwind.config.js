/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bgSpace: '#0B0F19',
        cardSpace: 'rgba(17, 24, 39, 0.45)',
        borderSpace: 'rgba(255, 255, 255, 0.08)',
        glowBlue: '#3b82f6',
        glowCyan: '#06b6d4',
        glowEmerald: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 8px 32px 0 rgba(6, 182, 212, 0.15)',
      }
    },
  },
  plugins: [],
}
