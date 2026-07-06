<template>
  <div class="fpage">
    <DataTable :value="rows" dataKey="key" paginator :rows="12" removableSort class="card-table"
      :filters="filters" :globalFilterFields="['orderNo', 'project', 'customer', 'code']">
      <template #header>
        <div class="fh">
          <div><h3>Proje Gelirleri (Alacaklar)</h3><p>Teknik onaya bağlı milestone ödemeleri</p></div>
          <div class="fh-r">
            <IconField><InputIcon class="pi pi-search" /><InputText v-model="filters.global.value" placeholder="Ara..." /></IconField>
            <Button label="Yeni Alacak" icon="pi pi-plus" @click="openNew" />
          </div>
        </div>
      </template>
      <template #empty><div class="empty">Kayıt yok.</div></template>

      <Column field="orderNo" header="Sipariş" sortable style="width: 120px" />
      <Column field="project" header="Proje" sortable>
        <template #body="{ data }"><b>{{ data.project }}</b><br /><small class="sub">{{ data.customer }}</small></template>
      </Column>
      <Column field="code" header="Milestone" sortable style="width: 210px">
        <template #body="{ data }"><span class="code">{{ data.code }}</span> <small>{{ data.description }}</small></template>
      </Column>
      <Column field="percent" header="%" sortable style="width: 70px"><template #body="{ data }">%{{ data.percent }}</template></Column>
      <Column field="amount" header="Tutar" sortable style="width: 150px">
        <template #body="{ data }"><span class="mono">{{ fmtMoney(data.amount, data.currency) }}</span></template>
      </Column>
      <Column field="date" header="Tahmini Tarih" sortable style="width: 190px">
        <template #body="{ data }">
          {{ fmtDate(data.date) }}
          <small class="wl" :class="{ over: weeksLeft(data.date).overdue }" v-if="data.status !== 'tahsil'">· {{ weeksLeft(data.date).text }}</small>
        </template>
      </Column>
      <Column field="status" header="Durum" sortable style="width: 130px">
        <template #body="{ data }"><Tag :value="stat(data.status).label" :severity="stat(data.status).severity" /></template>
      </Column>
      <Column header="" style="width: 100px">
        <template #body="{ data }">
          <div class="row-actions">
            <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" v-tooltip.top="'Düzenle'" />
            <Button icon="pi pi-trash" text rounded severity="danger" @click="del(data)" v-tooltip.top="'Sil'" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialog" :header="editTarget ? 'Alacağı Düzenle' : 'Yeni Alacak (Milestone)'" modal :style="{ width: '540px' }">
      <div class="form">
        <div class="field"><label>Proje *</label>
          <Select v-model="form.projectId" :options="projectOpts" optionLabel="label" optionValue="value"
            :invalid="submitted && !form.projectId" :disabled="!!editTarget" placeholder="Sipariş / proje seç" fluid />
        </div>
        <div v-if="selProject" class="contract-info">
          <i class="pi pi-file-edit" /> Sözleşme Bedeli: <b>{{ fmtMoney(selProject.contractValue, selProject.currency) }}</b>
        </div>
        <div class="two">
          <div class="field"><label>Milestone *</label>
            <Select v-model="form.code" :options="MILESTONE_OPTIONS" optionLabel="label" optionValue="code"
              :invalid="submitted && !form.code" placeholder="Kod seç" fluid @change="onCode" />
          </div>
          <div class="field"><label>Yüzde (%) *</label><InputNumber v-model="form.percent" :min="0" :max="100" :invalid="submitted && !form.percent" fluid /></div>
        </div>
        <div class="field"><label>Açıklama</label><InputText v-model="form.description" placeholder="Örn: %30 ATFMR + COP" /></div>
        <div class="two">
          <div class="field"><label>Tutar (otomatik)</label>
            <div class="amount-box">{{ fmtMoney(computedAmount, selProject?.currency ?? "EUR") }}</div>
          </div>
          <div class="field"><label>Durum</label><Select v-model="form.status" :options="STATUS_OPTIONS" optionLabel="label" optionValue="value" fluid /></div>
        </div>
        <div class="field"><label>Tahmini Tarih *</label><DatePicker v-model="estDate" dateFormat="dd.mm.yy" :invalid="submitted && !estDate" showIcon fluid /></div>
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
import Tag from "primevue/tag";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useToast } from "primevue/usetoast";
import { financeProjects } from "@/data/financeMock";
import { fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, MILESTONE_STATUS, type Milestone, type MilestoneStatus } from "@/finance/types";
import { milestoneAmount, projectOptions } from "@/finance/calc";
import { MILESTONE_OPTIONS, STATUS_OPTIONS } from "@/finance/ui";

const toast = useToast();
const filters = ref({ global: { value: null as string | null, matchMode: "contains" } });
const stat = (s: MilestoneStatus) => MILESTONE_STATUS[s];

const rows = computed(() =>
  financeProjects.flatMap((p) =>
    p.milestones.map((m, i) => ({
      key: p.id + "-" + i,
      pid: p.id,
      m,
      orderNo: p.orderNo,
      project: p.name,
      customer: p.customer,
      code: m.code,
      description: m.description,
      percent: m.percent,
      amount: m.amount,
      currency: m.currency,
      date: m.estimatedDate,
      status: m.status,
    }))
  )
);

const projectOpts = computed(() => projectOptions());

const dialog = ref(false);
const submitted = ref(false);
const estDate = ref<Date | null>(null);
const editTarget = ref<Milestone | null>(null);
interface Form { projectId: string; code: string; percent: number; description: string; status: MilestoneStatus; }
const empty = (): Form => ({ projectId: "", code: "", percent: 0, description: "", status: "bekliyor" });
const form = reactive<Form>(empty());

const selProject = computed(() => financeProjects.find((p) => p.id === form.projectId));
const computedAmount = computed(() =>
  selProject.value ? milestoneAmount(selProject.value.contractValue, form.percent || 0) : 0
);

function onCode() {
  const opt = MILESTONE_OPTIONS.find((o) => o.code === form.code);
  if (opt && !form.percent) form.percent = opt.defaultPercent;
}
function openNew() {
  Object.assign(form, empty());
  estDate.value = null;
  editTarget.value = null;
  submitted.value = false;
  dialog.value = true;
}
function openEdit(row: { pid: string; m: Milestone }) {
  Object.assign(form, {
    projectId: row.pid,
    code: row.m.code,
    percent: row.m.percent,
    description: row.m.description,
    status: row.m.status,
  });
  estDate.value = row.m.estimatedDate ? new Date(row.m.estimatedDate) : null;
  editTarget.value = row.m;
  submitted.value = false;
  dialog.value = true;
}
function save() {
  submitted.value = true;
  if (!form.projectId || !form.code || !form.percent || !estDate.value) return;
  const p = financeProjects.find((x) => x.id === form.projectId);
  if (!p) return;
  const amount = milestoneAmount(p.contractValue, form.percent);
  if (editTarget.value) {
    Object.assign(editTarget.value, {
      code: form.code,
      description: form.description,
      percent: form.percent,
      amount,
      estimatedDate: estDate.value.toISOString(),
      status: form.status,
    });
    toast.add({ severity: "success", summary: "Güncellendi", detail: `${p.name} · ${form.code}`, life: 2200 });
  } else {
    p.milestones.push({
      code: form.code,
      description: form.description,
      percent: form.percent,
      amount,
      currency: p.currency,
      estimatedDate: estDate.value.toISOString(),
      status: form.status,
    });
    toast.add({ severity: "success", summary: "Alacak eklendi", detail: `${p.name} · ${form.code}`, life: 2200 });
  }
  dialog.value = false;
}
function del(row: { pid: string; m: Milestone }) {
  const p = financeProjects.find((x) => x.id === row.pid);
  if (!p) return;
  const i = p.milestones.indexOf(row.m);
  if (i >= 0) p.milestones.splice(i, 1);
}
</script>

<style scoped>
@import "@/views/finance/tables/ftable.css";
.fh-r { display: flex; align-items: center; gap: 10px; }
.sub { color: #94a3b8; }
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }
.contract-info { font-size: 13px; color: #475569; background: #f6fbfe; border: 1px solid #dbeefb; border-radius: 10px; padding: 9px 12px; display: flex; align-items: center; gap: 8px; }
.contract-info i { color: #1488c8; }
.contract-info b { color: #0f172a; }
.amount-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-weight: 800; color: #1488c8; font-variant-numeric: tabular-nums; }
</style>
