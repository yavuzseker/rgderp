<template>
  <div class="page">
    <DataTable :value="db.orders" dataKey="id" v-model:expandedRows="expandedRows"
      paginator :rows="10" removableSort class="card-table" :filters="filters"
      :globalFilterFields="['orderNo', 'customerName']" sortField="orderNo" :sortOrder="1">
      <template #header>
        <PageHeader title="Projeler" subtitle="Sipariş altındaki üretim projeleri ve ilerleme"
          addLabel="Yeni Proje" v-model:search="filters.global.value" searchPlaceholder="Sipariş ara..."
          @add="openNew" />
        <StatStrip :items="sums" />
      </template>
      <template #empty><div class="empty">Sipariş yok.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="orderNo" header="Sipariş" sortable style="width: 180px">
        <template #body="{ data }"><b class="mono">{{ data.orderNo }}</b></template>
      </Column>
      <Column field="customerName" header="Müşteri" sortable />
      <Column header="Proje" style="width: 90px">
        <template #body="{ data }"><b>{{ projectsOf(data).length }}</b></template>
      </Column>
      <Column header="Ödeme" style="width: 180px">
        <template #body="{ data }">
          <span class="pay" :class="{ ok: payComplete(data) }">
            <i :class="payComplete(data) ? 'pi pi-check-circle' : 'pi pi-clock'" />
            {{ payComplete(data) ? 'Tamamlandı' : payPct(data) + '%' }}
          </span>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="pr">
          <div class="pr-head">
            <span><i class="pi pi-sitemap" /> {{ data.orderNo }} Projeleri</span>
            <Button icon="pi pi-plus" label="Proje Ekle" size="small" @click="openNew(data)" />
          </div>
          <table class="pr-table">
            <thead><tr><th>Proje</th><th>Ürün</th><th class="r">Miktar</th><th style="width:200px">İlerleme</th><th></th></tr></thead>
            <tbody>
              <tr v-for="p in projectsOf(data)" :key="p.id">
                <td><b>{{ p.name }}</b></td>
                <td>{{ p.productName }}</td>
                <td class="r">{{ p.qty }}</td>
                <td>
                  <div class="prog"><ProgressBar :value="progressOf(p.stages)" :showValue="false" style="height: 7px" /><span>{{ progressOf(p.stages) }}%</span></div>
                </td>
                <td class="r"><Button icon="pi pi-arrow-right" label="Takip" size="small" text @click="router.push(`/projects/${p.id}`)" /></td>
              </tr>
              <tr v-if="!projectsOf(data).length"><td colspan="5" class="empty">Proje yok. “Proje Ekle” ile ekleyin.</td></tr>
            </tbody>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" header="Yeni Proje" modal :style="{ width: '520px' }">
      <div class="form">
        <div class="field"><label>Sipariş *</label>
          <Select v-model="form.orderId" :options="db.orders" optionLabel="orderNo" optionValue="id"
            :invalid="submitted && !form.orderId" placeholder="Sipariş seç" fluid>
            <template #option="{ option }"><div class="opt"><span>{{ option.orderNo }}</span><small>{{ option.customerName }}</small></div></template>
          </Select>
        </div>
        <div class="field"><label>Proje Adı *</label><InputText v-model="form.name" :invalid="submitted && !form.name" placeholder="Örn: Ring Üretimi" /></div>
        <div class="two">
          <div class="field"><label>Ürün</label>
            <Select v-model="form.productId" :options="db.products" optionLabel="name" optionValue="id" placeholder="Ürün seç (opsiyonel)" showClear fluid />
          </div>
          <div class="field"><label>Miktar</label><InputNumber v-model="form.qty" :min="0" placeholder="Opsiyonel" fluid /></div>
        </div>
        <div v-if="route.length" class="route-preview">
          <span class="rp-title">Üretim Rotası</span>
          <div class="rp-flow">
            <template v-for="(s, i) in route" :key="i">
              <span class="rp-step">{{ i + 1 }}. {{ s }}</span>
              <i v-if="i < route.length - 1" class="pi pi-angle-right rp-arrow" />
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button label="Proje Oluştur" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import ProgressBar from "primevue/progressbar";
import PageHeader from "@/components/PageHeader.vue";
import StatStrip, { type StatItem } from "@/components/StatStrip.vue";
import { db, createProject } from "@/data/store";
import { progressOf } from "@/utils";
import type { Order } from "@/types";

const router = useRouter();
const toast = useToast();
const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const expandedRows = ref<Order[]>([]);

const sums = computed<StatItem[]>(() => {
  const projs = db.projects;
  const avg = projs.length ? Math.round(projs.reduce((s, p) => s + progressOf(p.stages), 0) / projs.length) : 0;
  return [
    { label: "Sipariş", value: db.orders.length, icon: "pi-clipboard", tone: "blue" },
    { label: "Proje", value: projs.length, icon: "pi-sitemap", tone: "slate" },
    { label: "Ort. İlerleme", value: avg + "%", icon: "pi-chart-line", tone: "green" },
  ];
});

const projectsOf = (o: Order) => db.projects.filter((p) => p.orderId === o.id);
const payPct = (o: Order) => {
  const bedel = o.contractValue ?? 0;
  if (!bedel) return 0;
  const col = (o.paymentTerms ?? []).filter((t) => t.status === "tahsil").reduce((s, t) => s + ((bedel * t.percent) / 100), 0);
  return Math.round((col / bedel) * 100);
};
const payComplete = (o: Order) => (o.contractValue ?? 0) > 0 && payPct(o) >= 100;

const dialog = ref(false);
const submitted = ref(false);
interface Form { orderId: string | null; name: string; productId: string | null; qty: number | null }
const empty = (): Form => ({ orderId: null, name: "", productId: null, qty: null });
const form = reactive<Form>(empty());

const route = computed(() => {
  const p = db.products.find((x) => x.id === form.productId);
  return p ? p.stages.map((s) => s.name) : [];
});

function openNew(order?: Order) {
  Object.assign(form, empty());
  if (order && order.id) form.orderId = order.id;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.orderId || !form.name.trim()) return;
  createProject({
    orderId: form.orderId,
    name: form.name,
    productId: form.productId ?? undefined,
    qty: form.qty ?? undefined,
  });
  toast.add({ severity: "success", summary: "Proje oluşturuldu", detail: form.name, life: 2500 });
  dialog.value = false;
}
</script>

<style scoped>
@import "@/views/table.css";
.pr { padding: 6px 8px 10px; }
.pr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.pr-head span { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.pr-head i { color: #1488c8; }
.pr-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; }
.pr-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 12px; border-bottom: 1px solid #eef2f7; }
.pr-table td { padding: 9px 12px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.pr-table tbody tr:last-child td { border-bottom: none; }
.pr-table .r { text-align: right; }
.prog { display: flex; align-items: center; gap: 10px; }
.prog span { font-size: 12px; color: #64748b; width: 34px; }
.mono { font-variant-numeric: tabular-nums; font-weight: 700; }
.pay { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #b45309; }
.pay.ok { color: #10b981; }
.opt { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; }
.opt small { color: #94a3b8; }
.empty { text-align: center; color: #94a3b8; padding: 14px; }
.route-preview { background: #ecf6fc; border-radius: 12px; padding: 14px; }
.rp-title { font-size: 12px; font-weight: 700; color: #0f6fa6; text-transform: uppercase; letter-spacing: 0.4px; }
.rp-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
.rp-step { font-size: 13px; color: #115c88; background: #fff; padding: 4px 10px; border-radius: 8px; }
.rp-arrow { color: #66b8e6; font-size: 12px; }
</style>
