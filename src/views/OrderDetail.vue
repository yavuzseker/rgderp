<template>
  <div class="page" v-if="order">
    <div class="detail-top">
      <Button label="Siparişler" icon="pi pi-arrow-left" text class="back" @click="router.push('/orders')" />
      <Button label="Siparişi Sil" icon="pi pi-trash" text severity="danger" @click="confirmDelete" />
    </div>

    <!-- Özet kart -->
    <div class="summary">
      <div class="sum-left">
        <div class="sum-top">
          <Avatar icon="pi pi-clipboard" size="large" shape="circle" style="background: #1488c81a; color: #1488c8" />
          <div>
            <h2>{{ order.orderNo }}</h2>
            <p>{{ order.productName }} · {{ order.customerName }}</p>
          </div>
          <Tag :value="orderStatus[order.status].label" :severity="orderStatus[order.status].severity" class="sum-status" />
        </div>
        <div class="sum-meta">
          <div><span class="ml">Toplam Miktar</span><strong>{{ order.totalQty }} adet</strong></div>
          <div><span class="ml">Oluşturma</span><strong>{{ fmtDate(order.createdAt) }}</strong></div>
          <div><span class="ml">Termin</span><strong>{{ fmtDate(order.dueDate) }}</strong></div>
        </div>
      </div>
      <div class="sum-right">
        <Knob :modelValue="progress" :size="120" readonly valueTemplate="{value}%" :strokeWidth="9" />
        <span class="kn-label">tamamlandı</span>
      </div>
    </div>

    <!-- Aşama timeline -->
    <Card>
      <template #title><span class="ct">Üretim Aşamaları</span></template>
      <template #content>
        <Timeline :value="order.stages" class="tl">
          <template #marker="{ item }">
            <span class="tl-marker" :class="item.status">
              <i :class="markerIcon(item.status)" />
            </span>
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
                <span><b>{{ item.inQty }}</b> giren</span>
                <span class="sep">·</span>
                <span><b>{{ item.outQty }}</b> çıkan</span>
                <span class="sep">·</span>
                <span class="scrap"><b>{{ item.scrapQty }}</b> fire</span>
              </div>
              <Button v-if="item.status === 'active'" label="Aşamayı Tamamla & İlerlet"
                icon="pi pi-arrow-right" icon-pos="right" size="small" class="tl-advance" @click="openAdvance(item)" />
            </div>
          </template>
        </Timeline>
      </template>
    </Card>

    <!-- Sevkiyat evrakları -->
    <Card class="docs-card">
      <template #title>
        <div class="docs-title">
          <span class="ct">Sevkiyat Evrakları</span>
          <Button label="Evrak Yükle" icon="pi pi-upload" size="small" :loading="uploading" @click="fileInput?.click()" />
          <input ref="fileInput" type="file" multiple class="hidden-input"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" @change="onPick" />
        </div>
      </template>
      <template #content>
        <div v-if="!docs.length" class="docs-empty">
          <i class="pi pi-file" />
          <p>Henüz evrak yok. İrsaliye, fatura veya sevkiyat fotoğrafı yükleyin.</p>
        </div>
        <ul v-else class="doc-list">
          <li v-for="d in docs" :key="d.id" class="doc-row">
            <i :class="['doc-ic', 'pi', fileIcon(d.contentType)]" />
            <div class="doc-info">
              <a :href="d.url" target="_blank" rel="noopener" class="doc-name">{{ d.name }}</a>
              <span class="doc-meta">{{ fmtSize(d.size) }} · {{ fmtDate(d.uploadedAt) }}</span>
            </div>
            <a :href="d.url" target="_blank" rel="noopener" v-tooltip.top="'İndir / Aç'">
              <Button icon="pi pi-download" text rounded severity="secondary" />
            </a>
            <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteDoc(d)" v-tooltip.top="'Sil'" />
          </li>
        </ul>
      </template>
    </Card>

    <Dialog v-model:visible="advDialog" header="Aşamayı Tamamla" modal :style="{ width: '420px' }">
      <div class="form">
        <p class="adv-info">“{{ activeName }}” aşamasından çıkan ve fire miktarını girin. Çıkan miktar bir sonraki aşamanın girişi olacak.</p>
        <div class="two">
          <div class="field">
            <label>Çıkan Miktar</label>
            <InputNumber v-model="advOut" :min="0" fluid />
          </div>
          <div class="field">
            <label>Fire</label>
            <InputNumber v-model="advScrap" :min="0" fluid />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="İptal" text @click="advDialog = false" />
        <Button label="Tamamla" icon="pi pi-check" @click="doAdvance" />
      </template>
    </Dialog>
  </div>

  <div v-else class="notfound">
    <i class="pi pi-inbox" />
    <p>Sipariş bulunamadı.</p>
    <Button label="Siparişlere dön" text @click="router.push('/orders')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
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
import {
  getOrder,
  advanceStage,
  deleteOrder,
  supplierName,
  watchOrderDocs,
  uploadShipmentDoc,
  deleteShipmentDoc,
} from "@/data/store";
import { orderStatus, stageStatus, fmtDate, progressOf } from "@/utils";
import type { StageStatus, OrderStage, ShipmentDoc } from "@/types";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const order = computed(() => getOrder(route.params.id as string));
const progress = computed(() => (order.value ? progressOf(order.value.stages) : 0));

// ---- Sevkiyat evrakları ----
const docs = ref<ShipmentDoc[]>([]);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
let unsub: (() => void) | null = null;

watch(
  () => route.params.id as string,
  (id) => {
    unsub?.();
    docs.value = [];
    if (id) unsub = watchOrderDocs(id, (list) => (docs.value = list));
  },
  { immediate: true }
);
onUnmounted(() => unsub?.());

async function onPick(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  const id = route.params.id as string;
  if (!files.length || !id) return;
  uploading.value = true;
  try {
    for (const f of files) await uploadShipmentDoc(id, f);
    toast.add({ severity: "success", summary: "Evrak yüklendi", detail: `${files.length} dosya`, life: 2500 });
  } catch (err: any) {
    toast.add({ severity: "error", summary: "Yükleme başarısız", detail: err?.message ?? "Hata", life: 4000 });
  } finally {
    uploading.value = false;
    input.value = "";
  }
}
function confirmDeleteDoc(d: ShipmentDoc) {
  confirm.require({
    header: "Evrağı sil",
    message: `"${d.name}" silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil",
    rejectLabel: "Vazgeç",
    acceptProps: { severity: "danger" },
    accept: async () => {
      await deleteShipmentDoc(d);
      toast.add({ severity: "info", summary: "Evrak silindi", detail: d.name, life: 2500 });
    },
  });
}
function fileIcon(type: string) {
  if (type.includes("pdf")) return "pi-file-pdf";
  if (type.startsWith("image/")) return "pi-image";
  if (type.includes("sheet") || type.includes("excel")) return "pi-file-excel";
  if (type.includes("word") || type.includes("document")) return "pi-file-word";
  return "pi-file";
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const advDialog = ref(false);
const advOut = ref(0);
const advScrap = ref(0);
const activeName = ref("");

function markerIcon(s: StageStatus) {
  return s === "done" ? "pi pi-check" : s === "active" ? "pi pi-cog" : "pi pi-circle";
}
function openAdvance(stage: OrderStage) {
  activeName.value = stage.name;
  advOut.value = stage.inQty || order.value?.totalQty || 0;
  advScrap.value = 0;
  advDialog.value = true;
}
function doAdvance() {
  if (!order.value) return;
  advanceStage(order.value.id, advOut.value, advScrap.value);
  advDialog.value = false;
  toast.add({ severity: "success", summary: "Aşama ilerletildi", life: 2200 });
}
function confirmDelete() {
  if (!order.value) return;
  const o = order.value;
  confirm.require({
    header: "Silme onayı",
    message: `"${o.orderNo}" siparişi silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil",
    rejectLabel: "Vazgeç",
    acceptProps: { severity: "danger" },
    accept: () => {
      deleteOrder(o.id);
      toast.add({ severity: "info", summary: "Sipariş silindi", detail: o.orderNo, life: 2500 });
      router.push("/orders");
    },
  });
}
</script>

<style scoped>
@import "@/views/table.css";
.detail-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.back { align-self: flex-start; padding-left: 4px; }

.summary {
  display: flex; gap: 20px; justify-content: space-between;
  background: #fff; border: 1px solid #eef2f7; border-radius: 16px; padding: 22px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); margin-bottom: 18px;
}
.sum-top { display: flex; align-items: center; gap: 14px; }
.sum-top h2 { margin: 0; font-size: 21px; font-weight: 800; }
.sum-top p { margin: 3px 0 0; color: #64748b; font-size: 14px; }
.sum-status { margin-left: 6px; }
.sum-meta { display: flex; gap: 34px; margin-top: 20px; }
.sum-meta .ml { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 3px; }
.sum-meta strong { font-size: 15px; color: #0f172a; }
.sum-right { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.kn-label { font-size: 12px; color: #64748b; margin-top: 4px; }

.ct { font-size: 16px; font-weight: 700; }
.tl { padding-top: 6px; }
.tl-marker {
  width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  color: #fff; font-size: 14px;
}
.tl-marker.pending { background: #cbd5e1; }
.tl-marker.active { background: #f59e0b; box-shadow: 0 0 0 5px #f59e0b22; }
.tl-marker.done { background: #10b981; }

.tl-card {
  background: #f8fafc; border: 1px solid #eef2f7; border-radius: 12px;
  padding: 14px 16px; margin: 0 0 18px 6px;
}
.tl-card.active { background: #fffbeb; border-color: #fde68a; }
.tl-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.tl-name { font-weight: 700; color: #0f172a; display: block; }
.tl-sup { font-size: 12.5px; color: #64748b; display: inline-flex; align-items: center; gap: 5px; margin-top: 3px; }
.tl-qty { margin-top: 10px; font-size: 13px; color: #475569; }
.tl-qty b { color: #0f172a; }
.tl-qty .sep { margin: 0 8px; color: #cbd5e1; }
.tl-qty .scrap b { color: #ef4444; }
.tl-advance { margin-top: 12px; }

.docs-card { margin-top: 18px; }
.docs-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.hidden-input { display: none; }
.docs-empty { text-align: center; color: #94a3b8; padding: 28px 0; }
.docs-empty i { font-size: 30px; }
.docs-empty p { margin: 10px 0 0; font-size: 13px; }
.doc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.doc-row {
  display: flex; align-items: center; gap: 12px;
  background: #f8fafc; border: 1px solid #eef2f7; border-radius: 10px; padding: 10px 12px;
}
.doc-ic { font-size: 20px; color: #1488c8; flex-shrink: 0; }
.doc-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.doc-name { font-weight: 600; color: #0f172a; text-decoration: none; word-break: break-all; }
.doc-name:hover { text-decoration: underline; color: #1488c8; }
.doc-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.adv-info { color: #64748b; font-size: 13px; margin: 0 0 4px; line-height: 1.5; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.notfound { text-align: center; color: #94a3b8; padding: 80px 0; }
.notfound i { font-size: 46px; }
.notfound p { margin: 14px 0; }
</style>
