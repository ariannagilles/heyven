import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        petrolio: {
          DEFAULT: "#1a3a3a",
          900: "#0f2424",
          800: "#173030",
          700: "#1a3a3a",
          600: "#234848",
          500: "#2e5959",
          400: "#5a8484",
        },
        crema: {
          DEFAULT: "#f5ead7",
          50: "#fbf6ea",
          100: "#f5ead7",
          200: "#ecdcb9",
          300: "#e0c995",
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,58,58,0.06), 0 4px 16px rgba(26,58,58,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
