/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dragons: {
          red: '#c0161c',
          gold: '#e8b84b',
          dark: '#0a0a0a',
          card: '#141414',
          border: '#2a2a2a',
        },
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'cursive'],
        ui: ['"Barlow Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
