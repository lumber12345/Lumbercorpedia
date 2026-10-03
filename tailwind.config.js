/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lumbercorpedia palette — dark timber + amber.
        ink: {
          950: '#08090c',
          900: '#0d1014',
          850: '#12161b',
          800: '#171c22',
          750: '#1d232b',
          700: '#242c35',
          600: '#323c48',
          500: '#4a5663',
        },
        amber: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc271',
          400: '#ffa53c',
          500: '#f98a12',
          600: '#dd6d08',
          700: '#b7520a',
          800: '#92400f',
          900: '#783710',
        },
        blood: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        moss: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        sky2: {
          400: '#60a5fa',
          500: '#3b82f6',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.9)',
        glow: '0 0 0 1px rgba(249,138,18,0.35), 0 0 24px -6px rgba(249,138,18,0.45)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 140ms ease-out',
        'slide-up': 'slide-up 180ms ease-out',
      },
    },
  },
  plugins: [],
};
