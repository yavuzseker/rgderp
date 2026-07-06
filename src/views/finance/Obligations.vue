<template>
  <div class="obl">
    <!-- Sabit giderler -->
    <section class="card">
      <header><h3><i class="pi pi-refresh" /> Sabit Giderler <small>aylık</small></h3></header>
      <table class="ftable">
        <thead><tr><th>Kalem</th><th class="c">Ödeme Günü</th><th class="r">Tutar</th></tr></thead>
        <tbody>
          <tr v-for="(f, i) in fixedExpenses" :key="i">
            <td>{{ f.name }}</td>
            <td class="c">Her ayın {{ f.dayOfMonth }}.</td>
            <td class="r mono">{{ fmtMoney(f.amount, f.currency) }}</td>
          </tr>
        </tbody>
        <tfoot><tr><td colspan="2">Aylık Toplam (TL)</td><td class="r mono"><b>{{ fmtMoney(fixedTotal, "TL") }}</b></td></tr></tfoot>
      </table>
    </section>

    <!-- Krediler -->
    <section class="card">
      <header><h3><i class="pi pi-percentage" /> Krediler</h3></header>
      <table class="ftable">
        <thead><tr><th>Kredi</th><th>Banka</th><th class="r">Kalan</th><th class="r">Aylık Taksit</th></tr></thead>
        <tbody>
          <tr v-for="(l, i) in loans" :key="i">
            <td>{{ l.name }}</td>
            <td><span class="cat">{{ l.bank }}</span></td>
            <td class="r mono">{{ fmtMoney(l.remaining, l.currency) }}</td>
            <td class="r mono">{{ fmtMoney(l.monthlyInstallment, l.currency) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Çekler -->
    <section class="card">
      <header><h3><i class="pi pi-money-bill" /> Ödenecek Çekler</h3></header>
      <table class="ftable">
        <thead><tr><th>Firma</th><th>Banka</th><th class="r">Tutar</th><th>Vade</th></tr></thead>
        <tbody>
          <tr v-for="(c, i) in sortedChecks" :key="i">
            <td>{{ c.firma }}</td>
            <td><span class="cat">{{ c.bank }}</span></td>
            <td class="r mono">{{ fmtMoney(c.amount, c.currency) }}</td>
            <td>
              {{ fmtDate(c.dueDate) }}
              <small class="wl" :class="{ over: weeksLeft(c.dueDate).overdue }">· {{ weeksLeft(c.dueDate).text }}</small>
            </td>
          </tr>
        </tbody>
        <tfoot><tr><td colspan="2">Toplam (TL)</td><td class="r mono"><b>{{ fmtMoney(checkTotal, "TL") }}</b></td><td></td></tr></tfoot>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { fixedExpenses, loans, checks } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft } from "@/finance/types";

const fixedTotal = computed(() =>
  fixedExpenses.filter((f) => f.currency === "TL").reduce((s, f) => s + f.amount, 0)
);
const checkTotal = computed(() =>
  checks.filter((c) => c.currency === "TL").reduce((s, c) => s + c.amount, 0)
);
const sortedChecks = computed(() => [...checks].sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)));
</script>

<style scoped>
.obl { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.card:first-child { grid-row: span 2; }
.card { background: #fff; border: 1px solid #eef2f7; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
.card header { margin-bottom: 12px; }
.card h3 { margin: 0; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.card h3 i { color: #1488c8; }
.card h3 small { color: #94a3b8; font-weight: 500; }

.ftable { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.ftable th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 10px; border-bottom: 1px solid #eef2f7; }
.ftable td { padding: 10px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.ftable tbody tr:last-child td { border-bottom: none; }
.ftable .r { text-align: right; }
.ftable .c { text-align: center; }
.ftable .mono { font-variant-numeric: tabular-nums; }
.ftable tfoot td { padding: 10px; color: #0f172a; border-top: 2px solid #eef2f7; }
.cat { font-size: 11.5px; color: #64748b; background: #f1f5f9; padding: 3px 9px; border-radius: 20px; }
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }

@media (max-width: 900px) {
  .obl { grid-template-columns: 1fr; }
  .card:first-child { grid-row: auto; }
}
</style>
