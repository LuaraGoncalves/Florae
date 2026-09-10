import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f3f7ec",
        foreground: "#16351f",
        primary: "#173f26",
        leaf: "#315f3c",
        moss: "#dff4bd",
        mint: "#b9d9a8",
        clay: "#b86b33",
        cream: "#f7ffe8",
        border: "#c6d6bd"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "Cambria", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(20, 54, 29, 0.14)"
      }
    }
  },
  plugins: []
} satisfies Config;
