<template>
  <div class="fpage">
    <DataTable :value="checks" dataKey="firma" paginator :rows="10" removableSort class="card-table"
      sortField="dueDate" :sortOrder="1">
      <template #header>
        <div class="fh">
          <div><h3>Ödenecek Çekler</h3><p>Cari & çek ödemeleri</p></div>
          <Button label="Yeni Çek" icon="pi pi-plus" @click="openNew" />
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column field="firma" header="Firma" sortable />
      <Column field="bank" header="Banka" sortable>
        <template #body="{ data }"><span class="cat">{{ data.bank }}</span></template>
      </Column>
      <Column field="amount" header="Tutar" sortable style="width: 170px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.amount, data.currency) }}</span></template>
      </Column>
      <Column field="dueDate" header="Vade" sortable style="width: 200px">
        <template #body="{ data }">
          {{ fmtDate(data.dueDate) }}
          <small class="wl" :class="{ over: weeksLeft(data.dueDate).overdue }">· {{ weeksLeft(data.dueDate).text }}</small>
        </template>
      </Column>
      <Column header="" style="width: 70px">
        <template #body="{ index }">
          <Button icon="pi pi-trash" text rounded severity="danger" @click="checks.splice(index, 1)" v-tooltip.top="'Sil'" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" header="Yeni Çek" modal :style="{ width: '480px' }">
      <div class="form">
        <div class="two">
          <div class="field"><label>Firma *</label><InputText v-model="form.firma" autofocus :invalid="submitted && !form.firma" placeholder="Örn: Küresel Hırdavat" /></div>
          <div class="field"><label>Banka</label><InputText v-model="form.bank" placeholder="Örn: Halkbank" /></div>
        </div>
        <div class="two">
          <div class="field"><label>Tutar *</label><InputNumber v-model="form.amount" :min="0" :invalid="submitted && !form.amount" fluid /></div>
          <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <div class="field"><label>Vade Tarihi *</label><DatePicker v-model="dueDate" dateFormat="dd.mm.yy" :invalid="submitted && !dueDate" showIcon fluid /></div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button label="Ekle" icon="pi pi-check" @click="save" />
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
import { checks } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, type CheckItem } from "@/finance/types";
import { CUR } from "@/finance/ui";

const toast = useToast();
const dialog = ref(false);
const submitted = ref(false);
const dueDate = ref<Date | null>(null);
const empty = (): CheckItem => ({ firma: "", bank: "", amount: 0, currency: "TL", dueDate: "" });
const form = reactive<CheckItem>(empty());

function openNew() {
  Object.assign(form, empty());
  dueDate.value = null;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.firma.trim() || !form.amount || !dueDate.value) return;
  checks.push({ ...form, dueDate: dueDate.value.toISOString() });
  toast.add({ severity: "success", summary: "Eklendi", detail: form.firma, life: 2200 });
  dialog.value = false;
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }
</style>
