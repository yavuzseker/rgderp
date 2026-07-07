<template>
  <div class="fpage">
    <DataTable :value="fixedGroups" dataKey="id" v-model:expandedRows="expandedRows"
      paginator :rows="15" removableSort class="card-table">
      <template #header>
        <div class="fh">
          <div><h3>Sabit Giderler</h3><p>Kalem başlığı — satıra basınca aylık tutarlar açılır</p></div>
          <Button label="Yeni Kalem" icon="pi pi-plus" @click="openNew" />
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="name" header="Kalem" sortable />
      <Column header="Aylık" style="width: 200px">
        <template #body="{ data }">
          <template v-if="data.entries.length">
            <b class="mono">{{ fmtMoney(data.entries[0].amount, data.currency) }}</b>
            <small class="sub">· {{ data.entries.length }} ay</small>
          </template>
          <small v-else class="sub">tutar girilmedi</small>
        </template>
      </Column>
      <Column header="Toplam" style="width: 180px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(totalOf(data), data.currency) }}</span></template>
      </Column>
      <Column header="" style="width: 110px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="removeGroup(data)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>

      <!-- Alt detay: aylık tutarlar -->
      <template #expansion="{ data }">
        <div class="inst">
          <div class="inst-head">
            <span><i class="pi pi-calendar" /> {{ data.name }} <small>({{ data.currency }})</small></span>
            <div class="inst-add">
              <DatePicker v-model="newDate" view="month" dateFormat="mm/yy" placeholder="Ay" showIcon />
              <InputNumber v-model="newAmount" :min="0" placeholder="Tutar" />
              <Button icon="pi pi-plus" label="Ekle" size="small" @click="addEntry(data)" />
              <Button icon="pi pi-copy" label="6 Aya Kopyala" size="small" severity="secondary" outlined @click="copy6(data)" v-tooltip.top="'Seçilen aydan itibaren 6 ay bu tutarla doldurulur'" />
            </div>
          </div>
          <table class="inst-table">
            <thead><tr><th>Ay</th><th class="r">Tutar</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(e, i) in sorted(data)" :key="i">
                <template v-if="editing === e">
                  <td><DatePicker v-model="editDate" view="month" dateFormat="mm/yy" showIcon /></td>
                  <td class="r"><InputNumber v-model="editAmount" :min="0" /></td>
                  <td class="r">
                    <Button icon="pi pi-check" text rounded size="small" severity="success" @click="saveEdit(data, e)" v-tooltip.top="'Kaydet'" />
                    <Button icon="pi pi-times" text rounded size="small" @click="editing = null" v-tooltip.top="'Vazgeç'" />
                  </td>
                </template>
                <template v-else>
                  <td>{{ monthLabel(e.date) }}</td>
                  <td class="r mono">{{ fmtMoney(e.amount, data.currency) }}</td>
                  <td class="r">
                    <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="startEdit(e)" v-tooltip.top="'Düzenle'" />
                    <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="delEntry(data, e)" v-tooltip.top="'Sil'" />
                  </td>
                </template>
              </tr>
              <tr v-if="!data.entries.length"><td colspan="3" class="empty">Tutar yok. Yukarıdan ay + tutar ekleyin.</td></tr>
            </tbody>
            <tfoot v-if="data.entries.length">
              <tr><td>Toplam ({{ data.entries.length }} ay)</td><td class="r mono"><b>{{ fmtMoney(totalOf(data), data.currency) }}</b></td><td></td></tr>
            </tfoot>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Kalem Düzenle' : 'Yeni Kalem'" modal :style="{ width: '440px' }">
      <div class="form">
        <div class="field"><label>Kalem Adı *</label><InputText v-model="form.name" autofocus :invalid="submitted && !form.name" placeholder="Örn: Kira" /></div>
        <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
        <p class="hint">Kalemi ekledikten sonra satırı açıp aylık tutarları girebilirsin.</p>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button :label="editTarget ? 'Kaydet' : 'Ekle'" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { useToast } from "primevue/usetoast";
import { fixedGroups, finUid } from "@/data/financeMock";
import { fmtMoney, type FixedGroup, type FixedEntry } from "@/finance/types";
import { CUR } from "@/finance/ui";

const toast = useToast();
const expandedRows = ref<FixedGroup[]>([]);

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const monthLabel = (iso: string) => { const d = new Date(iso); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const totalOf = (g: FixedGroup) => g.entries.reduce((s, e) => s + e.amount, 0);
const sorted = (g: FixedGroup) => [...g.entries].sort((a, b) => (a.date < b.date ? -1 : 1));
const resort = (g: FixedGroup) => g.entries.sort((a, b) => (a.date < b.date ? -1 : 1));
const monthISO = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 5).toISOString().slice(0, 10);

// ---- Aylık tutar ekle/sil ----
const newDate = ref<Date | null>(null);
const newAmount = ref<number | null>(null);
function addEntry(g: FixedGroup) {
  if (!newDate.value || !newAmount.value) return;
  g.entries.push({ date: monthISO(newDate.value), amount: newAmount.value });
  resort(g);
  newDate.value = null;
  newAmount.value = null;
  toast.add({ severity: "success", summary: "Eklendi", life: 1600 });
}
function delEntry(g: FixedGroup, e: FixedEntry) {
  const i = g.entries.indexOf(e);
  if (i >= 0) g.entries.splice(i, 1);
}
/** Seçilen aydan itibaren 6 ayı aynı tutarla doldurur (varsa o ayı günceller). */
function copy6(g: FixedGroup) {
  if (!newDate.value || !newAmount.value) return;
  const start = new Date(newDate.value.getFullYear(), newDate.value.getMonth(), 1);
  for (let i = 0; i < 6; i++) {
    const iso = new Date(start.getFullYear(), start.getMonth() + i, 5).toISOString().slice(0, 10);
    const ym = iso.slice(0, 7);
    const existing = g.entries.find((e) => e.date.slice(0, 7) === ym);
    if (existing) existing.amount = newAmount.value;
    else g.entries.push({ date: iso, amount: newAmount.value });
  }
  resort(g);
  newDate.value = null;
  newAmount.value = null;
  toast.add({ severity: "success", summary: "6 ay dolduruldu", life: 1800 });
}

// ---- Aylık tutar düzenle ----
const editing = ref<FixedEntry | null>(null);
const editDate = ref<Date | null>(null);
const editAmount = ref<number | null>(null);
function startEdit(e: FixedEntry) {
  editing.value = e;
  editDate.value = new Date(e.date);
  editAmount.value = e.amount;
}
function saveEdit(g: FixedGroup, e: FixedEntry) {
  if (!editDate.value || !editAmount.value) return;
  e.date = monthISO(editDate.value);
  e.amount = editAmount.value;
  editing.value = null;
  resort(g);
  toast.add({ severity: "success", summary: "Güncellendi", life: 1600 });
}

// ---- Kalem CRUD ----
const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<FixedGroup | null>(null);
const empty = (): FixedGroup => ({ name: "", currency: "TL", entries: [] });
const form = reactive<FixedGroup>(empty());

function openNew() {
  Object.assign(form, empty());
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(g: FixedGroup) {
  Object.assign(form, { name: g.name, currency: g.currency, entries: g.entries });
  editTarget.value = g;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.name.trim()) return;
  if (editTarget.value) {
    Object.assign(editTarget.value, { name: form.name, currency: form.currency });
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.name, life: 2000 });
  } else {
    fixedGroups.push({ id: finUid(), name: form.name, currency: form.currency, entries: [] });
    toast.add({ severity: "success", summary: "Kalem eklendi", detail: form.name, life: 2000 });
  }
  dialog.value = false;
}
function removeGroup(g: FixedGroup) {
  const i = fixedGroups.indexOf(g);
  if (i >= 0) fixedGroups.splice(i, 1);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
.sub { color: #94a3b8; }
.hint { font-size: 12px; color: #94a3b8; margin: 2px 0 0; }

.inst { padding: 6px 8px 10px; }
.inst-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.inst-head span { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.inst-head i { color: #1488c8; }
.inst-head small { color: #94a3b8; font-weight: 500; }
.inst-add { display: flex; align-items: center; gap: 8px; }
.inst-add :deep(.p-inputnumber-input), .inst-add :deep(.p-datepicker-input) { width: 130px; }

.inst-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; }
.inst-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 12px; border-bottom: 1px solid #eef2f7; }
.inst-table td { padding: 8px 12px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.inst-table tbody tr:last-child td { border-bottom: none; }
.inst-table .r { text-align: right; }
.inst-table .mono { font-variant-numeric: tabular-nums; }
.inst-table tfoot td { padding: 8px 12px; border-top: 2px solid #eef2f7; color: #0f172a; }
.empty { text-align: center; color: #94a3b8; padding: 14px; }
</style>
