/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#22C55E",
          light: "#86EFAC",
          soft: "#EFFBF3",
          dark: "#16A34A",
          deeper: "#15803D",
        },
        bg: "#F7F9F7",
        surface: "#FFFFFF",
        ink: "#1A1D1C",
        muted: "#8A9189",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(16,24,40,0.06)",
        cardHover: "0 12px 28px rgba(16,24,40,0.10)",
        floating: "0 10px 30px rgba(22,163,74,0.25)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp .35s ease-out both",
        "pulse-soft": "pulseSoft 1.6s ease-in-out infinite",
        "check-pop": "checkPop .45s cubic-bezier(.2,1.4,.4,1) both",
        shimmer: "shimmer 1.4s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".6", transform: "scale(.96)" },
        },
        checkPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};