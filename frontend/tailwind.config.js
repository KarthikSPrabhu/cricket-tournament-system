/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      colors: {
        cricket: {
          green: '#1B5E20',
          blue: '#0D47A1',
          gold: '#FFD700',
          red: '#D32F2F',
        }
      }
    },
  },
  plugins: [],
}