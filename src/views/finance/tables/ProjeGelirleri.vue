<template>
  <div class="fpage">
    <DataTable :value="db.orders" dataKey="id" v-model:expandedRows="expandedRows"
      paginator :rows="10" removableSort class="card-table" sortField="orderNo" :sortOrder="1">
      <template #header>
        <div class="fh">
          <div><h3>Proje Gelirleri (Alacaklar)</h3><p>Sipariş bazında — satıra basınca ödeme koşulları açılır</p></div>
        </div>
      </template>
      <template #empty><div class="empty">Sipariş yok.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="orderNo" header="Sipariş" sortable style="width: 170px">
        <template #body="{ data }"><b class="mono">{{ data.orderNo }}</b></template>
      </Column>
      <Column field="customerName" header="Müşteri" sortable />
      <Column header="Bedel" style="width: 150px">
        <template #body="{ data }">
          <span v-if="data.contractValue" class="mono">{{ fmtMoney(data.contractValue, data.currency || 'EUR') }}</span>
          <span v-else class="muted">—</span>
        </template>
      </Column>
      <Column header="Koşul" style="width: 90px">
        <template #body="{ data }"><b>{{ (data.paymentTerms || []).length }}</b></template>
      </Column>
      <Column header="Tahsil / Bedel" style="width: 200px">
        <template #body="{ data }">
          <span class="mono ok">{{ fmtMoney(collected(data), data.currency || 'EUR') }}</span>
          <small class="sub"> / {{ fmtMoney(data.contractValue || 0, data.currency || 'EUR') }}</small>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div class="inst">
          <div class="inst-head">
            <span><i class="pi pi-calendar" /> {{ data.orderNo }} Ödeme Koşulları <small>({{ data.currency || 'EUR' }})</small></span>
            <div class="inst-r">
              <span class="tot" :class="{ bad: totalPct(data) !== 100 }">Toplam %{{ totalPct(data) }}</span>
              <Button icon="pi pi-plus" label="Koşul Ekle" size="small" @click="openAdd(data)" />
            </div>
          </div>
          <table class="inst-table">
            <thead><tr><th>Kod</th><th class="r">%</th><th class="r">Tutar</th><th>Tahmini Vade</th><th>Durum</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(t, i) in sortedTerms(data)" :key="i">
                <td><span class="code">{{ t.code }}</span></td>
                <td class="r">%{{ t.percent }}</td>
                <td class="r mono">{{ fmtMoney(amountOf(data, t), data.currency || 'EUR') }}</td>
                <td>{{ fmtDate(t.dueDate) }} <small v-if="t.status !== 'tahsil'" class="wl" :class="{ over: weeksLeft(t.dueDate).overdue }">· {{ weeksLeft(t.dueDate).text }}</small></td>
                <td><Tag :value="MILESTONE_STATUS[t.status].label" :severity="MILESTONE_STATUS[t.status].severity" /></td>
                <td class="r">
                  <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="openEdit(data, t)" v-tooltip.top="'Düzenle'" />
                  <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="del(data, t)" v-tooltip.top="'Sil'" />
                </td>
              </tr>
              <tr v-if="!(data.paymentTerms || []).length"><td colspan="6" class="empty">Ödeme koşulu yok. “Koşul Ekle” ile ekleyin.</td></tr>
            </tbody>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Koşulu Düzenle' : 'Yeni Ödeme Koşulu'" modal :style="{ width: '500px' }">
      <div class="form">
        <div v-if="currentOrder" class="contract-info"><i class="pi pi-file-edit" /> Bedel: <b>{{ fmtMoney(currentOrder.contractValue || 0, currentOrder.currency || 'EUR') }}</b></div>
        <div class="two">
          <div class="field"><label>Kod *</label>
            <Select v-model="form.code" :options="MILESTONE_CATALOG" optionLabel="code" optionValue="code" :invalid="submitted && !form.code" placeholder="Kod" fluid @change="onCode" />
          </div>
          <div class="field"><label>Yüzde (%) *</label><InputNumber v-model="form.percent" :min="0" :max="100" :invalid="submitted && !form.percent" fluid /></div>
        </div>
        <div class="two">
          <div class="field"><label>Tutar (otomatik)</label><div class="amount-box">{{ fmtMoney(computedAmount, currentOrder?.currency || 'EUR') }}</div></div>
          <div class="field"><label>Durum</label><Select v-model="form.status" :options="STATUS_OPTIONS" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <div class="field"><label>Tahmini Vade *</label><DatePicker v-model="dueDate" dateFormat="dd.mm.yy" :invalid="submitted && !dueDate" showIcon fluid /></div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button :label="editTarget ? 'Kaydet' : 'Ekle'" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Tag from "primevue/tag";
import { useToast } from "primevue/usetoast";
import { db, patchOrder } from "@/data/store";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, MILESTONE_CATALOG, MILESTONE_STATUS } from "@/finance/types";
import { STATUS_OPTIONS } from "@/finance/ui";
import type { Order, PaymentTerm } from "@/types";

const toast = useToast();
const expandedRows = ref<Order[]>([]);

const amountOf = (o: Order, t: PaymentTerm) => Math.round(((o.contractValue ?? 0) * t.percent) / 100);
const collected = (o: Order) =>
  (o.paymentTerms ?? []).filter((t) => t.status === "tahsil").reduce((s, t) => s + amountOf(o, t), 0);
const totalPct = (o: Order) => (o.paymentTerms ?? []).reduce((s, t) => s + t.percent, 0);
const sortedTerms = (o: Order) => [...(o.paymentTerms ?? [])].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
const persist = (o: Order) => patchOrder(o.id, { paymentTerms: o.paymentTerms ?? [] });

const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<PaymentTerm | null>(null);
const currentOrder = ref<Order | null>(null);
const dueDate = ref<Date | null>(null);
interface Form { code: string; percent: number | null; status: PaymentTerm["status"] }
const empty = (): Form => ({ code: "", percent: null, status: "bekliyor" });
const form = reactive<Form>(empty());

const computedAmount = computed(() =>
  currentOrder.value ? Math.round(((currentOrder.value.contractValue ?? 0) * (form.percent ?? 0)) / 100) : 0
);
function onCode() {
  const def = MILESTONE_CATALOG.find((m) => m.code === form.code);
  if (def && form.percent == null) form.percent = def.defaultPercent;
}
function openAdd(o: Order) {
  currentOrder.value = o;
  Object.assign(form, empty());
  dueDate.value = null;
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(o: Order, t: PaymentTerm) {
  currentOrder.value = o;
  Object.assign(form, { code: t.code, percent: t.percent, status: t.status });
  dueDate.value = new Date(t.dueDate);
  editTarget.value = t;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.code || !form.percent || !dueDate.value) return;
  const o = currentOrder.value;
  if (!o) return;
  if (!o.paymentTerms) o.paymentTerms = [];
  const date = dueDate.value.toISOString();
  if (editTarget.value) {
    Object.assign(editTarget.value, { code: form.code, percent: form.percent, dueDate: date, status: form.status });
    toast.add({ severity: "success", summary: "Güncellendi", detail: `${o.orderNo} · ${form.code}`, life: 2000 });
  } else {
    o.paymentTerms.push({ code: form.code, percent: form.percent, dueDate: date, status: form.status });
    toast.add({ severity: "success", summary: "Koşul eklendi", detail: `${o.orderNo} · ${form.code}`, life: 2000 });
  }
  persist(o);
  dialog.value = false;
}
function del(o: Order, t: PaymentTerm) {
  const i = (o.paymentTerms ?? []).indexOf(t);
  if (i >= 0) o.paymentTerms!.splice(i, 1);
  persist(o);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
.muted { color: #cbd5e1; }
.sub { color: #94a3b8; }
.ok { color: #10b981; }
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }

.inst { padding: 6px 8px 10px; }
.inst-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.inst-head span { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.inst-head i { color: #1488c8; }
.inst-head small { color: #94a3b8; font-weight: 500; }
.inst-r { display: flex; align-items: center; gap: 10px; }
.tot { font-size: 12px; font-weight: 700; color: #10b981; background: #e7f7ef; padding: 2px 8px; border-radius: 20px; }
.tot.bad { color: #b45309; background: #fef3e2; }

.inst-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; }
.inst-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 12px; border-bottom: 1px solid #eef2f7; }
.inst-table td { padding: 8px 12px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.inst-table tbody tr:last-child td { border-bottom: none; }
.inst-table .r { text-align: right; }
.inst-table .mono { font-variant-numeric: tabular-nums; }
.code { font-size: 11px; font-weight: 800; color: #1488c8; background: #e8f4fb; padding: 3px 7px; border-radius: 6px; }
.empty { text-align: center; color: #94a3b8; padding: 14px; }
.contract-info { font-size: 13px; color: #475569; background: #f6fbfe; border: 1px solid #dbeefb; border-radius: 10px; padding: 9px 12px; display: flex; align-items: center; gap: 8px; }
.contract-info i { color: #1488c8; }
.contract-info b { color: #0f172a; }
.amount-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-weight: 800; color: #1488c8; font-variant-numeric: tabular-nums; }
</style>
