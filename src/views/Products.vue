<template>
  <div class="page">
    <DataTable
      :value="db.products"
      dataKey="id"
      paginator
      :rows="10"
      removableSort
      :filters="filters"
      :globalFilterFields="['name', 'code']"
      class="card-table"
      currentPageReportTemplate="{first}-{last} / {totalRecords}"
      :paginatorTemplate="'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'"
    >
      <template #header>
        <PageHeader
          title="Ürünler"
          subtitle="Ürün tanımları ve üretim rotaları (aşama şablonu)"
          addLabel="Yeni Ürün"
          v-model:search="filters.global.value"
          searchPlaceholder="Ürün ara..."
          @add="openNew"
        />
      </template>
      <template #empty><div class="empty">Kayıt bulunamadı.</div></template>

      <Column field="name" header="Ürün Adı" sortable>
        <template #body="{ data }">
          <div class="cell-name">
            <Avatar icon="pi pi-box" shape="circle" style="background: #6366f11a; color: #6366f1" />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="code" header="Kod" sortable>
        <template #body="{ data }"><Tag :value="data.code" severity="secondary" /></template>
      </Column>
      <Column header="Üretim Rotası">
        <template #body="{ data }">
          <span class="route">{{ data.stages.map((s: any) => s.name).join("  ›  ") }}</span>
        </template>
      </Column>
      <Column header="Aşama" style="width: 90px">
        <template #body="{ data }">{{ data.stages.length }}</template>
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

    <Dialog v-model:visible="dialog" :header="form.id ? 'Ürünü Düzenle' : 'Yeni Ürün'" modal :style="{ width: '640px' }">
      <div class="form">
        <div class="two">
          <div class="field">
            <label>Ürün Adı *</label>
            <InputText v-model="form.name" autofocus :invalid="submitted && !form.name" placeholder="Örn: Ring Separatör" />
          </div>
          <div class="field">
            <label>Ürün Kodu *</label>
            <InputText v-model="form.code" :invalid="submitted && !form.code" placeholder="Örn: RS-220" />
          </div>
        </div>

        <div class="stages-head">
          <label>Üretim Aşamaları (Rota)</label>
          <Button label="Aşama Ekle" icon="pi pi-plus" size="small" text @click="addStage" />
        </div>

        <div v-if="!form.stages?.length" class="stages-empty">
          Henüz aşama yok. “Aşama Ekle” ile rota oluşturun.
        </div>

        <div v-for="(st, i) in form.stages" :key="st.key" class="stage-row">
          <span class="stage-no">{{ i + 1 }}</span>
          <InputText v-model="st.name" placeholder="Aşama adı" class="stage-name" />
          <Select
            v-model="st.defaultSupplierId"
            :options="db.suppliers"
            optionLabel="name"
            optionValue="id"
            placeholder="Tedarikçi seç"
            class="stage-sup"
          />
          <div class="stage-ops">
            <Button icon="pi pi-chevron-up" text rounded size="small" :disabled="i === 0" @click="move(i, -1)" />
            <Button icon="pi pi-chevron-down" text rounded size="small" :disabled="i === form.stages!.length - 1" @click="move(i, 1)" />
            <Button icon="pi pi-times" text rounded size="small" severity="danger" @click="form.stages!.splice(i, 1)" />
          </div>
        </div>
        <small v-if="submitted && stageError" class="err">{{ stageError }}</small>
      </div>
      <template #footer>
        <Button label="İptal" text @click="dialog = false" />
        <Button label="Kaydet" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import PageHeader from "@/components/PageHeader.vue";
import { db, saveProduct, deleteProduct, uid } from "@/data/store";
import type { Product, StageTemplate } from "@/types";

const confirm = useConfirm();
const toast = useToast();

const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const dialog = ref(false);
const submitted = ref(false);
const empty = (): Partial<Product> => ({ name: "", code: "", stages: [] });
const form = reactive<Partial<Product>>(empty());

const stageError = computed(() => {
  if (!form.stages?.length) return "En az bir aşama ekleyin.";
  for (let i = 0; i < form.stages.length; i++) {
    if (!form.stages[i].name.trim()) return `Aşama ${i + 1}: ad boş.`;
    if (!form.stages[i].defaultSupplierId) return `Aşama ${i + 1}: tedarikçi seçilmedi.`;
  }
  return "";
});

function addStage() {
  form.stages!.push({ key: uid(), name: "", defaultSupplierId: "" } as StageTemplate);
}
function move(i: number, dir: -1 | 1) {
  const a = form.stages!;
  [a[i], a[i + dir]] = [a[i + dir], a[i]];
}
function openNew() {
  Object.assign(form, empty());
  delete form.id;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(p: Product) {
  Object.assign(form, { ...p, stages: p.stages.map((s) => ({ ...s })) });
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.name?.trim() || !form.code?.trim() || stageError.value) return;
  saveProduct(form as Product);
  toast.add({ severity: "success", summary: form.id ? "Güncellendi" : "Eklendi", detail: form.name, life: 2500 });
  dialog.value = false;
}
function confirmDelete(p: Product) {
  confirm.require({
    header: "Silme onayı",
    message: `"${p.name}" silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil",
    rejectLabel: "Vazgeç",
    acceptProps: { severity: "danger" },
    accept: () => {
      deleteProduct(p.id);
      toast.add({ severity: "info", summary: "Silindi", detail: p.name, life: 2500 });
    },
  });
}
</script>

<style scoped>
@import "@/views/table.css";
.route { color: #64748b; font-size: 13px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.stages-head { display: flex; justify-content: space-between; align-items: center; }
.stages-head label { font-size: 13px; font-weight: 700; color: #334155; }
.stages-empty {
  border: 1px dashed #cbd5e1; border-radius: 10px; padding: 18px;
  text-align: center; color: #94a3b8; font-size: 13px;
}
.stage-row {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1px solid #eef2f7; border-radius: 10px; padding: 8px;
}
.stage-no {
  width: 26px; height: 26px; border-radius: 50%; background: #4f46e5; color: #fff;
  display: grid; place-items: center; font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.stage-name { flex: 1.4; }
.stage-sup { flex: 1; }
.stage-ops { display: flex; }
.stage-name :deep(input) { width: 100%; }
</style>
