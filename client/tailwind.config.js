export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#17201a",
        basil: "#1f7a4d",
        mint: "#b7f7d6",
        cream: "#fffaf0",
        tomato: "#ef604f",
        steel: "#52616b"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 32, 26, 0.14)",
        glow: "0 18px 50px rgba(31, 122, 77, 0.22)"
      }
    }
  },
  plugins: []
};
