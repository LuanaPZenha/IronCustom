/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        workshop: {
          950: '#0a0a0b',
          900: '#121214',
          800: '#1a1a1e',
          700: '#27272a',
          600: '#3f3f46',
          500: '#71717a',
          accent: '#ea580c',
          'accent-dark': '#c2410c',
          danger: '#dc2626',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(234, 88, 12, 0.15)',
        'glow-lg': '0 0 40px rgba(234, 88, 12, 0.12)',
      },
      animation: {
        'gradient-shift': 'gradientShift 18s ease infinite',
        'float-slow': 'floatSlow 12s ease-in-out infinite',
        'float-slower': 'floatSlow 20s ease-in-out infinite reverse',
        'ken-burns': 'kenBurns 25s ease-in-out infinite alternate',
        'spark': 'spark 4s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(3%, -2%) scale(1.05)' },
          '66%': { transform: 'translate(-2%, 3%) scale(0.98)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -30px)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-1%, -1%)' },
        },
        spark: {
          '0%, 100%': { opacity: '0', transform: 'translateY(0) scale(0)' },
          '50%': { opacity: '0.8', transform: 'translateY(-40px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
