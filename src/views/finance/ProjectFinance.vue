<template>
  <div class="pf">
    <!-- Sol: sipariş > proje listesi -->
    <aside class="pf-list">
      <div v-for="grp in grouped" :key="grp.orderNo" class="pf-group">
        <div class="pf-order"><i class="pi pi-clipboard" /> {{ grp.orderNo }}</div>
        <button
          v-for="p in grp.projects"
          :key="p.id"
          class="pf-item"
          :class="{ active: p.id === selectedId }"
          @click="selectedId = p.id"
        >
          <div class="pf-item-t">
            <b>{{ p.name }}</b>
            <span>{{ p.customer }}</span>
          </div>
          <span class="pf-margin" :class="marginClass(projectMargin(p))">%{{ projectMargin(p) }}</span>
        </button>
      </div>
    </aside>

    <!-- Sağ: seçili proje detayı -->
    <section v-if="sel" class="pf-detail">
      <!-- Kâr/zarar özeti -->
      <div class="pnl">
        <div class="pnl-box inc">
          <span>Gelir (Sözleşme)</span>
          <b>{{ fmtMoney(revenue, sel.currency) }}</b>
        </div>
        <div class="pnl-op">−</div>
        <div class="pnl-box exp">
          <span>Tahmini Gider</span>
          <b>{{ fmtMoney(expense, sel.currency) }}</b>
        </div>
        <div class="pnl-op">=</div>
        <div class="pnl-box profit" :class="{ neg: profit < 0 }">
          <span>Tahmini Kâr · %{{ projectMargin(sel) }}</span>
          <b>{{ fmtMoney(profit, sel.currency) }}</b>
        </div>
      </div>

      <!-- Ödeme takvimi (milestone) -->
      <div class="blk">
        <div class="blk-head">
          <h3><i class="pi pi-calendar" /> Ödeme Takvimi (Milestone)</h3>
          <span class="blk-sub">Teknik onaya bağlı, tahmini</span>
        </div>
        <table class="ftable">
          <thead>
            <tr><th>Kod</th><th>Açıklama</th><th class="r">%</th><th class="r">Tutar</th><th>Tahmini Tarih</th><th>Durum</th></tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in sel.milestones" :key="i">
              <td><span class="code">{{ m.code }}</span></td>
              <td>{{ m.description }}</td>
              <td class="r">{{ m.percent }}</td>
              <td class="r mono">{{ fmtMoney(m.amount, m.currency) }}</td>
              <td>
                {{ fmtDate(m.estimatedDate) }}
                <small class="wl" :class="{ over: weeksLeft(m.estimatedDate).overdue }" v-if="m.status !== 'tahsil'">
                  · {{ weeksLeft(m.estimatedDate).text }}
                </small>
              </td>
              <td><Tag :value="MILESTONE_STATUS[m.status].label" :severity="MILESTONE_STATUS[m.status].severity" /></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">Toplam</td>
              <td class="r">{{ totalPct }}</td>
              <td class="r mono"><b>{{ fmtMoney(revenue, sel.currency) }}</b></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
        <p v-if="totalPct !== 100" class="warn"><i class="pi pi-exclamation-triangle" /> Oranlar toplamı %{{ totalPct }} — %100 olmalı.</p>
      </div>

      <!-- Giderler -->
      <div class="blk">
        <div class="blk-head">
          <h3><i class="pi pi-arrow-down-left" /> Proje Giderleri</h3>
          <span class="blk-sub">Tahmini</span>
        </div>
        <table class="ftable">
          <thead>
            <tr><th>Açıklama</th><th>Kategori</th><th class="r">Tutar</th><th>Tarih</th></tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in sel.expenses" :key="i">
              <td>{{ e.description }}</td>
              <td><span class="cat">{{ e.category }}</span></td>
              <td class="r mono">{{ fmtMoney(e.amount, e.currency) }}</td>
              <td>{{ fmtDate(e.date) }}</td>
            </tr>
            <tr v-if="!sel.expenses.length"><td colspan="4" class="empty">Gider girilmemiş.</td></tr>
          </tbody>
          <tfoot>
            <tr><td colspan="2">Toplam</td><td class="r mono"><b>{{ fmtMoney(expense, sel.currency) }}</b></td><td></td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Tag from "primevue/tag";
import { financeProjects } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import {
  fmtMoney,
  projectRevenue,
  projectExpense,
  projectProfit,
  projectMargin,
  weeksLeft,
  MILESTONE_STATUS,
} from "@/finance/types";

const selectedId = ref(financeProjects[0]?.id ?? "");
const sel = computed(() => financeProjects.find((p) => p.id === selectedId.value));

const grouped = computed(() => {
  const map = new Map<string, typeof financeProjects>();
  for (const p of financeProjects) {
    if (!map.has(p.orderNo)) map.set(p.orderNo, []);
    map.get(p.orderNo)!.push(p);
  }
  return [...map.entries()].map(([orderNo, projects]) => ({ orderNo, projects }));
});

const revenue = computed(() => (sel.value ? projectRevenue(sel.value) : 0));
const expense = computed(() => (sel.value ? projectExpense(sel.value) : 0));
const profit = computed(() => (sel.value ? projectProfit(sel.value) : 0));
const totalPct = computed(() => (sel.value ? sel.value.milestones.reduce((s, m) => s + m.percent, 0) : 0));

const marginClass = (m: number) => (m < 0 ? "neg" : m < 20 ? "low" : "ok");
</script>

<style scoped>
.pf { display: grid; grid-template-columns: 300px 1fr; gap: 18px; align-items: start; }

.pf-list { display: flex; flex-direction: column; gap: 16px; }
.pf-group { display: flex; flex-direction: column; gap: 6px; }
.pf-order { font-size: 12px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 6px; padding: 0 4px; }
.pf-item {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 12px 14px;
  cursor: pointer; text-align: left; transition: all 0.14s ease; font: inherit;
}
.pf-item:hover { border-color: #cfe3f3; }
.pf-item.active { border-color: #1488c8; box-shadow: inset 3px 0 0 #1488c8; background: #f6fbfe; }
.pf-item-t b { display: block; font-size: 14px; color: #0f172a; }
.pf-item-t span { font-size: 11.5px; color: #94a3b8; }
.pf-margin { font-size: 12.5px; font-weight: 800; padding: 3px 8px; border-radius: 20px; }
.pf-margin.ok { color: #10b981; background: #e7f7ef; }
.pf-margin.low { color: #f59e0b; background: #fef3e2; }
.pf-margin.neg { color: #ef4444; background: #fdeaea; }

.pf-detail { display: flex; flex-direction: column; gap: 18px; }

.pnl { display: flex; align-items: stretch; gap: 10px; }
.pnl-box { flex: 1; background: #fff; border: 1px solid #eef2f7; border-radius: 14px; padding: 16px 18px; }
.pnl-box span { font-size: 12px; color: #64748b; }
.pnl-box b { display: block; font-size: 20px; font-weight: 800; margin-top: 4px; }
.pnl-box.inc b { color: #1488c8; }
.pnl-box.exp b { color: #f59e0b; }
.pnl-box.profit b { color: #10b981; }
.pnl-box.profit.neg b { color: #ef4444; }
.pnl-op { display: grid; place-items: center; font-size: 22px; color: #cbd5e1; font-weight: 700; }

.blk { background: #fff; border: 1px solid #eef2f7; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
.blk-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.blk-head h3 { margin: 0; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.blk-head h3 i { color: #1488c8; }
.blk-sub { font-size: 12px; color: #94a3b8; }

.ftable { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.ftable th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 10px; border-bottom: 1px solid #eef2f7; }
.ftable td { padding: 10px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.ftable tbody tr:last-child td { border-bottom: none; }
.ftable .r { text-align: right; }
.ftable .mono { font-variant-numeric: tabular-nums; }
.ftable tfoot td { padding: 10px; font-size: 13px; color: #0f172a; border-top: 2px solid #eef2f7; }
.code { font-size: 11px; font-weight: 800; color: #1488c8; background: #e8f4fb; padding: 3px 7px; border-radius: 6px; white-space: nowrap; }
.cat { font-size: 11.5px; color: #64748b; background: #f1f5f9; padding: 3px 9px; border-radius: 20px; }
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }
.empty { color: #94a3b8; text-align: center; padding: 18px; }
.warn { color: #b45309; font-size: 12.5px; margin: 10px 0 0; display: flex; align-items: center; gap: 6px; }

@media (max-width: 900px) {
  .pf { grid-template-columns: 1fr; }
  .pnl { flex-direction: column; }
  .pnl-op { display: none; }
}
</style>
