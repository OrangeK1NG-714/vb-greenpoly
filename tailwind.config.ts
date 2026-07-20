import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Latin + Vietnamese resolve to Jakarta; Thai glyphs fall through to Noto Sans Thai.
        sans: ["var(--font-sans)", "var(--font-thai)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#047857",
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // Warm conversion accent — SEA buyers respond to warm CTA colors.
        accent: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
          light: "#fef3c7",
        },
        // Deep forest for dark sections — warmer & more on-brand than slate.
        forest: {
          DEFAULT: "#07352a",
          800: "#0b3d2e",
          900: "#052e24",
        },
        sand: "#faf9f5",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(6, 78, 59, 0.12)",
        card: "0 2px 12px -4px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
