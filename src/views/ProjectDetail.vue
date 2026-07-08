<template>
  <div class="page" v-if="project">
    <div class="detail-top">
      <Button label="Projeler" icon="pi pi-arrow-left" text class="back" @click="router.push('/projects')" />
      <Button label="Projeyi Sil" icon="pi pi-trash" text severity="danger" @click="confirmDelete" />
    </div>

    <!-- Özet -->
    <div class="summary">
      <div class="sum-left">
        <div class="sum-top">
          <Avatar icon="pi pi-sitemap" size="large" shape="circle" style="background: #1488c81a; color: #1488c8" />
          <div>
            <h2>{{ project.name }}</h2>
            <p>{{ project.productName }} · {{ project.qty }} adet</p>
          </div>
          <Tag :value="orderStatus[project.status].label" :severity="orderStatus[project.status].severity" class="sum-status" />
        </div>
        <div class="sum-meta">
          <div><span class="ml">Sipariş</span><strong>{{ project.orderNo }}</strong></div>
          <div><span class="ml">Müşteri</span><strong>{{ project.customerName }}</strong></div>
          <div><span class="ml">Oluşturma</span><strong>{{ fmtDate(project.createdAt) }}</strong></div>
        </div>
        <div v-if="order" class="pay-note" :class="{ ok: payComplete }">
          <i :class="payComplete ? 'pi pi-check-circle' : 'pi pi-clock'" />
          Ödemeler: {{ fmtMoney(collected, order.currency || 'EUR') }} / {{ fmtMoney(order.contractValue || 0, order.currency || 'EUR') }}
          <b>{{ payComplete ? '· Tamamlandı' : '· Devam ediyor' }}</b>
        </div>
      </div>
      <div class="sum-right">
        <Knob :modelValue="progress" :size="120" readonly valueTemplate="{value}%" :strokeWidth="9" />
        <span class="kn-label">tamamlandı</span>
      </div>
    </div>

    <!-- Aşamalar -->
    <Card>
      <template #title><span class="ct">Üretim Aşamaları</span></template>
      <template #content>
        <Timeline :value="project.stages" class="tl">
          <template #marker="{ item }">
            <span class="tl-marker" :class="item.status"><i :class="markerIcon(item.status)" /></span>
          </template>
          <template #content="{ item, index }">
            <div class="tl-card" :class="{ active: item.status === 'active' }">
              <div class="tl-head">
                <div>
                  <span class="tl-name">{{ index + 1 }}. {{ item.name }}</span>
                  <span class="tl-sup"><i class="pi pi-truck" /> {{ supplierName(item.supplierId) }}</span>
                </div>
                <Tag :value="stageStatus[item.status].label" :severity="stageStatus[item.status].severity" />
              </div>
              <div class="tl-qty">
                <span><b>{{ item.inQty }}</b> giren</span><span class="sep">·</span>
                <span><b>{{ item.outQty }}</b> çıkan</span><span class="sep">·</span>
                <span class="scrap"><b>{{ item.scrapQty }}</b> fire</span>
              </div>
              <Button v-if="item.status === 'active'" label="Aşamayı Tamamla & İlerlet"
                icon="pi pi-arrow-right" icon-pos="right" size="small" class="tl-advance" @click="openAdvance(item)" />
            </div>
          </template>
        </Timeline>
      </template>
    </Card>

    <Dialog v-model:visible="advDialog" header="Aşamayı Tamamla" modal :style="{ width: '420px' }">
      <div class="form">
        <p class="adv-info">“{{ activeName }}” aşamasından çıkan ve fire miktarını girin. Çıkan miktar bir sonraki aşamanın girişi olacak.</p>
        <div class="two">
          <div class="field"><label>Çıkan Miktar</label><InputNumber v-model="advOut" :min="0" fluid /></div>
          <div class="field"><label>Fire</label><InputNumber v-model="advScrap" :min="0" fluid /></div>
        </div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="advDialog = false" />
        <Button label="Tamamla" icon="pi pi-check" @click="doAdvance" />
      </template>
    </Dialog>
  </div>

  <div v-else class="notfound">
    <i class="pi pi-inbox" /><p>Proje bulunamadı.</p>
    <Button label="Projelere dön" text @click="router.push('/projects')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Card from "primevue/card";
import Timeline from "primevue/timeline";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Avatar from "primevue/avatar";
import Knob from "primevue/knob";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import { db, getProject, advanceProjectStage, deleteProject, supplierName } from "@/data/store";
import { orderStatus, stageStatus, fmtDate, progressOf } from "@/utils";
import { fmtMoney } from "@/finance/types";
import type { StageStatus, OrderStage } from "@/types";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const project = computed(() => getProject(route.params.id as string));
const progress = computed(() => (project.value ? progressOf(project.value.stages) : 0));
const order = computed(() => db.orders.find((o) => o.id === project.value?.orderId));
const collected = computed(() => {
  const o = order.value;
  if (!o) return 0;
  return (o.paymentTerms ?? [])
    .filter((t) => t.status === "tahsil")
    .reduce((s, t) => s + Math.round(((o.contractValue ?? 0) * t.percent) / 100), 0);
});
const payComplete = computed(() => {
  const o = order.value;
  return !!o && (o.contractValue ?? 0) > 0 && collected.value >= (o.contractValue ?? 0);
});

const advDialog = ref(false);
const advOut = ref(0);
const advScrap = ref(0);
const activeName = ref("");

const markerIcon = (s: StageStatus) => (s === "done" ? "pi pi-check" : s === "active" ? "pi pi-cog" : "pi pi-circle");
function openAdvance(stage: OrderStage) {
  activeName.value = stage.name;
  advOut.value = stage.inQty || project.value?.qty || 0;
  advScrap.value = 0;
  advDialog.value = true;
}
function doAdvance() {
  if (!project.value) return;
  advanceProjectStage(project.value.id, advOut.value, advScrap.value);
  advDialog.value = false;
  toast.add({ severity: "success", summary: "Aşama ilerletildi", life: 2200 });
}
function confirmDelete() {
  if (!project.value) return;
  const p = project.value;
  confirm.require({
    header: "Silme onayı",
    message: `"${p.name}" projesi silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil",
    rejectLabel: "Vazgeç",
    acceptProps: { severity: "danger" },
    accept: () => {
      deleteProject(p.id);
      toast.add({ severity: "info", summary: "Proje silindi", detail: p.name, life: 2500 });
      router.push("/projects");
    },
  });
}
</script>

<style scoped>
@import "@/views/table.css";
.detail-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.back { align-self: flex-start; padding-left: 4px; }

.summary { display: flex; gap: 20px; justify-content: space-between; background: #fff; border: 1px solid #eef2f7; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); margin-bottom: 18px; }
.sum-top { display: flex; align-items: center; gap: 14px; }
.sum-top h2 { margin: 0; font-size: 21px; font-weight: 800; }
.sum-top p { margin: 3px 0 0; color: #64748b; font-size: 14px; }
.sum-status { margin-left: 6px; }
.sum-meta { display: flex; gap: 34px; margin-top: 20px; }
.sum-meta .ml { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 3px; }
.sum-meta strong { font-size: 15px; color: #0f172a; }
.pay-note { margin-top: 16px; font-size: 13px; color: #b45309; background: #fef3e2; border-radius: 10px; padding: 8px 12px; display: inline-flex; align-items: center; gap: 8px; }
.pay-note.ok { color: #047857; background: #e7f7ef; }
.sum-right { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.kn-label { font-size: 12px; color: #64748b; margin-top: 4px; }

.ct { font-size: 16px; font-weight: 700; }
.tl { padding-top: 6px; }
.tl-marker { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 14px; }
.tl-marker.pending { background: #cbd5e1; }
.tl-marker.active { background: #f59e0b; box-shadow: 0 0 0 5px #f59e0b22; }
.tl-marker.done { background: #10b981; }
.tl-card { background: #f8fafc; border: 1px solid #eef2f7; border-radius: 12px; padding: 14px 16px; margin: 0 0 18px 6px; }
.tl-card.active { background: #fffbeb; border-color: #fde68a; }
.tl-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.tl-name { font-weight: 700; color: #0f172a; display: block; }
.tl-sup { font-size: 12.5px; color: #64748b; display: inline-flex; align-items: center; gap: 5px; margin-top: 3px; }
.tl-qty { margin-top: 10px; font-size: 13px; color: #475569; }
.tl-qty b { color: #0f172a; }
.tl-qty .sep { margin: 0 8px; color: #cbd5e1; }
.tl-qty .scrap b { color: #ef4444; }
.tl-advance { margin-top: 12px; }
.adv-info { color: #64748b; font-size: 13px; margin: 0 0 4px; line-height: 1.5; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.notfound { text-align: center; color: #94a3b8; padding: 80px 0; }
.notfound i { font-size: 46px; }
.notfound p { margin: 14px 0; }
</style>
