<template>
  <div class="page">
    <div class="stats">
      <StatCard label="Aktif Sipariş" :value="activeCount" icon="pi-clipboard" color="#1488c8" />
      <StatCard label="Üretimde" :value="inProgressCount" icon="pi-cog" color="#f59e0b" />
      <StatCard label="Tamamlanan" :value="completedCount" icon="pi-check-circle" color="#10b981" />
      <StatCard label="Tedarikçi" :value="db.suppliers.length" icon="pi-truck" color="#0e7490" />
    </div>

    <div class="grid">
      <Card class="col-main">
        <template #title>
          <div class="card-head">
            <span>Devam Eden Üretim</span>
            <Button label="Tümü" size="small" text icon="pi pi-arrow-right" icon-pos="right" @click="router.push('/orders')" />
          </div>
        </template>
        <template #content>
          <DataTable :value="ongoing" :rows="6" dataKey="id" class="clean" @row-click="goOrder">
            <template #empty><div class="empty">Devam eden üretim yok.</div></template>
            <Column field="orderNo" header="Sipariş">
              <template #body="{ data }">
                <span class="mono">{{ data.orderNo }}</span>
              </template>
            </Column>
            <Column field="productName" header="Ürün" />
            <Column field="customerName" header="Müşteri" />
            <Column header="İlerleme" style="width: 200px">
              <template #body="{ data }">
                <div class="prog">
                  <ProgressBar :value="progressOf(data.stages)" :showValue="false" style="height: 7px" />
                  <span>{{ progressOf(data.stages) }}%</span>
                </div>
              </template>
            </Column>
            <Column header="Durum">
              <template #body="{ data }">
                <Tag :value="orderStatus[data.status].label" :severity="orderStatus[data.status].severity" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card class="col-side">
        <template #title>Yaklaşan Terminler</template>
        <template #content>
          <ul class="due-list">
            <li v-for="o in upcoming" :key="o.id" @click="router.push(`/orders/${o.id}`)">
              <div class="due-dot" :class="dueClass(o.dueDate)" />
              <div class="due-body">
                <strong>{{ o.orderNo }}</strong>
                <span>{{ o.customerName }}</span>
              </div>
              <div class="due-date">{{ fmtDate(o.dueDate) }}</div>
            </li>
            <li v-if="!upcoming.length" class="empty">Yaklaşan termin yok.</li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import StatCard from "@/components/StatCard.vue";
import { db } from "@/data/store";
import { orderStatus, fmtDate, progressOf } from "@/utils";
import type { Order } from "@/types";

const router = useRouter();

const activeCount = computed(() => db.orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length);
const inProgressCount = computed(() => db.orders.filter((o) => o.status === "in_progress").length);
const completedCount = computed(() => db.orders.filter((o) => o.status === "completed").length);

const ongoing = computed(() => db.orders.filter((o) => o.status === "open" || o.status === "in_progress"));
const upcoming = computed(() =>
  [...db.orders]
    .filter((o) => o.status !== "completed" && o.status !== "cancelled")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 6)
);

function goOrder(e: { data: Order }) {
  router.push(`/orders/${e.data.id}`);
}
function dueClass(iso: string) {
  const days = (+new Date(iso) - Date.now()) / 86400000;
  return days < 7 ? "red" : days < 15 ? "amber" : "green";
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 22px; }
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}
@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; }
}
.card-head { display: flex; justify-content: space-between; align-items: center; font-size: 16px; }
.mono { font-variant-numeric: tabular-nums; font-weight: 600; }
.prog { display: flex; align-items: center; gap: 10px; }
.prog span { font-size: 12px; color: #64748b; width: 34px; }
.empty { color: #94a3b8; padding: 18px 4px; text-align: center; }

.due-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.due-list li {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 6px; border-bottom: 1px solid #f1f5f9; cursor: pointer;
}
.due-list li:hover { background: #f8fafc; }
.due-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.due-dot.red { background: #ef4444; }
.due-dot.amber { background: #f59e0b; }
.due-dot.green { background: #10b981; }
.due-body { display: flex; flex-direction: column; flex: 1; }
.due-body strong { font-size: 14px; }
.due-body span { font-size: 12px; color: #64748b; }
.due-date { font-size: 12px; color: #475569; }
</style>
