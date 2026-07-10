/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FEF3ED',
          100: '#FFE1D0',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FF8A3C',
          500: '#FB6514',
          600: '#FD5F03',
          700: '#C2410C',
        },
      },
      boxShadow: {
        brand: '0 6px 16px rgba(253,95,3,.30)',
      },
    },
  },
  plugins: [],
}
