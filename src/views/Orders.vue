<template>
  <div class="page">
    <DataTable
      :value="visibleOrders"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      removableSort
      :filters="filters"
      :globalFilterFields="['orderNo', 'productName', 'customerName']"
      class="card-table"
      @row-click="goDetail"
      rowHover
      currentPageReportTemplate="{first}-{last} / {totalRecords}"
      :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'"
    >
      <template #header>
        <PageHeader
          title="Siparişler"
          subtitle="Müşteri, bedel ve ödeme koşulları"
          addLabel="Yeni Sipariş"
          v-model:search="filters.global.value"
          searchPlaceholder="Sipariş ara..."
          @add="openNew"
        />
        <StatStrip :items="sums" />
        <div class="filterbar">
          <Checkbox v-model="hideSmall" binary inputId="hsOrders" />
          <label for="hsOrders">50K altı bakiyeleri gizle</label>
        </div>
      </template>
      <template #empty><div class="empty">Kayıt bulunamadı.</div></template>

      <Column field="orderNo" header="Sipariş No" sortable>
        <template #body="{ data }">
          <div class="cell-name">
            <Avatar icon="pi pi-clipboard" shape="circle" style="background: #1488c81a; color: #1488c8" />
            <span class="mono">{{ data.orderNo }}</span>
          </div>
        </template>
      </Column>
      <Column header="Tür" sortable field="orderType" style="width: 110px">
        <template #body="{ data }">
          <Tag :value="(data.orderType || 'proje') === 'malzeme' ? 'Malzeme' : 'Proje'"
            :severity="(data.orderType || 'proje') === 'malzeme' ? 'secondary' : 'info'" />
        </template>
      </Column>
      <Column field="customerName" header="Müşteri" sortable />
      <Column field="orderDate" header="Alınma" sortable style="width: 120px">
        <template #body="{ data }">{{ data.orderDate ? fmtDate(data.orderDate) : "—" }}</template>
      </Column>
      <Column field="contractValue" header="Bedel" sortable style="width: 150px">
        <template #body="{ data }">
          <span v-if="data.contractValue" class="mono">{{ fmtMoney(data.contractValue, data.currency || 'EUR') }}</span>
          <span v-else class="muted">—</span>
        </template>
      </Column>
      <Column header="Ödeme" style="width: 130px">
        <template #body="{ data }">
          <span v-if="data.paymentTerms?.length" class="terms-badge">{{ data.paymentTerms.length }} koşul</span>
          <span v-else class="muted">—</span>
        </template>
      </Column>
      <Column header="Durum" sortable field="status" style="width: 130px">
        <template #body="{ data }">
          <Tag :value="orderStatus[data.status].label" :severity="orderStatus[data.status].severity" />
        </template>
      </Column>
      <Column header="" style="width: 110px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click.stop="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click.stop="confirmDelete(data)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editId ? 'Siparişi Düzenle' : 'Yeni Sipariş'" modal :style="{ width: '560px' }">
      <div class="form">
        <div class="field">
          <label>Sipariş Türü</label>
          <SelectButton v-model="form.orderType" :options="TYPES" optionLabel="label" optionValue="value" :allowEmpty="false" />
        </div>
        <div class="two">
          <div class="field">
            <label>Sipariş No *</label>
            <InputText v-model="form.orderNo" autofocus :invalid="submitted && !form.orderNo" placeholder="PCAMG002700-1" />
          </div>
          <div class="field">
            <label>Alınma Tarihi *</label>
            <DatePicker v-model="form.orderDate" dateFormat="dd.mm.yy" :invalid="submitted && !form.orderDate" showIcon fluid />
          </div>
        </div>
        <div class="field">
          <label>Müşteri *</label>
          <Select v-model="form.customerId" :options="db.customers" optionLabel="name" optionValue="id"
            :invalid="submitted && !form.customerId" placeholder="Müşteri seç" fluid />
        </div>

        <div class="two">
          <div class="field">
            <label>Bedel *</label>
            <InputNumber v-model="form.contractValue" :min="0" :invalid="submitted && !form.contractValue" fluid />
          </div>
          <div class="field">
            <label>Para Birimi</label>
            <Select v-model="form.currency" :options="CURR" optionLabel="label" optionValue="value" fluid />
          </div>
        </div>

        <!-- Ödeme koşulları (milestone) -->
        <div class="terms">
          <div class="terms-head">
            <label>Ödeme Koşulları</label>
            <span class="terms-tot" :class="{ bad: form.terms.length && totalPct !== 100 }">Toplam %{{ totalPct }}</span>
            <Button label="Koşul Ekle" icon="pi pi-plus" size="small" text @click="addTerm" />
          </div>
          <div v-for="(t, i) in form.terms" :key="i" class="term-row">
            <Select v-model="t.code" :options="MILESTONE_CATALOG" optionLabel="code" optionValue="code" placeholder="Kod" class="t-code" @change="onTermCode(t)" />
            <InputNumber v-model="t.percent" :min="0" :max="100" suffix=" %" class="t-pct" />
            <DatePicker v-model="t.dueDate" dateFormat="dd.mm.yy" placeholder="Tahmini vade" showIcon class="t-date" />
            <span class="t-amt">{{ fmtMoney(termAmount(t), form.currency) }}</span>
            <Button icon="pi pi-times" text rounded size="small" severity="danger" @click="form.terms.splice(i, 1)" />
          </div>
          <small v-if="!form.terms.length" class="hint">Örn: ORDER %15, ATFE %10, ATFMR %30 … Toplam %100 olmalı.</small>
        </div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button :label="editId ? 'Kaydet' : 'Sipariş Oluştur'" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import Checkbox from "primevue/checkbox";
import SelectButton from "primevue/selectbutton";
import PageHeader from "@/components/PageHeader.vue";
import StatStrip, { type StatItem } from "@/components/StatStrip.vue";
import { db, createOrder, updateOrder, deleteOrder } from "@/data/store";
import { orderStatus, fmtDate } from "@/utils";
import { fmtMoney, MILESTONE_CATALOG } from "@/finance/types";
import { toEur, orderCollected, moneyEur } from "@/finance/calc";
import type { Order, PaymentTerm } from "@/types";

const CURR = [
  { label: "EUR", value: "EUR" as const },
  { label: "TL", value: "TL" as const },
];
const TYPES = [
  { label: "Proje", value: "proje" as const },
  { label: "Malzeme", value: "malzeme" as const },
];

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const SMALL = 50000;
const hideSmall = ref(localStorage.getItem("hideSmallOrders") === "1");
watch(hideSmall, (v) => localStorage.setItem("hideSmallOrders", v ? "1" : "0"));
const visibleOrders = computed(() =>
  hideSmall.value ? db.orders.filter((o) => (o.contractValue ?? 0) >= SMALL) : db.orders
);

const sums = computed<StatItem[]>(() => {
  const list = visibleOrders.value;
  const bedel = list.reduce((s, o) => s + toEur(o.contractValue ?? 0, o.currency ?? "EUR"), 0);
  const tahsil = list.reduce((s, o) => s + toEur(orderCollected(o), o.currency ?? "EUR"), 0);
  return [
    { label: "Sipariş", value: list.length, icon: "pi-clipboard", tone: "blue" },
    { label: "Toplam Bedel (≈€)", value: moneyEur(bedel), icon: "pi-file-edit", tone: "blue" },
    { label: "Tahsil (≈€)", value: moneyEur(tahsil), icon: "pi-check-circle", tone: "green" },
    { label: "Bekleyen (≈€)", value: moneyEur(bedel - tahsil), icon: "pi-clock", tone: "amber" },
  ];
});
const dialog = ref(false);
const submitted = ref(false);
const editId = ref<string | null>(null);

interface TermForm { code: string; percent: number | null; dueDate: Date | null; status: PaymentTerm["status"] }
interface Form {
  orderNo: string;
  customerId: string | null;
  orderDate: Date | null;
  orderType: "proje" | "malzeme";
  contractValue: number | null;
  currency: "EUR" | "TL";
  terms: TermForm[];
}
const empty = (): Form => ({
  orderNo: "", customerId: null, orderDate: null, orderType: "proje", contractValue: null, currency: "EUR", terms: [],
});
const form = reactive<Form>(empty());

const totalPct = computed(() => form.terms.reduce((s, t) => s + (t.percent ?? 0), 0));
const termAmount = (t: TermForm) => Math.round(((form.contractValue ?? 0) * (t.percent ?? 0)) / 100);
function addTerm() {
  form.terms.push({ code: "", percent: null, dueDate: null, status: "bekliyor" });
}
function onTermCode(t: TermForm) {
  const def = MILESTONE_CATALOG.find((m) => m.code === t.code);
  if (def && t.percent == null) t.percent = def.defaultPercent;
}

function openNew() {
  Object.assign(form, empty());
  editId.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(o: Order) {
  Object.assign(form, {
    orderNo: o.orderNo,
    customerId: o.customerId,
    orderDate: o.orderDate ? new Date(o.orderDate) : new Date(o.createdAt),
    orderType: o.orderType ?? "proje",
    contractValue: o.contractValue ?? null,
    currency: o.currency ?? "EUR",
    terms: (o.paymentTerms ?? []).map((t) => ({ code: t.code, percent: t.percent, dueDate: new Date(t.dueDate), status: t.status })),
  });
  editId.value = o.id;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.orderNo.trim() || !form.customerId || !form.orderDate || !form.contractValue) return;

  const paymentTerms: PaymentTerm[] = form.terms
    .filter((t) => t.code && t.percent != null && t.dueDate)
    .map((t) => ({ code: t.code, percent: t.percent as number, dueDate: (t.dueDate as Date).toISOString(), status: t.status }));

  const payload = {
    orderNo: form.orderNo,
    customerId: form.customerId,
    orderDate: form.orderDate.toISOString(),
    orderType: form.orderType,
    contractValue: form.contractValue,
    currency: form.currency,
    paymentTerms,
  };

  if (editId.value) {
    updateOrder(editId.value, payload);
    toast.add({ severity: "success", summary: "Sipariş güncellendi", detail: form.orderNo, life: 2500 });
  } else {
    createOrder(payload);
    toast.add({ severity: "success", summary: "Sipariş oluşturuldu", detail: form.orderNo, life: 2500 });
  }
  dialog.value = false;
}
function confirmDelete(o: Order) {
  confirm.require({
    header: "Silme onayı",
    message: `"${o.orderNo}" siparişi silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil",
    rejectLabel: "Vazgeç",
    acceptProps: { severity: "danger" },
    accept: () => {
      deleteOrder(o.id);
      toast.add({ severity: "info", summary: "Sipariş silindi", detail: o.orderNo, life: 2500 });
    },
  });
}
function goDetail(e: { data: Order }) {
  router.push(`/orders/${e.data.id}`);
}
</script>

<style scoped>
@import "@/views/table.css";
.mono { font-variant-numeric: tabular-nums; font-weight: 700; }
.prog { display: flex; align-items: center; gap: 10px; }
.prog span { font-size: 12px; color: #64748b; width: 34px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.opt { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; }
.route-preview { background: #ecf6fc; border-radius: 12px; padding: 14px; }
.rp-title { font-size: 12px; font-weight: 700; color: #0f6fa6; text-transform: uppercase; letter-spacing: 0.4px; }
.rp-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
.rp-step { font-size: 13px; color: #115c88; background: #fff; padding: 4px 10px; border-radius: 8px; }
.rp-arrow { color: #66b8e6; font-size: 12px; }

.muted { color: #cbd5e1; }
.terms-badge { font-size: 11.5px; font-weight: 700; color: #1488c8; background: #e8f4fb; padding: 3px 9px; border-radius: 20px; }
.filterbar { display: flex; align-items: center; gap: 8px; padding: 0 4px 10px; }
.filterbar label { font-size: 13px; color: #64748b; cursor: pointer; user-select: none; }

/* Ödeme koşulları */
.terms { border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; background: #f8fafc; }
.terms-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.terms-head label { font-size: 13px; font-weight: 700; color: #334155; }
.terms-tot { font-size: 12px; font-weight: 700; color: #10b981; background: #e7f7ef; padding: 2px 8px; border-radius: 20px; }
.terms-tot.bad { color: #b45309; background: #fef3e2; }
.terms-head :deep(.p-button) { margin-left: auto; }
.term-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.t-code { width: 120px; flex-shrink: 0; }
.t-pct :deep(.p-inputnumber-input) { width: 80px; }
.t-date :deep(.p-datepicker-input) { width: 130px; }
.t-amt { flex: 1; text-align: right; font-size: 13px; font-weight: 600; color: #1488c8; font-variant-numeric: tabular-nums; }
</style>
