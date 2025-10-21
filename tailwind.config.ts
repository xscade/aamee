import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FDEBD0",
          50: "#FEF8F0",
          100: "#FDEBD0",
          200: "#FBD7A0",
          300: "#F9C370",
          400: "#F7AF40",
          500: "#F59B10",
          600: "#E08A0E",
          700: "#B8700B",
          800: "#905608",
          900: "#683C05",
        },
        secondary: {
          DEFAULT: "#DD4B4F",
          50: "#FDE8E9",
          100: "#FBD1D2",
          200: "#F7A3A5",
          300: "#F37578",
          400: "#EF474B",
          500: "#DD4B4F",
          600: "#B13C3F",
          700: "#852D2F",
          800: "#591E1F",
          900: "#2D0F10",
        },
        accent: {
          DEFAULT: "#FFA36A",
          50: "#FFF4ED",
          100: "#FFE9DB",
          200: "#FFD3B7",
          300: "#FFBD93",
          400: "#FFA76F",
          500: "#FFA36A",
          600: "#CC8255",
          700: "#996140",
          800: "#66412A",
          900: "#332115",
        },
        severity: {
          low: "#FFE066",     // Yellow for low severity
          medium: "#FFA36A",  // Orange for medium severity
          high: "#DD4B4F",    // Red for high severity
          emergency: "#8B0000", // Dark red for emergency
        },
        fog: "#FDEBD0",
        cta: "#DD4B4F",
        warning: "#FFA36A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
