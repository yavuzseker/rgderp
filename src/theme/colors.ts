// Merkezi renk paleti — tüm ekranlar buradan beslenir.
export const colors = {
  primary: "#1E40AF",
  primaryDark: "#1E3A8A",
  primaryLight: "#3B82F6",
  accent: "#06B6D4",

  // Modül renkleri (dashboard / ikon vurguları)
  product: "#6366F1",
  supplier: "#F59E0B",
  customer: "#10B981",
  order: "#EC4899",

  // Durum renkleri
  pending: "#94A3B8",
  active: "#F59E0B",
  done: "#10B981",
  open: "#3B82F6",
  inProgress: "#F59E0B",
  completed: "#10B981",
  cancelled: "#EF4444",

  // Nötr
  bg: "#F1F5F9",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  danger: "#EF4444",
};

// Modül başına gradient çiftleri
export const gradients: Record<string, [string, string]> = {
  primary: ["#1E40AF", "#3B82F6"],
  product: ["#6366F1", "#818CF8"],
  supplier: ["#F59E0B", "#FBBF24"],
  customer: ["#10B981", "#34D399"],
  order: ["#EC4899", "#F472B6"],
};
