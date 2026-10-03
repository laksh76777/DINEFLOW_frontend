/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4ef',
          100: '#ffe5da',
          200: '#ffc9b5',
          300: '#f99e7f',
          400: '#e87c53',
          500: '#d96236',
          600: '#be4d27',
          700: '#9e3d21',
          800: '#7e3019',
          900: '#5c2211',
          950: '#381207',
        },
        accent: {
          50: '#fff8e7',
          100: '#ffedbd',
          200: '#fde08f',
          500: '#d89a20',
          600: '#bf7a13',
        },
        surface: {
          50: '#fbf9f6',
          100: '#f5f1ec',
          200: '#e9e3dc',
          300: '#d7cec4',
          400: '#a89d91',
          500: '#7b726a',
          600: '#5e564f',
          700: '#49423c',
          800: '#322d28',
          900: '#211d1a',
          950: '#151210',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(43, 31, 24, 0.04), 0 3px 10px rgba(43, 31, 24, 0.03)',
        'warm-md': '0 8px 28px rgba(43, 31, 24, 0.08)',
        'warm-lg': '0 24px 60px rgba(43, 31, 24, 0.14)',
        'brand': '0 5px 14px rgba(217, 98, 54, 0.2)',
      },
    },
  },
  plugins: [],
}
