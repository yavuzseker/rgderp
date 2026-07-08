<template>
  <div class="fpage">
    <DataTable :value="orderGroups" dataKey="orderNo" v-model:expandedRows="expandedRows"
      paginator :rows="10" removableSort class="card-table">
      <template #header>
        <div class="fh">
          <div><h3>Proje Giderleri</h3><p>Sipariş bazında — satıra basınca giderler açılır</p></div>
        </div>
      </template>
      <template #empty><div class="empty">Sipariş yok.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="orderNo" header="Sipariş" sortable style="width: 150px">
        <template #body="{ data }"><b class="mono">{{ data.orderNo }}</b></template>
      </Column>
      <Column field="customer" header="Müşteri" sortable />
      <Column header="Proje" style="width: 200px">
        <template #body="{ data }">
          <span class="sub">{{ data.projects.map((p: any) => p.name).join(", ") }}</span>
        </template>
      </Column>
      <Column header="Gider" style="width: 90px">
        <template #body="{ data }"><b>{{ expensesOf(data).length }}</b></template>
      </Column>
      <Column header="Toplam" style="width: 170px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(totalOf(data), data.currency) }}</span></template>
      </Column>

      <!-- Alt detay: siparişin giderleri -->
      <template #expansion="{ data }">
        <div class="inst">
          <div class="inst-head">
            <span><i class="pi pi-arrow-up-right" /> {{ data.orderNo }} Giderleri</span>
            <Button icon="pi pi-plus" label="Gider Ekle" size="small" @click="openAdd(data)" />
          </div>
          <table class="inst-table">
            <thead><tr><th>Proje</th><th>Açıklama</th><th>Kategori</th><th class="r">Tutar</th><th>Tarih</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in expensesOf(data)" :key="i">
                <td>{{ row.p.name }}</td>
                <td>{{ row.e.description }}</td>
                <td><span class="cat">{{ row.e.category }}</span></td>
                <td class="r mono">{{ fmtMoney(row.e.amount, row.e.currency) }}</td>
                <td>{{ fmtDate(row.e.date) }}</td>
                <td class="r">
                  <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="openEdit(data, row)" v-tooltip.top="'Düzenle'" />
                  <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="del(row)" v-tooltip.top="'Sil'" />
                </td>
              </tr>
              <tr v-if="!expensesOf(data).length"><td colspan="6" class="empty">Gider yok. “Gider Ekle” ile ekleyin.</td></tr>
            </tbody>
            <tfoot v-if="expensesOf(data).length">
              <tr><td colspan="3">Toplam ({{ expensesOf(data).length }})</td><td class="r mono"><b>{{ fmtMoney(totalOf(data), data.currency) }}</b></td><td colspan="2"></td></tr>
            </tfoot>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Gideri Düzenle' : 'Yeni Gider'" modal :style="{ width: '540px' }">
      <div class="form">
        <div class="field"><label>Proje *</label>
          <Select v-model="form.projectId" :options="projectOpts" optionLabel="label" optionValue="value"
            :invalid="submitted && !form.projectId" :disabled="!!editTarget" placeholder="Proje seç" fluid />
        </div>
        <div class="field"><label>Açıklama *</label><InputText v-model="form.description" :invalid="submitted && !form.description" placeholder="Örn: Devreye alma – 1. etap" /></div>
        <div class="two">
          <div class="field"><label>Kategori</label><InputText v-model="form.category" placeholder="Örn: Devreye Alma" /></div>
          <div class="field"><label>Tutar *</label><InputNumber v-model="form.amount" :min="0" :invalid="submitted && !form.amount" fluid /></div>
        </div>
        <div class="field"><label>Tarih *</label><DatePicker v-model="expDate" dateFormat="dd.mm.yy" :invalid="submitted && !expDate" showIcon fluid /></div>
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
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { useToast } from "primevue/usetoast";
import { financeProjects } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import { fmtMoney, type FinanceProject, type ExpenseItem } from "@/finance/types";

const toast = useToast();
const expandedRows = ref<any[]>([]);

interface OrderGroup { orderNo: string; customer: string; currency: "EUR" | "TL"; projects: FinanceProject[] }
const orderGroups = computed<OrderGroup[]>(() => {
  const map = new Map<string, OrderGroup>();
  for (const p of financeProjects) {
    if (!map.has(p.orderNo)) map.set(p.orderNo, { orderNo: p.orderNo, customer: p.customer, currency: p.currency, projects: [] });
    map.get(p.orderNo)!.projects.push(p);
  }
  return [...map.values()];
});

const expensesOf = (g: OrderGroup) =>
  g.projects
    .flatMap((p) => p.expenses.map((e) => ({ p, e })))
    .sort((a, b) => (a.e.date < b.e.date ? -1 : 1));
const totalOf = (g: OrderGroup) => g.projects.reduce((s, p) => s + p.expenses.reduce((x, e) => x + e.amount, 0), 0);

// ---- Gider ekle/düzenle/sil ----
const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<{ p: FinanceProject; e: ExpenseItem } | null>(null);
const currentGroup = ref<OrderGroup | null>(null);
const expDate = ref<Date | null>(null);
interface Form { projectId: string; description: string; category: string; amount: number }
const empty = (): Form => ({ projectId: "", description: "", category: "", amount: 0 });
const form = reactive<Form>(empty());

const projectOpts = computed(() =>
  (currentGroup.value?.projects ?? []).map((p) => ({ label: p.name, value: p.id }))
);

function openAdd(g: OrderGroup) {
  currentGroup.value = g;
  Object.assign(form, empty());
  form.projectId = g.projects[0]?.id ?? "";
  expDate.value = null;
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(g: OrderGroup, row: { p: FinanceProject; e: ExpenseItem }) {
  currentGroup.value = g;
  Object.assign(form, { projectId: row.p.id, description: row.e.description, category: row.e.category, amount: row.e.amount });
  expDate.value = new Date(row.e.date);
  editTarget.value = row;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.projectId || !form.description.trim() || !form.amount || !expDate.value) return;
  const p = financeProjects.find((x) => x.id === form.projectId);
  if (!p) return;
  const date = expDate.value.toISOString().slice(0, 10);
  if (editTarget.value) {
    Object.assign(editTarget.value.e, { description: form.description, category: form.category || "Diğer", amount: form.amount, date });
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.description, life: 2000 });
  } else {
    p.expenses.push({ description: form.description, category: form.category || "Diğer", amount: form.amount, currency: p.currency, date });
    toast.add({ severity: "success", summary: "Gider eklendi", detail: form.description, life: 2000 });
  }
  dialog.value = false;
}
function del(row: { p: FinanceProject; e: ExpenseItem }) {
  const i = row.p.expenses.indexOf(row.e);
  if (i >= 0) row.p.expenses.splice(i, 1);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
.sub { color: #94a3b8; font-size: 12.5px; }

.inst { padding: 6px 8px 10px; }
.inst-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.inst-head span { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.inst-head i { color: #1488c8; }

.inst-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; }
.inst-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 12px; border-bottom: 1px solid #eef2f7; }
.inst-table td { padding: 8px 12px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.inst-table tbody tr:last-child td { border-bottom: none; }
.inst-table .r { text-align: right; }
.inst-table .mono { font-variant-numeric: tabular-nums; }
.inst-table tfoot td { padding: 8px 12px; border-top: 2px solid #eef2f7; color: #0f172a; }
.empty { text-align: center; color: #94a3b8; padding: 14px; }
</style>
