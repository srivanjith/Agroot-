/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        agroot: {
          cream: "#F5F0E4",
          "cream-dark": "#EDE8DA",
          forest: "#2D4A3E",
          "forest-mid": "#3D6B52",
          "forest-light": "#4A7A5A",
          olive: "#6A8F6A",
          tan: "#C8B89A",
          "tan-light": "#E0D9CC",
          bark: "#8B6F47",
          clay: "#C0392B",
          parchment: "#FAF7F0",
        }
      },
      fontFamily: {
        sans: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};