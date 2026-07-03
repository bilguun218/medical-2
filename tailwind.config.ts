import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        primary: {
          DEFAULT: "#0D3B66",
          foreground: "#FFFFFF"
        },
        medical: {
          DEFAULT: "#1F7AE0",
          foreground: "#FFFFFF"
        },
        teal: {
          DEFAULT: "#17BEBB",
          foreground: "#042F2E"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 70px rgba(13, 59, 102, 0.10)"
      },
      borderRadius: {
        xl: "0.5rem",
        "2xl": "0.75rem"
      }
    }
  },
  plugins: []
};

export default config;
