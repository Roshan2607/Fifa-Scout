/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#050c14",
          900: "#0a1628",
          800: "#0f2140",
          700: "#1a3356",
        },
        accent: {
          400: "#22d68a",
          500: "#16c47a",
          600: "#0fa868",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        coral: {
          400: "#f87171",
          500: "#ef4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
