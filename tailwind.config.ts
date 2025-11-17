import type { Config } from "tailwindcss"

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "max-900": { raw: "(max-width: 900px)" },
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
