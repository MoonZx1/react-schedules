/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sarabun: ['Sarabun', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
        mitr: ['Mitr', 'sans-serif'],
        chakra: ['TH Chakra Petch', 'sans-serif'],
        anakotmai: ['Anakotmai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

