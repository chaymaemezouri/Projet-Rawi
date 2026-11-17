/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5EBDD",
        ink: "#302820",
        muted: "#5C4E43",
        line: "#E4D5C3",
        forest: "#702230",
        "forest-dark": "#4C1620",
        clay: "#BE7958",
        "clay-ink": "#8A4E36",
        gold: "#D7B77C",
        paper: "#FBF7F1",
        danger: "#8E3B2E",
      },
      fontFamily: {
        sans: ["Outfit", "Segoe UI", "Tahoma", "sans-serif"],
        serif: ["Cormorant Garamond", "Palatino Linotype", "Palatino", "Georgia", "serif"],
        arabic: ["Noto Naskh Arabic", "Segoe UI", "Tahoma", "serif"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(48, 40, 32, 0.06)",
      },
    },
  },
  plugins: [],
};
