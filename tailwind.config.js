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
        forge: {
          950: '#06070a',
          900: '#0c0e14',
          850: '#11141c',
          800: '#171b26',
          750: '#1f2433',
          700: '#282f42',
          600: '#39425a',
          500: '#525d7e',
          400: '#838ea8',
          300: '#b4bdd1',
          200: '#d9deec',
          100: '#f1f3f9',
        },
        electric: {
          400: '#38bdf8',
          500: '#00e5ff',
          600: '#0284c7',
        },
        neon: {
          purple: '#8b5cf6',
          cyan: '#00f2fe',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      screens: {
        'xs': '380px',
      }
    },
  },
  plugins: [],
}
