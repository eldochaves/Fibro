import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
    },
    extend: {
      colors: {
        // Azul-marinho da marca (texto do logo) — cor primária
        navy: {
          50: "#eef4f8",
          100: "#d7e5ee",
          200: "#aecadb",
          300: "#7ba6c1",
          400: "#487e9f",
          500: "#28617f",
          600: "#134963",
          700: "#083858",
          800: "#072c46",
          900: "#051f31",
        },
        // Verde-petróleo da marca (emblema) — cor de destaque
        teal: {
          50: "#e9f7f4",
          100: "#c9ece5",
          200: "#97dccf",
          300: "#5fc8b4",
          400: "#33b19c",
          500: "#289888",
          600: "#1f7d70",
          700: "#1b635a",
          800: "#174f48",
          900: "#13403b",
        },
        // Aliases semânticos
        brand: {
          50: "#eef4f8",
          100: "#d7e5ee",
          500: "#28617f",
          600: "#134963",
          700: "#083858",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Lora", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(8,56,88,0.04), 0 8px 24px -12px rgba(8,56,88,0.18)",
        card: "0 1px 3px rgba(8,56,88,0.06), 0 12px 32px -16px rgba(8,56,88,0.20)",
        lift: "0 2px 6px rgba(8,56,88,0.08), 0 18px 40px -18px rgba(8,56,88,0.30)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
