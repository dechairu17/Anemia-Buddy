/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anemia: {
          darkred: '#780000',   // Gochujang Red
          crimson: '#C1121F',   // Crimson Blaze
          cream: '#FDF6E2',     // Varden / Warm Cream
          navy: '#003049',      // Cosmos Blue
          lightblue: '#669BBC', // Blue Marble
        }
      }
    },
  },
  plugins: [],
}