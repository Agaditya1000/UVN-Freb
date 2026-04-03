/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#0000EE",
        white: "#FFFFFF",
        lightWhite: "#EEEEEE",
        black: "#000000",
        borderDark: "#000055",
        naviBlue: "#000021",
        error: "#D50000",
        success: "#00BFA5",
        grayText: "#757575"
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      fontWeight: {
        light: "300",
        medium: "500",
      },
      letterSpacing: {
        heading: "-0.75px"
      },
      borderWidth: {
        custom: "1.75px"
      }
    },
  },
  plugins: [],
}
