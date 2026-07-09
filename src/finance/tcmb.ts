// TCMB günlük döviz kuru (today.xml) → EUR Döviz Satış (ForexSelling).
// TCMB CORS vermediği için birkaç public proxy sırayla denenir (biri takılırsa
// diğerine geçer). Küçük iç araç için yeterli; kur Firestore'a cache'lenir.

const TCMB = "https://www.tcmb.gov.tr/kurlar/today.xml";
const PROXIES: ((u: string) => string)[] = [
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
];

function parseEurSelling(text: string): number | null {
  const m = text.match(/Kod="EUR"[\s\S]*?<ForexSelling>([\d.,]+)<\/ForexSelling>/);
  const raw = m?.[1]?.replace(",", ".");
  const r = raw ? parseFloat(raw) : NaN;
  return !r || Number.isNaN(r) ? null : r;
}

export async function fetchTcmbEurSelling(): Promise<{ rate: number }> {
  let lastErr = "";
  for (const mk of PROXIES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(mk(TCMB), { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rate = parseEurSelling(await res.text());
      if (rate) return { rate };
      throw new Error("EUR satış kuru bulunamadı");
    } catch (e: any) {
      lastErr = e?.message ?? "hata";
    }
  }
  throw new Error("Kur alınamadı (" + lastErr + ")");
}
