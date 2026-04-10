/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans-Regular", "System"],
        medium: ["PlusJakartaSans-Medium", "System"],
        semibold: ["PlusJakartaSans-SemiBold", "System"],
        bold: ["PlusJakartaSans-Bold", "System"],
        extrabold: ["PlusJakartaSans-ExtraBold", "System"],
      },
      colors: {
        background: "#f7f7f7",
        foreground: "#141821",
        card: "#ffffff",
        "card-foreground": "#141821",
        primary: "#1fbd63",
        "primary-foreground": "#ffffff",
        secondary: "#f3f4f6",
        "secondary-foreground": "#141821",
        muted: "#f3f4f6",
        "muted-foreground": "#727985",
        accent: "#ebfaf1",
        "accent-foreground": "#176c3c",
        destructive: "#ef4444",
        border: "#e7eaee",
        input: "#e7eaee",
        warning: "#f59e0b",
        info: "#0a84ff",
      },
      boxShadow: {
        card: "0 8px 24px rgba(20, 24, 33, 0.06)",
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
    },
  },
  plugins: [],
};