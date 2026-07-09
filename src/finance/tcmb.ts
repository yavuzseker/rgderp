// TCMB günlük döviz kuru (today.xml) → EUR Döviz Satış (ForexSelling).
// TCMB CORS başlığı vermediği için public bir CORS proxy üzerinden okunur.
// Küçük iç araç için yeterli; kur Firestore'a cache'lenir (settings/finance).

const TCMB = "https://www.tcmb.gov.tr/kurlar/today.xml";
const PROXY = "https://api.allorigins.win/raw?url=";

export async function fetchTcmbEurSelling(): Promise<{ rate: number; date: string }> {
  const res = await fetch(PROXY + encodeURIComponent(TCMB));
  if (!res.ok) throw new Error("TCMB verisi alınamadı (HTTP " + res.status + ")");
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");

  const node =
    xml.querySelector('Currency[Kod="EUR"] ForexSelling') ||
    xml.querySelector('Currency[CurrencyCode="EUR"] ForexSelling');
  const raw = node?.textContent?.trim().replace(",", ".");
  const rate = raw ? parseFloat(raw) : NaN;
  if (!rate || Number.isNaN(rate)) throw new Error("EUR satış kuru bulunamadı");

  const date = xml.querySelector("Tarih_Date")?.getAttribute("Date") || "";
  return { rate, date };
}
