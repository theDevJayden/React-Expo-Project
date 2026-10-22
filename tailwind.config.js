/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#003527",
        "primary-container": "#064e3b",
        "primary-fixed-dim": "#95d3ba",
        "on-primary": "#ffffff",
        secondary: "#006c4a",
        "secondary-container": "#82f5c1",
        "on-secondary-container": "#00714e",
        "tertiary-container": "#004f34",
        surface: "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#404944",
        "inverse-surface": "#213145",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["PlusJakartaSans-Regular"],
        "jakarta-semibold": ["PlusJakartaSans-SemiBold"],
        "jakarta-bold": ["PlusJakartaSans-Bold"],
      },
    },
  },
  plugins: [],
};