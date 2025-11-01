/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "media",
    content: [
    "./apps/cms/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/cms/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
    theme: {
      extend: {
        fontFamily: {
          sans: ["var(--font-sf)"],
        },
        borderRadius: {
          ui: 6,
          "ui-lg": 12,
          "ui-sm": 4,
        },
        colors: {
          primary: "rgb(var(--primary) / <alpha-value>)",
          accent: "rgb(var(--accent) / <alpha-value>)",
          base: {
            black: "#22232E",
            white: "#ffffff",
          },
          neutral: {
            50: "rgb(var(--neutral-50) / <alpha-value>)",
            100: "rgb(var(--neutral-100) / <alpha-value>)",
            200: "rgb(var(--neutral-200) / <alpha-value>)",
            300: "rgb(var(--neutral-300) / <alpha-value>)",
            400: "rgb(var(--neutral-400) / <alpha-value>)",
            500: "rgb(var(--neutral-500) / <alpha-value>)",
            600: "rgb(var(--neutral-600) / <alpha-value>)",
            700: "rgb(var(--neutral-700) / <alpha-value>)",
            800: "rgb(var(--neutral-800) / <alpha-value>)",
            900: "rgb(var(--neutral-900) / <alpha-value>)",
            950: "rgb(var(--neutral-950) / <alpha-value>)",
          },
          surface: {
            DEFAULT: "rgb(var(--surface) / <alpha-value>)",
            muted: "rgb(var(--surface-muted) / <alpha-value>)",
            sidebar: "rgb(var(--surface-sidebar) / <alpha-value>)",
            contrast: "rgb(var(--surface-contrast) / <alpha-value>)",
          },
          border: "rgb(var(--border) / <alpha-value>)",
          ring: "rgb(var(--ring) / <alpha-value>)",
        },
        boxShadow: {
          sm: "var(--shadow-sm)",
          DEFAULT: "var(--shadow)",
          md: "var(--shadow-md)",
          lg: "var(--shadow-lg)",
          xl: "var(--shadow-xl)",
          inner: "var(--shadow-inner)",
        },
        ringColor: {
          DEFAULT: "rgb(var(--ring) / <alpha-value>)",
        },
        borderColor: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
        },
        divideColor: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
        },
        maxWidth: {
          "8xl": "2200px",
        },
        animation: {
          "spin-fast": "spin 0.5s linear infinite",
        },
        spacing: {
          13: "3.25rem",
          22: "5.5rem",
        },
        lineHeight: {
          11: "2.75rem",
        },
        borderWidth: {
          3: "3px",
        },
      },
    },
    plugins: [require("tailwindcss-radix")()],
  };
  