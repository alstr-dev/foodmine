/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 8s linear infinite reverse',
        flicker: 'flicker 2s infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}

