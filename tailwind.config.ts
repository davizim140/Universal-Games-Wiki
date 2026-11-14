import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09090f",
        panel: "#12121c",
        line: "#262638",
        violet: "#8b5cf6"
      },
      boxShadow: {
        glow: "0 0 40px rgba(139,92,246,.16)"
      }
    }
  },
  plugins: []
};

export default config;