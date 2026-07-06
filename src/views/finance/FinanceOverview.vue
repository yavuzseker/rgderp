<template>
  <div class="fin-overview">
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
        <div><b>{{ fmtMoney(totalExpense) }}</b><span>Tahmini Gider</span></div>
      </div>
      <div class="kpi">
        <span class="kpi-ic teal"><i class="pi pi-wallet" /></span>
        <div><b :class="{ neg: netProfit < 0 }">{{ fmtMoney(netProfit) }}</b><span>Tahmini Net Kâr</span></div>
      </div>
    </div>

    <div class="grid">
      <!-- Nakit akışı -->
      <section class="card flow">
        <header>
          <h3>Aylık Nakit Akışı <small>(EUR karşılığı)</small></h3>
          <div class="legend">
            <span><i class="dot inc" /> Gelir</span>
            <span><i class="dot exp" /> Gider</span>
          </div>
        </header>
        <div class="bars">
          <div v-for="m in monthlyFlow" :key="m.month" class="bar-col">
            <div class="bar-pair">
              <div class="bar inc" :style="{ height: pct(m.income) + '%' }" v-tooltip.top="fmtMoney(m.income)" />
              <div class="bar exp" :style="{ height: pct(m.expense) + '%' }" v-tooltip.top="fmtMoney(m.expense)" />
            </div>
            <span class="bar-lbl">{{ m.month }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { financeProjects, monthlyFlow, eurTry } from "@/data/financeMock";
import {
  fmtMoney,
  projectRevenue,
  projectCollected,
  projectExpense,
  weeksLeft,
  type Currency,
} from "@/finance/types";

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

const flowMax = computed(() =>
  Math.max(...monthlyFlow.flatMap((m) => [m.income, m.expense]))
);
const pct = (v: number) => Math.round((v / flowMax.value) * 100);

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

.legend { display: flex; gap: 14px; font-size: 12px; color: #64748b; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 4px; }
.dot.inc { background: #1488c8; }
.dot.exp { background: #f59e0b; }

.bars { display: flex; align-items: flex-end; gap: 8px; height: 190px; padding-top: 10px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
.bar-pair { display: flex; align-items: flex-end; gap: 3px; height: 100%; width: 100%; justify-content: center; }
.bar { width: 42%; border-radius: 4px 4px 0 0; min-height: 3px; transition: height 0.3s ease; }
.bar.inc { background: linear-gradient(180deg, #38a6dd, #1488c8); }
.bar.exp { background: linear-gradient(180deg, #fbbf5a, #f59e0b); }
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
