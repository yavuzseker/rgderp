<template>
  <div class="fin-overview">
    <!-- Kasa -->
    <div class="kasa">
      <div class="kasa-head">
        <span><i class="pi pi-wallet" /> Kasa <small>(bugün)</small></span>
        <Button icon="pi pi-pencil" text rounded @click="openCash" v-tooltip.top="'Düzenle'" />
      </div>
      <div class="kasa-figs">
        <div class="kfig"><span>TL</span><b>{{ fmtMoney(cash.tl, "TL") }}</b></div>
        <div class="kfig"><span>EUR</span><b>{{ fmtMoney(cash.eur, "EUR") }}</b></div>
        <div class="kfig eq"><span>Toplam (EUR karşılığı)</span><b>{{ fmtMoney(cash.eur + cash.tl / eurTry, "EUR") }}</b></div>
      </div>
    </div>

    <!-- KPI kartları -->
    <div class="kpis">
      <div class="kpi">
        <span class="kpi-ic blue"><i class="pi pi-file-edit" /></span>
        <div><b>{{ fmtMoney(totalContract) }}</b><span>Toplam Sözleşme</span></div>
      </div>
      <div class="kpi">
        <span class="kpi-ic green"><i class="pi pi-check-circle" /></span>
        <div><b>{{ fmtMoney(collected) }}</b><span>Tahsil Edilen</span></div>
      </div>
      <div class="kpi">
        <span class="kpi-ic amber"><i class="pi pi-clock" /></span>
        <div><b>{{ fmtMoney(pending) }}</b><span>Bekleyen Alacak</span></div>
      </div>
      <div class="kpi">
        <span class="kpi-ic red"><i class="pi pi-arrow-down-left" /></span>
        <div><b>{{ fmtMoney(totalExpense) }}</b><span>Proje Gideri (tahmini)</span></div>
      </div>
      <div class="kpi">
        <span class="kpi-ic teal"><i class="pi pi-chart-line" /></span>
        <div><b :class="{ neg: netProfit < 0 }">{{ fmtMoney(netProfit) }}</b><span>Proje Kârı (tahmini)</span></div>
      </div>
    </div>

    <div class="grid">
      <!-- Nakit akışı -->
      <section class="card flow">
        <header>
          <div>
            <h3>Aylık Nakit Akışı <small>(EUR karşılığı)</small></h3>
            <p class="flow-note">Kasa + Gelirler − (Proje + Sabit + Kredi + Çek)</p>
          </div>
          <div class="flow-end">
            <span>Dönem sonu tahmini kasa</span>
            <b :class="{ neg: endCash < 0 }">{{ fmtMoney(endCash) }}</b>
          </div>
        </header>
        <div class="legend">
          <span><i class="dot inc" /> Gelir</span>
          <span><i class="dot exp" /> Gider</span>
          <span><i class="dot run" /> Kümülatif kasa</span>
        </div>
        <div class="bars">
          <div v-for="m in flow" :key="m.key" class="bar-col">
            <div class="bar-pair">
              <div class="bar inc" :style="{ height: pct(m.income) + '%' }" v-tooltip.top="'Gelir: ' + fmtMoney(m.income)" />
              <div class="bar exp" :style="{ height: pct(m.expense) + '%' }" v-tooltip.top="'Gider: ' + fmtMoney(m.expense)" />
            </div>
            <span class="run-val" :class="{ neg: m.running < 0 }" v-tooltip.top="'Kasa: ' + fmtMoney(m.running)">{{ short(m.running) }}</span>
            <span class="bar-lbl">{{ m.label }}</span>
          </div>
        </div>
      </section>

      <!-- Yaklaşan tahsilatlar -->
      <section class="card upcoming">
        <header><h3>Yaklaşan Tahsilatlar</h3></header>
        <ul class="up-list">
          <li v-for="(u, i) in upcoming" :key="i">
            <div class="up-main">
              <span class="up-code">{{ u.code }}</span>
              <div class="up-txt">
                <b>{{ u.project }}</b>
                <span>{{ u.customer }} · %{{ u.percent }}</span>
              </div>
            </div>
            <div class="up-right">
              <b>{{ fmtMoney(u.amount, u.currency) }}</b>
              <span class="up-when" :class="{ over: u.over }">{{ u.when }}</span>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <Dialog v-model:visible="cashDialog" header="Kasa Durumu" modal :style="{ width: '400px' }">
      <div class="cash-form">
        <div class="field"><label>TL Bakiye</label><InputNumber v-model="cashForm.tl" :min="0" fluid /></div>
        <div class="field"><label>EUR Bakiye</label><InputNumber v-model="cashForm.eur" :min="0" fluid /></div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="cashDialog = false" />
        <Button label="Kaydet" icon="pi pi-check" @click="saveCash" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import { financeProjects, eurTry, cash } from "@/data/financeMock";
import { monthlyCashflow } from "@/finance/cashflow";
import {
  fmtMoney,
  projectRevenue,
  projectCollected,
  projectExpense,
  weeksLeft,
  type Currency,
} from "@/finance/types";

const cashDialog = ref(false);
const cashForm = reactive({ tl: 0, eur: 0 });
function openCash() {
  cashForm.tl = cash.tl;
  cashForm.eur = cash.eur;
  cashDialog.value = true;
}
function saveCash() {
  cash.tl = cashForm.tl;
  cash.eur = cashForm.eur;
  cashDialog.value = false;
}

const toEur = (n: number, cur: Currency) => (cur === "EUR" ? n : n / eurTry);

const totalContract = computed(() =>
  financeProjects.reduce((s, p) => s + toEur(projectRevenue(p), p.currency), 0)
);
const collected = computed(() =>
  financeProjects.reduce((s, p) => s + toEur(projectCollected(p), p.currency), 0)
);
const pending = computed(() => totalContract.value - collected.value);
const totalExpense = computed(() =>
  financeProjects.reduce((s, p) => s + toEur(projectExpense(p), p.currency), 0)
);
const netProfit = computed(() => totalContract.value - totalExpense.value);

const flow = computed(() => monthlyCashflow(12));
const flowMax = computed(() => Math.max(1, ...flow.value.flatMap((m) => [m.income, m.expense])));
const pct = (v: number) => Math.round((v / flowMax.value) * 100);
const endCash = computed(() => flow.value.at(-1)?.running ?? 0);

// Kısa para formatı: 1.2M / 340K / -50K
function short(n: number) {
  const a = Math.abs(n);
  const s = n < 0 ? "-" : "";
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${s}${Math.round(a / 1e3)}K`;
  return `${Math.round(n)}`;
}

const upcoming = computed(() =>
  financeProjects
    .flatMap((p) =>
      p.milestones
        .filter((m) => m.status !== "tahsil")
        .map((m) => {
          const w = weeksLeft(m.estimatedDate);
          return {
            code: m.code,
            project: p.name,
            customer: p.customer,
            percent: m.percent,
            amount: m.amount,
            currency: p.currency,
            date: m.estimatedDate,
            when: w.text,
            over: w.overdue,
          };
        })
    )
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 8)
);
</script>

<style scoped>
.fin-overview { display: flex; flex-direction: column; gap: 18px; }

.kasa { background: linear-gradient(135deg, #115c88, #0c2840); color: #fff; border-radius: 16px; padding: 18px 22px; }
.kasa-head { display: flex; align-items: center; justify-content: space-between; }
.kasa-head span { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.kasa-head small { color: #8fc4e8; font-weight: 500; }
.kasa-head :deep(.p-button) { color: #cfe8f8; }
.kasa-figs { display: flex; gap: 40px; margin-top: 12px; flex-wrap: wrap; }
.kfig span { display: block; font-size: 12px; color: #a1d2f0; margin-bottom: 3px; }
.kfig b { font-size: 24px; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; }
.kfig.eq { margin-left: auto; text-align: right; }
.kfig.eq b { color: #86cff0; }

.cash-form { display: flex; flex-direction: column; gap: 14px; padding-top: 6px; }
.cash-form .field { display: flex; flex-direction: column; gap: 6px; }
.cash-form label { font-size: 13px; font-weight: 600; color: #334155; }

.kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.kpi {
  background: #fff; border: 1px solid #eef2f7; border-radius: 14px; padding: 16px;
  display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.kpi-ic { width: 42px; height: 42px; border-radius: 11px; display: grid; place-items: center; font-size: 18px; flex-shrink: 0; }
.kpi-ic.blue { background: #e8f4fb; color: #1488c8; }
.kpi-ic.green { background: #e7f7ef; color: #10b981; }
.kpi-ic.amber { background: #fef3e2; color: #f59e0b; }
.kpi-ic.red { background: #fdeaea; color: #ef4444; }
.kpi-ic.teal { background: #e6f6f6; color: #0e9aa7; }
.kpi b { display: block; font-size: 19px; font-weight: 800; color: #0f172a; }
.kpi b.neg { color: #ef4444; }
.kpi span { font-size: 12.5px; color: #64748b; }

.grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; }
.card { background: #fff; border: 1px solid #eef2f7; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
.card header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card h3 { margin: 0; font-size: 15px; font-weight: 700; }
.card h3 small { color: #94a3b8; font-weight: 500; }

.card header { align-items: flex-start; }
.flow-note { margin: 4px 0 0; font-size: 11.5px; color: #94a3b8; }
.flow-end { text-align: right; }
.flow-end span { display: block; font-size: 11px; color: #94a3b8; }
.flow-end b { font-size: 16px; font-weight: 800; color: #10b981; }
.flow-end b.neg { color: #ef4444; }

.legend { display: flex; gap: 14px; font-size: 12px; color: #64748b; margin-bottom: 6px; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 4px; }
.dot.inc { background: #1488c8; }
.dot.exp { background: #f59e0b; }
.dot.run { background: #10b981; }

.bars { display: flex; align-items: flex-end; gap: 8px; height: 200px; padding-top: 10px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; }
.bar-pair { display: flex; align-items: flex-end; gap: 3px; height: 100%; width: 100%; justify-content: center; }
.bar { width: 42%; border-radius: 4px 4px 0 0; min-height: 3px; transition: height 0.3s ease; }
.bar.inc { background: linear-gradient(180deg, #38a6dd, #1488c8); }
.bar.exp { background: linear-gradient(180deg, #fbbf5a, #f59e0b); }
.run-val { font-size: 10px; font-weight: 700; color: #10b981; font-variant-numeric: tabular-nums; }
.run-val.neg { color: #ef4444; }
.bar-lbl { font-size: 10.5px; color: #94a3b8; white-space: nowrap; }

.up-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.up-list li { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.up-list li:last-child { border-bottom: none; }
.up-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
.up-code { font-size: 11px; font-weight: 800; color: #1488c8; background: #e8f4fb; padding: 3px 7px; border-radius: 6px; white-space: nowrap; }
.up-txt { display: flex; flex-direction: column; min-width: 0; }
.up-txt b { font-size: 13.5px; color: #0f172a; }
.up-txt span { font-size: 11.5px; color: #94a3b8; }
.up-right { text-align: right; flex-shrink: 0; }
.up-right b { font-size: 13.5px; color: #0f172a; }
.up-when { display: block; font-size: 10.5px; font-weight: 700; color: #64748b; }
.up-when.over { color: #ef4444; }

@media (max-width: 1000px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .grid { grid-template-columns: 1fr; }
}
</style>
