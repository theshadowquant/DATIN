import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        datin: {
          cream: "var(--nirmaan-cream, #f1ebdd)",
          "cream-card": "var(--nirmaan-cream-card, #f7f3ea)",
          black: "var(--nirmaan-black, #141414)",
          white: "#ffffff",
          blue: "var(--nirmaan-blue, #3357ff)",
          amber: "var(--nirmaan-amber, #f5a623)",
          orange: "var(--nirmaan-orange, #f2622e)",
          red: "var(--nirmaan-red, #e6432c)",
          "green-dark": "var(--nirmaan-green-dark, #2f9e52)",
          "green-bright": "var(--nirmaan-green-bright, #3ecf4a)",
          purple: "var(--nirmaan-purple, #8b5cf6)",
        },
        nirmaan: {
          cream: "#f1ebdd",
          "cream-card": "#f7f3ea",
          black: "#141414",
          white: "#ffffff",
          blue: "#3357ff",
          amber: "#f5a623",
          orange: "#f2622e",
          red: "#e6432c",
          "green-dark": "#2f9e52",
          "green-bright": "#3ecf4a",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo Black", "Space Grotesk", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        nirmaan: "0 8px 24px rgba(0, 0, 0, 0.05)",
        xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
