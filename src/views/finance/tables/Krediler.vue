<template>
  <div class="fpage">
    <DataTable :value="loans" dataKey="name" paginator :rows="10" removableSort class="card-table">
      <template #header>
        <div class="fh">
          <div><h3>Krediler</h3><p>Banka kredileri ve aylık taksitler</p></div>
          <Button label="Yeni Kredi" icon="pi pi-plus" @click="openNew" />
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column field="name" header="Kredi" sortable />
      <Column field="bank" header="Banka" sortable>
        <template #body="{ data }"><span class="cat">{{ data.bank }}</span></template>
      </Column>
      <Column field="remaining" header="Kalan" sortable style="width: 180px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.remaining, data.currency) }}</span></template>
      </Column>
      <Column field="monthlyInstallment" header="Aylık Taksit" sortable style="width: 170px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.monthlyInstallment, data.currency) }}</span></template>
      </Column>
      <Column header="" style="width: 70px">
        <template #body="{ index }">
          <Button icon="pi pi-trash" text rounded severity="danger" @click="loans.splice(index, 1)" v-tooltip.top="'Sil'" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" header="Yeni Kredi" modal :style="{ width: '480px' }">
      <div class="form">
        <div class="two">
          <div class="field"><label>Kredi Adı *</label><InputText v-model="form.name" autofocus :invalid="submitted && !form.name" placeholder="Örn: Garanti Kredi 40M" /></div>
          <div class="field"><label>Banka</label><InputText v-model="form.bank" placeholder="Örn: Garanti" /></div>
        </div>
        <div class="two">
          <div class="field"><label>Kalan Tutar *</label><InputNumber v-model="form.remaining" :min="0" :invalid="submitted && !form.remaining" fluid /></div>
          <div class="field"><label>Para</label><Select v-model="form.currency" :options="CUR" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <div class="field"><label>Aylık Taksit</label><InputNumber v-model="form.monthlyInstallment" :min="0" fluid /></div>
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
import { useToast } from "primevue/usetoast";
import { loans } from "@/data/financeMock";
import { fmtMoney, type Loan } from "@/finance/types";
import { CUR } from "@/finance/ui";

const toast = useToast();
const dialog = ref(false);
const submitted = ref(false);
const empty = (): Loan => ({ name: "", bank: "", remaining: 0, currency: "TL", monthlyInstallment: 0 });
const form = reactive<Loan>(empty());

function openNew() {
  Object.assign(form, empty());
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.name.trim() || !form.remaining) return;
  loans.push({ ...form });
  toast.add({ severity: "success", summary: "Eklendi", detail: form.name, life: 2200 });
  dialog.value = false;
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
</style>
