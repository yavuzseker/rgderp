import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

// RGD kurumsal palet — logodaki canlı mavi tabanlı primary.
// (Logodaki gri ton, aşağıdaki nötr surface/slate skalasıyla zaten uyumlu.)
export const RgdPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#ecf6fc",
      100: "#cfe8f8",
      200: "#a1d2f0",
      300: "#66b8e6",
      400: "#2f9ddb",
      500: "#1488c8",
      600: "#0f6fa6",
      700: "#115c88",
      800: "#154d6f",
      900: "#16405d",
      950: "#0c2840",
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
