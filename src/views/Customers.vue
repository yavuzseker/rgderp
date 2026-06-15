<template>
  <div class="page">
    <DataTable
      :value="db.customers"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      removableSort
      :filters="filters"
      :globalFilterFields="['name', 'contact']"
      class="card-table"
      currentPageReportTemplate="{first}-{last} / {totalRecords}"
      :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'"
    >
      <template #header>
        <PageHeader
          title="Müşteriler"
          subtitle="Sipariş veren firmalar"
          addLabel="Yeni Müşteri"
          v-model:search="filters.global.value"
          searchPlaceholder="Müşteri ara..."
          @add="openNew"
        />
      </template>
      <template #empty><div class="empty">Kayıt bulunamadı.</div></template>

      <Column field="name" header="Müşteri Adı" sortable>
        <template #body="{ data }">
          <div class="cell-name">
            <Avatar icon="pi pi-user" shape="circle" style="background: #10b9811a; color: #10b981" />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="contact" header="İletişim" sortable>
        <template #body="{ data }">{{ data.contact || "—" }}</template>
      </Column>
      <Column header="Takip Tokeni">
        <template #body="{ data }">
          <code class="token">{{ data.accessToken.slice(0, 12) }}…</code>
        </template>
      </Column>
      <Column header="" style="width: 110px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="form.id ? 'Müşteri Düzenle' : 'Yeni Müşteri'" modal :style="{ width: '460px' }">
      <div class="form">
        <div class="field">
          <label>Müşteri Adı *</label>
          <InputText v-model="form.name" autofocus :invalid="submitted && !form.name" placeholder="Örn: Akın Makina San." />
          <small v-if="submitted && !form.name" class="err">Müşteri adı gerekli.</small>
        </div>
        <div class="field">
          <label>İletişim</label>
          <InputText v-model="form.contact" placeholder="Telefon veya e-posta" />
        </div>
        <div class="field">
          <label>Takip Tokeni</label>
          <InputGroup>
            <InputText v-model="form.accessToken" />
            <Button icon="pi pi-refresh" severity="secondary" outlined @click="form.accessToken = token()" v-tooltip.top="'Yenile'" />
          </InputGroup>
          <small class="hint">Müşteri bu token ile sipariş durumunu izleyecek.</small>
        </div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button label="Kaydet" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import Avatar from "primevue/avatar";
import PageHeader from "@/components/PageHeader.vue";
import { db, saveCustomer, deleteCustomer, token } from "@/data/store";
import type { Customer } from "@/types";

const confirm = useConfirm();
const toast = useToast();

const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const dialog = ref(false);
const submitted = ref(false);
const empty = (): Partial<Customer> => ({ name: "", contact: "", accessToken: token() });
const form = reactive<Partial<Customer>>(empty());

function openNew() {
  Object.assign(form, empty());
  delete form.id;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(c: Customer) {
  Object.assign(form, { ...c });
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.name?.trim()) return;
  saveCustomer(form as Customer);
  toast.add({ severity: "success", summary: form.id ? "Güncellendi" : "Eklendi", detail: form.name, life: 2500 });
  dialog.value = false;
}
function confirmDelete(c: Customer) {
  confirm.require({
    header: "Silme onayı",
    message: `"${c.name}" silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil",
    rejectLabel: "Vazgeç",
    acceptProps: { severity: "danger" },
    accept: () => {
      deleteCustomer(c.id);
      toast.add({ severity: "info", summary: "Silindi", detail: c.name, life: 2500 });
    },
  });
}
</script>

<style scoped>
@import "@/views/table.css";
</style>
