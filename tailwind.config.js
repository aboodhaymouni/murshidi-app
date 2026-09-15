/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', '"Noto Naskh Arabic"', 'system-ui', 'sans-serif'],
        naskh: ['"Noto Naskh Arabic"', 'system-ui', 'serif'],
      },
      colors: {
        // Official Jordanian government palette
        gov: {
          navy: '#013070',         // Murshidi brand navy
          'navy-dark': '#011F4D',
          'navy-light': '#1B4789',
          green: '#007A4D',        // Jordan green
          'green-dark': '#005C3A',
          red: '#CE1126',          // Jordan flag red
          gold: '#C8A04C',         // Hashemite gold (matches logo)
          black: '#0F172A',
          ink: '#1F2937',
          body: '#374151',
          muted: '#6B7280',
          line: '#E5E7EB',
          hairline: '#F1F3F5',
          surface: '#FFFFFF',
          bg: '#F5F7FA',
          'bg-soft': '#F8FAFC',
          ok: '#16A34A',
          warn: '#D97706',
          danger: '#DC2626',
        },
      },
      borderRadius: {
        'gov': '6px',
        'gov-lg': '10px',
      },
      boxShadow: {
        'gov-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'gov': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'gov-md': '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
