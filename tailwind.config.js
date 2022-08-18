/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nintendoBlue: '#00c4e3',
        nintendoRed: '#ff5f53',
      },
    },
  },
  plugins: [],
};
