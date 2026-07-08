<template>
  <div class="pf">
    <!-- Sol: sipariş listesi -->
    <aside class="pf-list">
      <button
        v-for="o in db.orders"
        :key="o.id"
        class="pf-item"
        :class="{ active: sel && o.id === sel.id }"
        @click="selectedId = o.id"
      >
        <div class="pf-item-t">
          <b>{{ o.orderNo }}</b>
          <span>{{ o.customerName }}</span>
        </div>
        <span class="pf-margin" :class="marginClass(orderMargin(o))">%{{ orderMargin(o) }}</span>
      </button>
      <div v-if="!db.orders.length" class="pf-empty">Sipariş yok.</div>
    </aside>

    <!-- Sağ: seçili sipariş detayı -->
    <section v-if="sel" class="pf-detail">
      <!-- Kâr/zarar özeti -->
      <div class="pnl">
        <div class="pnl-box inc">
          <span>Gelir (Bedel)</span>
          <b>{{ fmtMoney(revenue, cur) }}</b>
        </div>
        <div class="pnl-op">−</div>
        <div class="pnl-box exp">
          <span>Tahmini Gider</span>
          <b>{{ fmtMoney(expense, cur) }}</b>
        </div>
        <div class="pnl-op">=</div>
        <div class="pnl-box profit" :class="{ neg: profit < 0 }">
          <span>Tahmini Kâr · %{{ orderMargin(sel) }}</span>
          <b>{{ fmtMoney(profit, cur) }}</b>
        </div>
      </div>

      <!-- Ödeme koşulları -->
      <div class="blk">
        <div class="blk-head">
          <h3><i class="pi pi-calendar" /> Ödeme Koşulları</h3>
          <span class="blk-sub">{{ sel.orderNo }} · {{ sel.customerName }}</span>
        </div>
        <table class="ftable">
          <thead>
            <tr><th>Kod</th><th class="r">%</th><th class="r">Tutar</th><th>Tahmini Vade</th><th>Durum</th></tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in (sel.paymentTerms || [])" :key="i">
              <td><span class="code">{{ t.code }}</span></td>
              <td class="r">{{ t.percent }}</td>
              <td class="r mono">{{ fmtMoney(amountOf(t), cur) }}</td>
              <td>
                {{ fmtDate(t.dueDate) }}
                <small class="wl" :class="{ over: weeksLeft(t.dueDate).overdue }" v-if="t.status !== 'tahsil'">· {{ weeksLeft(t.dueDate).text }}</small>
              </td>
              <td><Tag :value="MILESTONE_STATUS[t.status].label" :severity="MILESTONE_STATUS[t.status].severity" /></td>
            </tr>
            <tr v-if="!(sel.paymentTerms || []).length"><td colspan="5" class="empty">Ödeme koşulu girilmemiş.</td></tr>
          </tbody>
          <tfoot>
            <tr><td>Toplam</td><td class="r">{{ totalPct }}</td><td class="r mono"><b>{{ fmtMoney(termsTotal, cur) }}</b></td><td colspan="2"></td></tr>
          </tfoot>
        </table>
        <p v-if="(sel.paymentTerms || []).length && totalPct !== 100" class="warn"><i class="pi pi-exclamation-triangle" /> Oranlar toplamı %{{ totalPct }} — %100 olmalı.</p>
      </div>

      <!-- Giderler (projelerden) -->
      <div class="blk">
        <div class="blk-head">
          <h3><i class="pi pi-arrow-down-left" /> Proje Giderleri</h3>
          <span class="blk-sub">Projelerden</span>
        </div>
        <table class="ftable">
          <thead>
            <tr><th>Proje</th><th>Açıklama</th><th>Kategori</th><th class="r">Tutar</th><th>Tarih</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in expLines" :key="i">
              <td>{{ row.project }}</td>
              <td>{{ row.e.description }}</td>
              <td><span class="cat">{{ row.e.category }}</span></td>
              <td class="r mono">{{ fmtMoney(row.e.amount, cur) }}</td>
              <td>{{ fmtDate(row.e.date) }}</td>
            </tr>
            <tr v-if="!expLines.length"><td colspan="5" class="empty">Gider yok — Projeler / Proje Giderleri'nden girilir.</td></tr>
          </tbody>
          <tfoot>
            <tr><td colspan="3">Toplam</td><td class="r mono"><b>{{ fmtMoney(expense, cur) }}</b></td><td></td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Tag from "primevue/tag";
import { db } from "@/data/store";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, MILESTONE_STATUS } from "@/finance/types";
import { orderRevenue, orderExpense, orderProfit, orderMargin, orderTermsTotal, termAmount } from "@/finance/calc";
import type { PaymentTerm } from "@/types";

const selectedId = ref("");
const sel = computed(() => db.orders.find((o) => o.id === selectedId.value) ?? db.orders[0]);
const cur = computed<"EUR" | "TL">(() => sel.value?.currency ?? "EUR");

const revenue = computed(() => (sel.value ? orderRevenue(sel.value) : 0));
const expense = computed(() => (sel.value ? orderExpense(sel.value) : 0));
const profit = computed(() => (sel.value ? orderProfit(sel.value) : 0));
const totalPct = computed(() => (sel.value?.paymentTerms ?? []).reduce((s, t) => s + t.percent, 0));
const termsTotal = computed(() => (sel.value ? orderTermsTotal(sel.value) : 0));
const amountOf = (t: PaymentTerm) => (sel.value ? termAmount(sel.value, t.percent) : 0);
const expLines = computed(() =>
  sel.value
    ? db.projects
        .filter((p) => p.orderId === sel.value!.id)
        .flatMap((p) => (p.expenses ?? []).map((e) => ({ project: p.name, e })))
    : []
);

const marginClass = (m: number) => (m < 0 ? "neg" : m < 20 ? "low" : "ok");
</script>

<style scoped>
.pf { display: grid; grid-template-columns: 300px 1fr; gap: 18px; align-items: start; }

.pf-list { display: flex; flex-direction: column; gap: 8px; }
.pf-empty { color: #94a3b8; font-size: 13px; padding: 12px; text-align: center; }
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
