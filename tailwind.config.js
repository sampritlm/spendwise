/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          navy: '#0f172a',
          navyMuted: '#334155',
          navyDark: '#0a0f1d',
          emerald: '#10b981',
          emeraldDark: '#059669',
          emeraldLight: '#ecfdf5',
          coral: '#f43f5e',
          coralDark: '#e11d48',
          coralLight: '#fff1f2',
          purple: '#6366f1',
          purpleDark: '#4f46e5',
          purpleLight: '#eef2ff',
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'premium': '0 20px 40px -15px rgba(15, 23, 42, 0.07)',
      }
    },
  },
  plugins: [],
}

