/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#faf4ea",
        ink: "#2b2118",
        muted: "#7a6a58",
        line: "#eadfcd",
        forest: "#2f6b4f",
        "forest-dark": "#24543d",
        clay: "#c8793a",
        paper: "#fffdf8",
        danger: "#b4442f",
      },
      fontFamily: {
        sans: ["Segoe UI", "Tahoma", "Noto Naskh Arabic", "sans-serif"],
        serif: ["Palatino Linotype", "Palatino", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 12px 40px rgba(43, 33, 24, 0.06)",
      },
    },
  },
  plugins: [],
};
