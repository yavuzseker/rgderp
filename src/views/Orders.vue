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
            <Avatar icon="pi pi-clipboard" shape="circle" style="background: #ec48991a; color: #ec4899" />
            <span class="mono">{{ data.orderNo }}</span>
          </div>
        </template>
      </Column>
      <Column field="productName" header="Ürün" sortable />
      <Column field="customerName" header="Müşteri" sortable />
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
    </DataTable>

    <Dialog v-model:visible="dialog" header="Yeni Sipariş" modal :style="{ width: '560px' }">
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
            :invalid="submitted && !form.productId" placeholder="Ürün seç" fluid>
            <template #option="{ option }">
              <div class="opt"><span>{{ option.name }}</span><Tag :value="option.code" severity="secondary" /></div>
            </template>
          </Select>
        </div>
        <div class="field">
          <label>Müşteri *</label>
          <Select v-model="form.customerId" :options="db.customers" optionLabel="name" optionValue="id"
            :invalid="submitted && !form.customerId" placeholder="Müşteri seç" fluid />
        </div>
        <div class="field">
          <label>Termin Tarihi *</label>
          <DatePicker v-model="form.dueDate" dateFormat="dd.mm.yy" :invalid="submitted && !form.dueDate" showIcon fluid />
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
        <Button label="Sipariş Oluştur" icon="pi pi-check" @click="save" />
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
import DatePicker from "primevue/datepicker";
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import ProgressBar from "primevue/progressbar";
import PageHeader from "@/components/PageHeader.vue";
import { db, createOrder } from "@/data/store";
import { orderStatus, fmtDate, progressOf } from "@/utils";
import type { Order } from "@/types";

const router = useRouter();
const toast = useToast();

const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const dialog = ref(false);
const submitted = ref(false);

interface Form {
  orderNo: string;
  productId: string | null;
  customerId: string | null;
  totalQty: number | null;
  dueDate: Date | null;
}
const empty = (): Form => ({ orderNo: "", productId: null, customerId: null, totalQty: null, dueDate: null });
const form = reactive<Form>(empty());

const selectedRoute = computed(() => {
  const p = db.products.find((x) => x.id === form.productId);
  return p ? p.stages.map((s) => s.name) : [];
});

function openNew() {
  Object.assign(form, empty());
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.orderNo.trim() || !form.productId || !form.customerId || !form.totalQty || !form.dueDate) return;
  createOrder({
    orderNo: form.orderNo,
    productId: form.productId,
    customerId: form.customerId,
    totalQty: form.totalQty,
    dueDate: form.dueDate.toISOString(),
  });
  toast.add({ severity: "success", summary: "Sipariş oluşturuldu", detail: form.orderNo, life: 2500 });
  dialog.value = false;
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
.route-preview { background: #eef2ff; border-radius: 12px; padding: 14px; }
.rp-title { font-size: 12px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.4px; }
.rp-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
.rp-step { font-size: 13px; color: #312e81; background: #fff; padding: 4px 10px; border-radius: 8px; }
.rp-arrow { color: #a5b4fc; font-size: 12px; }
</style>
