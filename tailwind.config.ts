import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        ocean: {
          deep: "hsl(var(--ocean-deep))",
          surface: "hsl(var(--ocean-surface))",
          light: "hsl(var(--ocean-light))",
        },
        game: {
          hit: "hsl(var(--hit))",
          miss: "hsl(var(--miss))",
          ship: "hsl(var(--ship))",
          valid: "hsl(var(--valid-placement))",
          invalid: "hsl(var(--invalid-placement))",
          grid: "hsl(var(--grid-line))",
        },
        ship: {
          carrier: "hsl(var(--ship-carrier))",
          "carrier-deck": "hsl(var(--ship-carrier-deck))",
          battleship: "hsl(var(--ship-battleship))",
          "battleship-deck": "hsl(var(--ship-battleship-deck))",
          cruiser: "hsl(var(--ship-cruiser))",
          "cruiser-deck": "hsl(var(--ship-cruiser-deck))",
          submarine: "hsl(var(--ship-submarine))",
          "submarine-deck": "hsl(var(--ship-submarine-deck))",
          destroyer: "hsl(var(--ship-destroyer))",
          "destroyer-deck": "hsl(var(--ship-destroyer-deck))",
        },
        "hit-glow": "hsl(var(--hit-glow))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        explosion: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        splash: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        wave: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "25%": { transform: "translateX(5px) translateY(-3px)" },
          "50%": { transform: "translateX(0) translateY(-5px)" },
          "75%": { transform: "translateX(-5px) translateY(-3px)" },
        },
        sink: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "30%": { transform: "translateY(2px) rotate(3deg)", opacity: "0.9" },
          "60%": { transform: "translateY(4px) rotate(-2deg)", opacity: "0.7" },
          "100%": { transform: "translateY(6px) rotate(5deg)", opacity: "0.5" },
        },
        shipHit: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.05) rotate(-2deg)" },
          "50%": { transform: "scale(0.98) rotate(2deg)" },
          "75%": { transform: "scale(1.02) rotate(-1deg)" },
        },
        fireFlicker: {
          "0%, 100%": { opacity: "0.8", transform: "scale(1)" },
          "25%": { opacity: "1", transform: "scale(1.1) translateY(-1px)" },
          "50%": { opacity: "0.7", transform: "scale(0.95)" },
          "75%": { opacity: "0.9", transform: "scale(1.05) translateY(-2px)" },
        },
        bubbles: {
          "0%": { transform: "translateY(0)", opacity: "0.6" },
          "50%": { transform: "translateY(-4px)", opacity: "0.8" },
          "100%": { transform: "translateY(-8px)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        explosion: "explosion 0.4s ease-out forwards",
        splash: "splash 0.3s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        slideUp: "slideUp 0.6s ease-out forwards",
        pulse: "pulse 2s ease-in-out infinite",
        radar: "radar 3s linear infinite",
        wave: "wave 3s ease-in-out infinite",
        sink: "sink 0.8s ease-out forwards",
        shipHit: "shipHit 0.4s ease-out",
        fireFlicker: "fireFlicker 0.5s ease-in-out infinite",
        bubbles: "bubbles 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
