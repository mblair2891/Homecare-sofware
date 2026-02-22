/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        careaxis: {
          navy: '#0f172a',
          blue: '#2563eb',
          teal: '#0d9488',
          green: '#16a34a',
          amber: '#d97706',
          red: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
