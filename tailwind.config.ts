import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { azul: "#0F2C7A", papel: "#ECEEF0", grafite: "#151817", giz: "#FFD23F" } } },
  plugins: [],
} satisfies Config;
