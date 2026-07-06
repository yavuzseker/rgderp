<template>
  <div class="fpage">
    <DataTable :value="rows" dataKey="key" paginator :rows="12" removableSort class="card-table"
      :filters="filters" :globalFilterFields="['orderNo', 'project', 'description', 'category']">
      <template #header>
        <div class="fh">
          <div><h3>Proje Giderleri (Harcamalar)</h3><p>Projeye ait tahmini gider kalemleri</p></div>
          <div class="fh-r">
            <IconField><InputIcon class="pi pi-search" /><InputText v-model="filters.global.value" placeholder="Ara..." /></IconField>
            <Button label="Yeni Gider" icon="pi pi-plus" @click="openNew" />
          </div>
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column field="orderNo" header="Sipariş" sortable style="width: 120px" />
      <Column field="project" header="Proje" sortable>
        <template #body="{ data }"><b>{{ data.project }}</b><br /><small class="sub">{{ data.customer }}</small></template>
      </Column>
      <Column field="description" header="Açıklama" sortable />
      <Column field="category" header="Kategori" sortable style="width: 150px">
        <template #body="{ data }"><span class="cat">{{ data.category }}</span></template>
      </Column>
      <Column field="amount" header="Tutar" sortable style="width: 150px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.amount, data.currency) }}</span></template>
      </Column>
      <Column field="date" header="Tarih" sortable style="width: 130px">
        <template #body="{ data }">{{ fmtDate(data.date) }}</template>
      </Column>
      <Column header="" style="width: 100px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="del(data)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Gideri Düzenle' : 'Yeni Proje Gideri'" modal :style="{ width: '540px' }">
      <div class="form">
        <div class="field"><label>Proje *</label>
          <Select v-model="form.projectId" :options="projectOpts" optionLabel="label" optionValue="value"
            :invalid="submitted && !form.projectId" :disabled="!!editTarget" placeholder="Sipariş / proje seç" fluid />
        </div>
        <div class="field"><label>Açıklama *</label><InputText v-model="form.description" :invalid="submitted && !form.description" placeholder="Örn: Devreye alma – 1. etap" /></div>
        <div class="two">
          <div class="field"><label>Kategori</label><InputText v-model="form.category" placeholder="Örn: Devreye Alma" /></div>
          <div class="field"><label>Tutar *</label><InputNumber v-model="form.amount" :min="0" :invalid="submitted && !form.amount" fluid /></div>
        </div>
        <div class="field"><label>Tarih *</label><DatePicker v-model="date" dateFormat="dd.mm.yy" :invalid="submitted && !date" showIcon fluid /></div>
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
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useToast } from "primevue/usetoast";
import { financeProjects } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import { fmtMoney, type ExpenseItem } from "@/finance/types";
import { projectOptions } from "@/finance/calc";

const toast = useToast();
const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });

const rows = computed(() =>
  financeProjects.flatMap((p) =>
    p.expenses.map((e, i) => ({
      key: p.id + "-e" + i,
      pid: p.id,
      e,
      orderNo: p.orderNo,
      project: p.name,
      customer: p.customer,
      description: e.description,
      category: e.category,
      amount: e.amount,
      currency: e.currency,
      date: e.date,
    }))
  )
);
const projectOpts = computed(() => projectOptions());

const dialog = ref(false);
const submitted = ref(false);
const date = ref<Date | null>(null);
const editTarget = ref<ExpenseItem | null>(null);
interface Form { projectId: string; description: string; category: string; amount: number; }
const empty = (): Form => ({ projectId: "", description: "", category: "", amount: 0 });
const form = reactive<Form>(empty());

function openNew() {
  Object.assign(form, empty());
  date.value = null;
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(row: { pid: string; e: ExpenseItem }) {
  Object.assign(form, {
    projectId: row.pid,
    description: row.e.description,
    category: row.e.category,
    amount: row.e.amount,
  });
  date.value = row.e.date ? new Date(row.e.date) : null;
  editTarget.value = row.e;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.projectId || !form.description.trim() || !form.amount || !date.value) return;
  const p = financeProjects.find((x) => x.id === form.projectId);
  if (!p) return;
  if (editTarget.value) {
    Object.assign(editTarget.value, {
      description: form.description,
      category: form.category || "Diğer",
      amount: form.amount,
      date: date.value.toISOString(),
    });
    toast.add({ severity: "success", summary: "Güncellendi", detail: `${p.name} · ${form.description}`, life: 2200 });
  } else {
    p.expenses.push({
      description: form.description,
      category: form.category || "Diğer",
      amount: form.amount,
      currency: p.currency,
      date: date.value.toISOString(),
    });
    toast.add({ severity: "success", summary: "Gider eklendi", detail: `${p.name} · ${form.description}`, life: 2200 });
  }
  dialog.value = false;
}
function del(row: { pid: string; e: ExpenseItem }) {
  const p = financeProjects.find((x) => x.id === row.pid);
  if (!p) return;
  const i = p.expenses.indexOf(row.e);
  if (i >= 0) p.expenses.splice(i, 1);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
.fh-r { display: flex; align-items: center; gap: 10px; }
.sub { color: #94a3b8; }
</style>
