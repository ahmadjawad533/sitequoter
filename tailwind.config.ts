import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1D4ED8", // Primary trust blue
          orange: "#F97316", // Accent / primary button orange
          success: "#16A34A",
          warning: "#D97706",
          error: "#DC2626",
          dark: "#111827",
          gray: "#F3F4F6",
          border: "#E5E7EB",
        },
        primary: {
          DEFAULT: "#1D4ED8",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF",
        foreground: "#111827",
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#4B5563",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#1D4ED8",
      },
      borderRadius: {
        lg: "8px",
        xl: "12px",
        DEFAULT: "8px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: {
        app: "720px",
      },
      minHeight: {
        touch: "48px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
