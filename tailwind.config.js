/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cardwise: {
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          glass: "rgba(255,255,255,0.7)",
          border: "rgba(0,0,0,0.06)",
          textMain: "#0F172A",
          textMuted: "#64748B",
          indigo: "#4F46E5",
          violet: "#7C3AED",
          accent: "#6366F1",
        }
      },
      backdropBlur: {
        xl: '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass-inset': 'inset 0 1px 1px rgba(255,255,255,0.05)',
        'glow': '0 0 80px rgba(99,102,241,0.15)',
        'glow-lg': '0 0 120px rgba(99,102,241,0.2)',
      },
      fontFamily: {
        sans: ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cabinet Grotesk"', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
