<template>
  <div class="fpage">
    <DataTable :value="fixedExpenses" dataKey="name" paginator :rows="10" removableSort class="card-table">
      <template #header>
        <div class="fh">
          <div><h3>Sabit Giderler</h3><p>Aylık düzenli ödemeler</p></div>
          <Button label="Yeni Kalem" icon="pi pi-plus" @click="openNew" />
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column field="name" header="Kalem" sortable />
      <Column field="dayOfMonth" header="Ödeme Günü" sortable style="width: 140px">
        <template #body="{ data }">Her ayın {{ data.dayOfMonth }}.</template>
      </Column>
      <Column field="amount" header="Tutar" sortable style="width: 180px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.amount, data.currency) }}</span></template>
      </Column>
      <Column header="" style="width: 110px">
        <template #body="{ data, index }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="remove(index)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Sabit Gider Düzenle' : 'Yeni Sabit Gider'" modal :style="{ width: '440px' }">
      <div class="form">
        <div class="field"><label>Kalem *</label><InputText v-model="form.name" autofocus :invalid="submitted && !form.name" placeholder="Örn: Kira" /></div>
        <div class="two">
          <div class="field"><label>Tutar *</label><InputNumber v-model="form.amount" :min="0" :invalid="submitted && !form.amount" fluid /></div>
          <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <div class="field"><label>Ödeme Günü (1–31)</label><InputNumber v-model="form.dayOfMonth" :min="1" :max="31" fluid /></div>
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
import { useToast } from "primevue/usetoast";
import { fixedExpenses } from "@/data/financeMock";
import { fmtMoney, type FixedExpense } from "@/finance/types";
import { CUR } from "@/finance/ui";

const toast = useToast();
const dialog = ref(false);
const submitted = ref(false);
const editTarget = ref<FixedExpense | null>(null);
const empty = (): FixedExpense => ({ name: "", amount: 0, currency: "TL", dayOfMonth: 1 });
const form = reactive<FixedExpense>(empty());

function openNew() {
  Object.assign(form, empty());
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(item: FixedExpense) {
  Object.assign(form, item);
  editTarget.value = item;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.name.trim() || !form.amount) return;
  if (editTarget.value) {
    Object.assign(editTarget.value, { ...form });
    toast.add({ severity: "success", summary: "Güncellendi", detail: form.name, life: 2200 });
  } else {
    fixedExpenses.push({ ...form });
    toast.add({ severity: "success", summary: "Eklendi", detail: form.name, life: 2200 });
  }
  dialog.value = false;
}
function remove(i: number) {
  fixedExpenses.splice(i, 1);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
</style>
