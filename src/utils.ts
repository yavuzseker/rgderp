import type { OrderStatus, StageStatus } from "@/types";

type Sev = "info" | "warn" | "success" | "danger" | "secondary";

export const orderStatus: Record<string, { label: string; severity: Sev }> = {
  open: { label: "Açık", severity: "info" },
  in_progress: { label: "Üretimde", severity: "warn" },
  completed: { label: "Tamamlandı", severity: "success" },
  cancelled: { label: "İptal", severity: "danger" },
};

export const stageStatus: Record<string, { label: string; severity: Sev }> = {
  pending: { label: "Bekliyor", severity: "secondary" },
  active: { label: "Aktif", severity: "warn" },
  done: { label: "Tamamlandı", severity: "success" },
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const progressOf = (stages: { status: StageStatus }[]) =>
  stages.length
    ? Math.round((stages.filter((s) => s.status === "done").length / stages.length) * 100)
    : 0;
