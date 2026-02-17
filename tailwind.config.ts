import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f8fafc",
        panel: "#ffffff",
        accent: "#0a84ff",
        ink: "#0f172a",
        calm: "#64748b",
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        panel: "0 8px 24px -12px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
