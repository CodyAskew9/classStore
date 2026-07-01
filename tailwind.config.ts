import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a2332",
        muted: "#5c6678",
        accent: "#2b5ea7",
        gold: "#c9a227",
        surface: "#ffffff",
        canvas: "#f4f1ea",
        border: "#ddd6c8",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
  safelist: [
    "avatar-stack--xl",
    "avatar-stack--lg",
    "avatar-stack--md",
    "avatar-stack--sm",
    "avatar-stack--xl-portrait",
    "avatar-stack--lg-portrait",
    "avatar-stack--md-portrait",
  ],
};

export default config;
