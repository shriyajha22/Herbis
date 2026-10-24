import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#5F86A8",         // Primary Dusty Blue
          darkGreen: "#3E5C76",     // Deep Dusty Blue
          softGreen: "#8CB8D9",     // Secondary Sky Blue
          accentGreen: "#B4D3EC",   // Light Sky Blue accent
          mint: "#B4D3EC",          // Light Sky Blue border / badge
          bgBeige: "#F5EFE6",       // Background Warm Soft Beige
          bgSoft: "#FAF6EE",        // Soft natural cream shade
          cardBeige: "#FAF6EE",     // Warm off-white card background
          cardWhite: "#FAF6EE",     // Warm off-white card background
          darkGrey: "#2B3746",      // Dark navy charcoal text
          mediumGrey: "#556475",    // Medium blue-grey text
          actionIncrease: "#5F86A8",// Blue +
          actionDecrease: "#E69C45",// Warm Orange -
          actionRemove: "rgb(215, 65, 65)", // Muted Red remove
          gold: "#D4AF37",
          charcoal: "#2B3746",
          lightGray: "#F3ECE0",
          darkBg: "#1E2D3B",
          darkCard: "#273849",
        },
      },
      borderRadius: {
        badge: "999px",
        input: "12px",
        button: "12px",
        card: "14px",
        modal: "16px",
        image: "14px",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(95, 134, 168, 0.18)",
        card: "0 6px 24px -4px rgba(62, 92, 118, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.03)",
        premium: "0 14px 35px -10px rgba(62, 92, 118, 0.20)",
        gold: "0 4px 15px rgba(212, 175, 55, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
