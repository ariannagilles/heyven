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
          DEFAULT: "#04342C",
          2: "#0B3F34",
        },
        teal: {
          DEFAULT: "#0F6E56",
          mid: "#1D9E75",
        },
        mint: {
          DEFAULT: "#5DCAA5",
        },
        cream: {
          DEFAULT: "#F5EFE3",
        },
        crema: {
          DEFAULT: "#F5EFE3",
          50: "#FBF8F2",
          100: "#F5EFE3",
          200: "#EBE3D3",
          300: "#DFD4BE",
        },
        gold: {
          DEFAULT: "#CDA24E",
        },
        amber: {
          DEFAULT: "#EAC77A",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -14px rgba(0,0,0,0.35)",
        glass: "0 10px 30px -14px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.10)",
      },
      borderRadius: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
