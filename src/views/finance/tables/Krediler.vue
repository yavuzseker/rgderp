<template>
  <div class="fpage">
    <DataTable :value="loans" dataKey="id" v-model:expandedRows="expandedRows"
      paginator :rows="10" removableSort class="card-table">
      <template #header>
        <div class="fh">
          <div><h3>Krediler</h3><p>Satıra basınca taksit planı açılır</p></div>
          <Button label="Yeni Kredi" icon="pi pi-plus" @click="openNew" />
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column expander style="width: 3rem" />
      <Column field="name" header="Kredi" sortable />
      <Column field="bank" header="Banka" sortable>
        <template #body="{ data }"><span class="cat">{{ data.bank }}</span></template>
      </Column>
      <Column field="remaining" header="Kalan" sortable style="width: 170px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(remainingOf(data), data.currency) }}</span></template>
      </Column>
      <Column header="Taksit" style="width: 200px">
        <template #body="{ data }">
          <template v-if="data.installments?.length">
            <b>{{ data.installments.length }}</b> taksit
            <small class="sub">· sonraki {{ fmtDate(data.installments[0].date) }}</small>
          </template>
          <small v-else class="sub">taksit planı yok</small>
        </template>
      </Column>
      <Column header="" style="width: 110px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="deleteLoan(data.id)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>

      <!-- Alt detay: taksit planı -->
      <template #expansion="{ data }">
        <div class="inst">
          <div class="inst-head">
            <span><i class="pi pi-calendar" /> Taksit Planı <small>({{ data.currency }})</small></span>
            <div class="inst-add">
              <DatePicker v-model="newDate" dateFormat="dd.mm.yy" placeholder="Vade" showIcon />
              <InputNumber v-model="newAmount" :min="0" placeholder="Tutar" />
              <Button icon="pi pi-plus" label="Ekle" size="small" @click="addInst(data)" />
            </div>
          </div>
          <table class="inst-table">
            <thead><tr><th>Vade</th><th class="r">Tutar</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(t, i) in sorted(data)" :key="i">
                <template v-if="editing === t">
                  <td><DatePicker v-model="editDate" dateFormat="dd.mm.yy" showIcon /></td>
                  <td class="r"><InputNumber v-model="editAmount" :min="0" /></td>
                  <td class="r">
                    <Button icon="pi pi-check" text rounded size="small" severity="success" @click="saveEdit(data, t)" v-tooltip.top="'Kaydet'" />
                    <Button icon="pi pi-times" text rounded size="small" @click="editing = null" v-tooltip.top="'Vazgeç'" />
                  </td>
                </template>
                <template v-else>
                  <td>{{ fmtDate(t.date) }} <small class="wl" :class="{ over: weeksLeft(t.date).overdue }">· {{ weeksLeft(t.date).text }}</small></td>
                  <td class="r mono">{{ fmtMoney(t.amount, data.currency) }}</td>
                  <td class="r">
                    <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="startEdit(t)" v-tooltip.top="'Düzenle'" />
                    <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="delInst(data, t)" v-tooltip.top="'Sil'" />
                  </td>
                </template>
              </tr>
              <tr v-if="!data.installments?.length"><td colspan="3" class="empty">Taksit yok. Yukarıdan ekleyin.</td></tr>
            </tbody>
            <tfoot v-if="data.installments?.length">
              <tr><td>Toplam ({{ data.installments.length }} taksit)</td><td class="r mono"><b>{{ fmtMoney(remainingOf(data), data.currency) }}</b></td><td></td></tr>
            </tfoot>
          </table>
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Kredi Düzenle' : 'Yeni Kredi'" modal :style="{ width: '480px' }">
      <div class="form">
        <div class="two">
          <div class="field"><label>Kredi Adı *</label><InputText v-model="form.name" autofocus :invalid="submitted && !form.name" placeholder="Örn: Garanti Kredi 40M" /></div>
          <div class="field"><label>Banka</label><InputText v-model="form.bank" placeholder="Örn: Garanti" /></div>
        </div>
        <div class="two">
          <div class="field"><label>Kalan Tutar *</label><InputNumber v-model="form.remaining" :min="0" :invalid="submitted && !form.remaining" fluid /></div>
          <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <p class="hint">Taksit planını kaydettikten sonra satırı açıp ekleyebilirsin.</p>
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
import { loans, saveLoan, deleteLoan } from "@/data/financeStore";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, type Loan, type LoanInstallment } from "@/finance/types";
import { CUR } from "@/finance/ui";

const toast = useToast();
const expandedRows = ref<Loan[]>([]);

// ---- Taksit planı yardımcıları ----
const remainingOf = (l: Loan) =>
  l.installments?.length ? l.installments.reduce((s, t) => s + t.amount, 0) : l.remaining;
const sorted = (l: Loan) => [...(l.installments ?? [])].sort((a, b) => (a.date < b.date ? -1 : 1));

function sync(l: Loan) {
  if (!l.installments) return;
  l.installments.sort((a, b) => (a.date < b.date ? -1 : 1));
  l.remaining = l.installments.reduce((s, t) => s + t.amount, 0);
  l.monthlyInstallment = l.installments[0]?.amount ?? 0;
  saveLoan(l); // kalıcı: Firestore
}

const newDate = ref<Date | null>(null);
const newAmount = ref<number | null>(null);
function addInst(l: Loan) {
  if (!newDate.value || !newAmount.value) return;
  if (!l.installments) l.installments = [];
  l.installments.push({ date: newDate.value.toISOString().slice(0, 10), amount: newAmount.value });
  sync(l);
  newDate.value = null;
  newAmount.value = null;
  toast.add({ severity: "success", summary: "Taksit eklendi", life: 1800 });
}
function delInst(l: Loan, t: LoanInstallment) {
  const i = l.installments?.indexOf(t) ?? -1;
  if (i >= 0) l.installments!.splice(i, 1);
  sync(l);
}

// ---- Taksit düzenle (satır-içi) ----
const editing = ref<LoanInstallment | null>(null);
const editDate = ref<Date | null>(null);
const editAmount = ref<number | null>(null);
function startEdit(t: LoanInstallment) {
  editing.value = t;
  editDate.value = new Date(t.date);
  editAmount.value = t.amount;
}
function saveEdit(l: Loan, t: LoanInstallment) {
  if (!editDate.value || !editAmount.value) return;
  t.date = editDate.value.toISOString().slice(0, 10);
  t.amount = editAmount.value;
  editing.value = null;
  sync(l);
  toast.add({ severity: "success", summary: "Taksit güncellendi", life: 1800 });
}

// ---- Kredi CRUD ----
const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<Loan | null>(null);
const empty = (): Loan => ({ name: "", bank: "", remaining: 0, currency: "TL", monthlyInstallment: 0 });
const form = reactive<Loan>(empty());

function openNew() {
  Object.assign(form, empty());
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(item: Loan) {
  Object.assign(form, item);
  editTarget.value = item;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.name.trim() || !form.remaining) return;
  if (editTarget.value) {
    Object.assign(editTarget.value, { name: form.name, bank: form.bank, remaining: form.remaining, currency: form.currency, monthlyInstallment: form.monthlyInstallment });
    saveLoan(editTarget.value);
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.name, life: 2200 });
  } else {
    saveLoan({ ...form });
    toast.add({ severity: "success", summary: "Eklendi", detail: form.name, life: 2200 });
  }
  dialog.value = false;
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
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }
.empty { text-align: center; color: #94a3b8; padding: 14px; }
</style>
