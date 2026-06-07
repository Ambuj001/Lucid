/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cardwise: {
          bg: "#000000",
          surface: "#0A0A0A",
          border: "#262626",
          pink: "#FF2E93",
          textMain: "#FFFFFF",
          textMuted: "#A3A3A3"
        }
      },
      borderRadius: {
        'none': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        'full': '0px',
      }
    },
  },
  plugins: [],
}
