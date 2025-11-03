/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0077B6',
          50: '#E6F5FB',
          100: '#CCEBF7',
          200: '#99D7EF',
          300: '#66C3E7',
          400: '#33AFDF',
          500: '#0077B6',
          600: '#006292',
          700: '#004D6E',
          800: '#00394A',
          900: '#002426',
        },
        secondary: '#00B4D8',
        accent: '#FF5C8A',
      },
      fontFamily: {
        heading: ['Poppins', 'Montserrat', 'sans-serif'],
        body: ['Open Sans', 'Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
