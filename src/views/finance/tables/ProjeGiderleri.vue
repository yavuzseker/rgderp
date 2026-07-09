<template>
  <div class="fpage">
    <DataTable :value="db.projects" dataKey="id" v-model:expandedRows="expandedRows"
      paginator :rows="10" removableSort class="card-table" sortField="orderNo" :sortOrder="1">
      <template #header>
        <div class="fh">
          <div><h3>Proje Giderleri</h3><p>Proje bazında — satıra basınca giderler açılır</p></div>
        </div>
        <StatStrip :items="sums" />
      </template>
      <template #empty><div class="empty">Proje yok. Önce Projeler'den proje ekleyin.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="orderNo" header="Sipariş" sortable style="width: 170px">
        <template #body="{ data }"><b class="mono">{{ data.orderNo }}</b></template>
      </Column>
      <Column field="name" header="Proje" sortable />
      <Column field="productName" header="Ürün" sortable />
      <Column header="Gider" style="width: 80px">
        <template #body="{ data }"><b>{{ (data.expenses || []).length }}</b></template>
      </Column>
      <Column header="Toplam Gider" style="width: 170px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(totalExp(data), curOf(data)) }}</span></template>
      </Column>

      <template #expansion="{ data }">
        <div class="inst">
          <div class="inst-head">
            <span><i class="pi pi-arrow-up-right" /> {{ data.name }} Giderleri <small>({{ curOf(data) }})</small></span>
            <Button icon="pi pi-plus" label="Gider Ekle" size="small" @click="openAdd(data)" />
          </div>
          <table class="inst-table">
            <thead><tr><th>Açıklama</th><th>Kategori</th><th class="r">Tutar</th><th>Tarih</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(e, i) in sortedExp(data)" :key="i">
                <td>{{ e.description }}</td>
                <td><span class="cat">{{ e.category }}</span></td>
                <td class="r mono">{{ fmtMoney(e.amount, curOf(data)) }}</td>
                <td>{{ fmtDate(e.date) }}</td>
                <td class="r">
                  <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="openEdit(data, e)" v-tooltip.top="'Düzenle'" />
                  <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="del(data, e)" v-tooltip.top="'Sil'" />
                </td>
              </tr>
              <tr v-if="!(data.expenses || []).length"><td colspan="5" class="empty">Gider yok. “Gider Ekle” ile ekleyin.</td></tr>
            </tbody>
            <tfoot v-if="(data.expenses || []).length">
              <tr><td colspan="2">Toplam ({{ data.expenses.length }})</td><td class="r mono"><b>{{ fmtMoney(totalExp(data), curOf(data)) }}</b></td><td colspan="2"></td></tr>
            </tfoot>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Gideri Düzenle' : 'Yeni Gider'" modal :style="{ width: '540px' }">
      <div class="form">
        <div class="field"><label>Açıklama *</label><InputText v-model="form.description" autofocus :invalid="submitted && !form.description" placeholder="Örn: Ham malzeme" /></div>
        <div class="two">
          <div class="field"><label>Kategori</label><InputText v-model="form.category" placeholder="Örn: Malzeme" /></div>
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
import DatePicker from "primevue/datepicker";
import { useToast } from "primevue/usetoast";
import { db, patchProject } from "@/data/store";
import { fmtDate } from "@/utils";
import { fmtMoney } from "@/finance/types";
import { toEur, moneyEur } from "@/finance/calc";
import StatStrip, { type StatItem } from "@/components/StatStrip.vue";
import type { Project, OrderExpense } from "@/types";

const toast = useToast();
const expandedRows = ref<Project[]>([]);

const curOf = (p: Project): "EUR" | "TL" => db.orders.find((o) => o.id === p.orderId)?.currency ?? "EUR";
const sums = computed<StatItem[]>(() => {
  const total = db.projects.reduce(
    (s, p) => s + (p.expenses ?? []).reduce((x, e) => x + toEur(e.amount, curOf(p)), 0),
    0
  );
  return [
    { label: "Proje", value: db.projects.length, icon: "pi-sitemap", tone: "blue" },
    { label: "Toplam Gider (≈€)", value: moneyEur(total), icon: "pi-arrow-up-right", tone: "red" },
  ];
});
const totalExp = (p: Project) => (p.expenses ?? []).reduce((s, e) => s + e.amount, 0);
const sortedExp = (p: Project) => [...(p.expenses ?? [])].sort((a, b) => (a.date < b.date ? -1 : 1));
const persist = (p: Project) => patchProject(p.id, { expenses: p.expenses ?? [] });

const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<OrderExpense | null>(null);
const current = ref<Project | null>(null);
const expDate = ref<Date | null>(null);
interface Form { description: string; category: string; amount: number }
const empty = (): Form => ({ description: "", category: "", amount: 0 });
const form = reactive<Form>(empty());

function openAdd(p: Project) {
  current.value = p;
  Object.assign(form, empty());
  expDate.value = null;
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(p: Project, e: OrderExpense) {
  current.value = p;
  Object.assign(form, { description: e.description, category: e.category, amount: e.amount });
  expDate.value = new Date(e.date);
  editTarget.value = e;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.description.trim() || !form.amount || !expDate.value) return;
  const p = current.value;
  if (!p) return;
  if (!p.expenses) p.expenses = [];
  const date = expDate.value.toISOString().slice(0, 10);
  if (editTarget.value) {
    Object.assign(editTarget.value, { description: form.description, category: form.category || "Diğer", amount: form.amount, date });
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.description, life: 2000 });
  } else {
    p.expenses.push({ description: form.description, category: form.category || "Diğer", amount: form.amount, date });
    toast.add({ severity: "success", summary: "Gider eklendi", detail: form.description, life: 2000 });
  }
  persist(p);
  dialog.value = false;
}
function del(p: Project, e: OrderExpense) {
  const i = (p.expenses ?? []).indexOf(e);
  if (i >= 0) p.expenses!.splice(i, 1);
  persist(p);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
@import "@/views/finance/tables/subrow.css";
</style>
