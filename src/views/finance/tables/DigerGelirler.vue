<template>
  <div class="fpage">
    <DataTable :value="otherIncome" dataKey="id" paginator :rows="12" removableSort class="card-table"
      sortField="date" :sortOrder="1">
      <template #header>
        <div class="fh">
          <div><h3>Diğer Gelirler</h3><p>Proje dışı gelirler — KDV iade, ortak ödeme, kasa girişi</p></div>
          <Button label="Yeni Gelir" icon="pi pi-plus" @click="openNew" />
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column field="description" header="Açıklama" sortable />
      <Column field="amount" header="Tutar" sortable style="width: 190px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.amount, data.currency) }}</span></template>
      </Column>
      <Column field="date" header="Tarih" sortable style="width: 160px">
        <template #body="{ data }">{{ fmtDate(data.date) }}</template>
      </Column>
      <Column header="" style="width: 110px">
        <template #body="{ data, index }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="otherIncome.splice(index, 1)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Geliri Düzenle' : 'Yeni Gelir'" modal :style="{ width: '460px' }">
      <div class="form">
        <div class="field"><label>Açıklama *</label><InputText v-model="form.description" autofocus :invalid="submitted && !form.description" placeholder="Örn: KDV İadesi" /></div>
        <div class="two">
          <div class="field"><label>Tutar *</label><InputNumber v-model="form.amount" :min="0" :invalid="submitted && !form.amount" fluid /></div>
          <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
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
import { otherIncome, finUid } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import { fmtMoney, type OtherIncome } from "@/finance/types";
import { CUR } from "@/finance/ui";

const toast = useToast();
const dialog = ref(false);
const submitted = ref(false);
const date = ref<Date | null>(null);
const editTarget = ref<OtherIncome | null>(null);
interface Form { description: string; amount: number; currency: "EUR" | "TL" }
const empty = (): Form => ({ description: "", amount: 0, currency: "TL" });
const form = reactive<Form>(empty());

function openNew() {
  Object.assign(form, empty());
  date.value = null;
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(item: OtherIncome) {
  Object.assign(form, { description: item.description, amount: item.amount, currency: item.currency });
  date.value = new Date(item.date);
  editTarget.value = item;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.description.trim() || !form.amount || !date.value) return;
  const payload = { description: form.description, amount: form.amount, currency: form.currency, date: date.value.toISOString().slice(0, 10) };
  if (editTarget.value) {
    Object.assign(editTarget.value, payload);
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.description, life: 2000 });
  } else {
    otherIncome.push({ id: finUid(), ...payload });
    toast.add({ severity: "success", summary: "Gelir eklendi", detail: form.description, life: 2000 });
  }
  dialog.value = false;
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
</style>
