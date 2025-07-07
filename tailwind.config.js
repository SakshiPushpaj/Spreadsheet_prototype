/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-25': '#f0fdfa',
        'green-25': '#f0fdf4',
        'purple-25': '#faf5ff',
        'orange-25': '#fff7ed',
      }
    },
  },
  plugins: [],
} 