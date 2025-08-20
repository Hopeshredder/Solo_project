/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        snack: {
          50:  '#F4FBF7',
          100: '#EAF9F1',
          200: '#CFF1E1',
          300: '#A9E4C9',
          400: '#6FD8A6',
          500: '#44C987',
          600: '#2BB673', // brand
          700: '#228E5A',
          800: '#1B6F47',
          900: '#134F34',
        },
        syrup: '#8B5E3C',
        cream: '#FFF8EB',
        muted: '#6B7280',
      },
      boxShadow: {
        snack: '0 8px 24px rgba(43, 182, 115, 0.16)',
        'snack-lg': '0 14px 40px rgba(43, 182, 115, 0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
