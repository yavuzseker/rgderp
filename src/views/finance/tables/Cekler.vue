<template>
  <div class="fpage">
    <DataTable :value="checkGroups" dataKey="id" v-model:expandedRows="expandedRows"
      paginator :rows="10" removableSort class="card-table" sortField="firma" :sortOrder="1">
      <template #header>
        <div class="fh">
          <div><h3>Ödenecek Çekler</h3><p>Firma bazında — satıra basınca çekler açılır</p></div>
          <Button label="Yeni Firma" icon="pi pi-plus" @click="openNew" />
        </div>
        <StatStrip :items="sums" />
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="firma" header="Firma" sortable />
      <Column header="Çek" style="width: 200px">
        <template #body="{ data }">
          <b>{{ data.checks.length }}</b> çek
          <small v-if="data.checks.length" class="sub">· sonraki {{ fmtDate(sorted(data)[0].date) }}</small>
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

      <!-- Alt detay: firmanın çekleri -->
      <template #expansion="{ data }">
        <div class="inst">
          <div class="inst-head">
            <span><i class="pi pi-money-bill" /> {{ data.firma }} Çekleri <small>({{ data.currency }})</small></span>
            <div class="inst-add">
              <DatePicker v-model="newDate" dateFormat="dd.mm.yy" placeholder="Vade" showIcon />
              <InputNumber v-model="newAmount" :min="0" placeholder="Tutar" />
              <Button icon="pi pi-plus" label="Ekle" size="small" @click="addCheck(data)" />
            </div>
          </div>
          <table class="inst-table">
            <thead><tr><th>Vade</th><th class="r">Tutar</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(c, i) in sorted(data)" :key="i">
                <template v-if="editing === c">
                  <td><DatePicker v-model="editDate" dateFormat="dd.mm.yy" showIcon /></td>
                  <td class="r"><InputNumber v-model="editAmount" :min="0" /></td>
                  <td class="r">
                    <Button icon="pi pi-check" text rounded size="small" severity="success" @click="saveEdit(data, c)" v-tooltip.top="'Kaydet'" />
                    <Button icon="pi pi-times" text rounded size="small" @click="editing = null" v-tooltip.top="'Vazgeç'" />
                  </td>
                </template>
                <template v-else>
                  <td>{{ fmtDate(c.date) }} <small class="wl" :class="{ over: weeksLeft(c.date).overdue }">· {{ weeksLeft(c.date).text }}</small></td>
                  <td class="r mono">{{ fmtMoney(c.amount, data.currency) }}</td>
                  <td class="r">
                    <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="startEdit(c)" v-tooltip.top="'Düzenle'" />
                    <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="delCheck(data, c)" v-tooltip.top="'Sil'" />
                  </td>
                </template>
              </tr>
              <tr v-if="!data.checks.length"><td colspan="3" class="empty">Çek yok. Yukarıdan ekleyin.</td></tr>
            </tbody>
            <tfoot v-if="data.checks.length">
              <tr><td>Toplam ({{ data.checks.length }} çek)</td><td class="r mono"><b>{{ fmtMoney(totalOf(data), data.currency) }}</b></td><td></td></tr>
            </tfoot>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Firma Düzenle' : 'Yeni Firma'" modal :style="{ width: '440px' }">
      <div class="form">
        <div class="field"><label>Firma Adı *</label><InputText v-model="form.firma" autofocus :invalid="submitted && !form.firma" placeholder="Örn: TKS Kalıp" /></div>
        <div class="two">
          <div class="field"><label>Banka</label><InputText v-model="form.bank" placeholder="Örn: Halkbank" /></div>
          <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <p class="hint">Firmayı ekledikten sonra satırı açıp çekleri ekleyebilirsin.</p>
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
import { checkGroups, saveCheckGroup, deleteCheckGroup } from "@/data/financeStore";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, type CheckGroup, type CheckEntry } from "@/finance/types";
import { toEur, moneyEur } from "@/finance/calc";
import { CUR } from "@/finance/ui";
import StatStrip, { type StatItem } from "@/components/StatStrip.vue";

const toast = useToast();
const expandedRows = ref<CheckGroup[]>([]);

const sums = computed<StatItem[]>(() => {
  const cek = checkGroups.reduce((s, g) => s + g.checks.length, 0);
  const total = checkGroups.reduce((s, g) => s + g.checks.reduce((x, c) => x + toEur(c.amount, g.currency), 0), 0);
  return [
    { label: "Firma", value: checkGroups.length, icon: "pi-building", tone: "blue" },
    { label: "Çek", value: cek, icon: "pi-money-bill", tone: "slate" },
    { label: "Toplam (≈€)", value: moneyEur(total), icon: "pi-wallet", tone: "red" },
  ];
});

const totalOf = (g: CheckGroup) => g.checks.reduce((s, c) => s + c.amount, 0);
const sorted = (g: CheckGroup) => [...g.checks].sort((a, b) => (a.date < b.date ? -1 : 1));
const resort = (g: CheckGroup) => g.checks.sort((a, b) => (a.date < b.date ? -1 : 1));

// ---- Çek ekle/sil ----
const newDate = ref<Date | null>(null);
const newAmount = ref<number | null>(null);
function addCheck(g: CheckGroup) {
  if (!newDate.value || !newAmount.value) return;
  g.checks.push({ date: newDate.value.toISOString().slice(0, 10), amount: newAmount.value });
  resort(g);
  saveCheckGroup(g);
  newDate.value = null;
  newAmount.value = null;
  toast.add({ severity: "success", summary: "Çek eklendi", life: 1800 });
}
function delCheck(g: CheckGroup, c: CheckEntry) {
  const i = g.checks.indexOf(c);
  if (i >= 0) g.checks.splice(i, 1);
  saveCheckGroup(g);
}

// ---- Çek düzenle (satır-içi) ----
const editing = ref<CheckEntry | null>(null);
const editDate = ref<Date | null>(null);
const editAmount = ref<number | null>(null);
function startEdit(c: CheckEntry) {
  editing.value = c;
  editDate.value = new Date(c.date);
  editAmount.value = c.amount;
}
function saveEdit(g: CheckGroup, c: CheckEntry) {
  if (!editDate.value || !editAmount.value) return;
  c.date = editDate.value.toISOString().slice(0, 10);
  c.amount = editAmount.value;
  editing.value = null;
  resort(g);
  saveCheckGroup(g);
  toast.add({ severity: "success", summary: "Çek güncellendi", life: 1800 });
}

// ---- Firma CRUD ----
const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<CheckGroup | null>(null);
const empty = (): CheckGroup => ({ firma: "", bank: "", currency: "TL", checks: [] });
const form = reactive<CheckGroup>(empty());

function openNew() {
  Object.assign(form, empty());
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(g: CheckGroup) {
  Object.assign(form, { firma: g.firma, bank: g.bank, currency: g.currency, checks: g.checks });
  editTarget.value = g;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.firma.trim()) return;
  if (editTarget.value) {
    Object.assign(editTarget.value, { firma: form.firma, bank: form.bank, currency: form.currency });
    saveCheckGroup(editTarget.value);
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.firma, life: 2000 });
  } else {
    saveCheckGroup({ firma: form.firma, bank: form.bank, currency: form.currency, checks: [] });
    toast.add({ severity: "success", summary: "Firma eklendi", detail: form.firma, life: 2000 });
  }
  dialog.value = false;
}
function removeGroup(g: CheckGroup) {
  if (g.id) deleteCheckGroup(g.id);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
@import "@/views/finance/tables/subrow.css";
.sub { color: #94a3b8; }
.hint { font-size: 12px; color: #94a3b8; margin: 2px 0 0; }
</style>
