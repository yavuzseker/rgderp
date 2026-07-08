<template>
  <div class="page">
    <DataTable
      :value="db.orders"
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
          subtitle="Üretim siparişleri ve aşama ilerlemesi"
          addLabel="Yeni Sipariş"
          v-model:search="filters.global.value"
          searchPlaceholder="Sipariş ara..."
          @add="openNew"
        />
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
      <Column field="productName" header="Ürün" sortable />
      <Column field="customerName" header="Müşteri" sortable />
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
      <Column field="totalQty" header="Miktar" sortable style="width: 100px">
        <template #body="{ data }"><strong>{{ data.totalQty }}</strong></template>
      </Column>
      <Column header="İlerleme" style="width: 180px">
        <template #body="{ data }">
          <div class="prog">
            <ProgressBar :value="progressOf(data.stages)" :showValue="false" style="height: 7px" />
            <span>{{ progressOf(data.stages) }}%</span>
          </div>
        </template>
      </Column>
      <Column field="dueDate" header="Termin" sortable style="width: 130px">
        <template #body="{ data }">{{ fmtDate(data.dueDate) }}</template>
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
        <div class="two">
          <div class="field">
            <label>Sipariş No *</label>
            <InputText v-model="form.orderNo" autofocus :invalid="submitted && !form.orderNo" placeholder="SP-2026-004" />
          </div>
          <div class="field">
            <label>Miktar *</label>
            <InputNumber v-model="form.totalQty" :min="1" :invalid="submitted && !form.totalQty" placeholder="500" fluid />
          </div>
        </div>
        <div class="field">
          <label>Ürün *</label>
          <Select v-model="form.productId" :options="db.products" optionLabel="name" optionValue="id"
            :invalid="submitted && !form.productId" :disabled="!!editId" placeholder="Ürün seç" fluid>
            <template #option="{ option }">
              <div class="opt"><span>{{ option.name }}</span><Tag :value="option.code" severity="secondary" /></div>
            </template>
          </Select>
          <small v-if="editId" class="hint">Ürün değiştirilemez — üretim rotasını belirler.</small>
        </div>
        <div class="field">
          <label>Müşteri *</label>
          <Select v-model="form.customerId" :options="db.customers" optionLabel="name" optionValue="id"
            :invalid="submitted && !form.customerId" placeholder="Müşteri seç" fluid />
        </div>
        <div class="two">
          <div class="field">
            <label>Termin Tarihi *</label>
            <DatePicker v-model="form.dueDate" dateFormat="dd.mm.yy" :invalid="submitted && !form.dueDate" showIcon fluid />
          </div>
          <div class="field">
            <label>Alınma Tarihi *</label>
            <DatePicker v-model="form.orderDate" dateFormat="dd.mm.yy" :invalid="submitted && !form.orderDate" showIcon fluid />
          </div>
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

        <div v-if="selectedRoute.length" class="route-preview">
          <span class="rp-title">Üretim Rotası</span>
          <div class="rp-flow">
            <template v-for="(s, i) in selectedRoute" :key="i">
              <span class="rp-step">{{ i + 1 }}. {{ s }}</span>
              <i v-if="i < selectedRoute.length - 1" class="pi pi-angle-right rp-arrow" />
            </template>
          </div>
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
import { ref, reactive, computed } from "vue";
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
import ProgressBar from "primevue/progressbar";
import PageHeader from "@/components/PageHeader.vue";
import { db, createOrder, updateOrder, deleteOrder } from "@/data/store";
import { orderStatus, fmtDate, progressOf } from "@/utils";
import { fmtMoney, MILESTONE_CATALOG } from "@/finance/types";
import type { Order, PaymentTerm } from "@/types";

const CURR = [
  { label: "EUR", value: "EUR" as const },
  { label: "TL", value: "TL" as const },
];

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const dialog = ref(false);
const submitted = ref(false);
const editId = ref<string | null>(null);

interface TermForm { code: string; percent: number | null; dueDate: Date | null; status: PaymentTerm["status"] }
interface Form {
  orderNo: string;
  productId: string | null;
  customerId: string | null;
  totalQty: number | null;
  dueDate: Date | null;
  orderDate: Date | null;
  contractValue: number | null;
  currency: "EUR" | "TL";
  terms: TermForm[];
}
const empty = (): Form => ({
  orderNo: "", productId: null, customerId: null, totalQty: null, dueDate: null,
  orderDate: null, contractValue: null, currency: "EUR", terms: [],
});
const form = reactive<Form>(empty());

const selectedRoute = computed(() => {
  const p = db.products.find((x) => x.id === form.productId);
  return p ? p.stages.map((s) => s.name) : [];
});

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
    productId: o.productId,
    customerId: o.customerId,
    totalQty: o.totalQty,
    dueDate: new Date(o.dueDate),
    orderDate: o.orderDate ? new Date(o.orderDate) : new Date(o.createdAt),
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
  if (!form.orderNo.trim() || !form.productId || !form.customerId || !form.totalQty || !form.dueDate || !form.orderDate || !form.contractValue) return;

  const paymentTerms: PaymentTerm[] = form.terms
    .filter((t) => t.code && t.percent != null && t.dueDate)
    .map((t) => ({ code: t.code, percent: t.percent as number, dueDate: (t.dueDate as Date).toISOString(), status: t.status }));

  const fin = {
    orderDate: form.orderDate.toISOString(),
    contractValue: form.contractValue,
    currency: form.currency,
    paymentTerms,
  };

  if (editId.value) {
    updateOrder(editId.value, {
      orderNo: form.orderNo,
      customerId: form.customerId,
      totalQty: form.totalQty,
      dueDate: form.dueDate.toISOString(),
      ...fin,
    });
    toast.add({ severity: "success", summary: "Sipariş güncellendi", detail: form.orderNo, life: 2500 });
  } else {
    createOrder({
      orderNo: form.orderNo,
      productId: form.productId,
      customerId: form.customerId,
      totalQty: form.totalQty,
      dueDate: form.dueDate.toISOString(),
      ...fin,
    });
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
