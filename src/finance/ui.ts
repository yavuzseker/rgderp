// Finans form ekranları için paylaşılan seçenek listeleri.
import { MILESTONE_CATALOG } from "@/finance/types";

export const CUR = [
  { label: "EUR", value: "EUR" },
  { label: "TL", value: "TL" },
];

export const MILESTONE_OPTIONS = MILESTONE_CATALOG.map((m) => ({
  label: `${m.code} — ${m.label}`,
  code: m.code,
  defaultPercent: m.defaultPercent,
}));

export const STATUS_OPTIONS = [
  { label: "Tahmini", value: "bekliyor" },
  { label: "Faturalandı", value: "faturalandi" },
  { label: "Tahsil edildi", value: "tahsil" },
];
