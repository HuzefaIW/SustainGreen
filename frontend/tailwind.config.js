/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        eco: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        forest: {
          50: '#f2f7f4',
          100: '#e1ede5',
          200: '#c5dcce',
          300: '#9ec3ac',
          400: '#72a485',
          500: '#508665',
          600: '#3c6b4f',
          700: '#315640',
          800: '#284635',
          900: '#1b3826',
          950: '#0d2015',
        },
        warm: {
          50: '#fbfbfa',
          100: '#f6f7f3',
          200: '#edefe9',
          300: '#dee2d7',
          400: '#c2c9b8',
          500: '#9fa894',
          600: '#7e8774',
          700: '#636c5b',
          800: '#50574a',
          900: '#43493e',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
