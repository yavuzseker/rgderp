import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

// Indigo tabanlı kurumsal palet — Aura üzerine özel primary.
export const RgdPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#4f46e5",
      600: "#4338ca",
      700: "#3730a3",
      800: "#312e81",
      900: "#28235f",
      950: "#1e1b4b",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
    },
  },
});
