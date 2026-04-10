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
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        bg: "var(--bg)",
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
        },
        border: "var(--border)",
        surface: "var(--surface)",
        accent: "#0000EE",
        error: "#D50000",
        success: "#00BFA5",
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
