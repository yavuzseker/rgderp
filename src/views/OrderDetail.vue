<template>
  <div class="page" v-if="order">
    <div class="detail-top">
      <Button label="Siparişler" icon="pi pi-arrow-left" text class="back" @click="router.push('/orders')" />
      <Button label="Siparişi Sil" icon="pi pi-trash" text severity="danger" @click="confirmDelete" />
    </div>

    <!-- Özet -->
    <div class="summary">
      <div class="sum-left">
        <div class="sum-top">
          <Avatar icon="pi pi-clipboard" size="large" shape="circle" style="background: #1488c81a; color: #1488c8" />
          <div>
            <h2>{{ order.orderNo }}</h2>
            <p>{{ order.customerName }}</p>
          </div>
          <Tag :value="orderStatus[order.status].label" :severity="orderStatus[order.status].severity" class="sum-status" />
        </div>
        <div class="sum-meta">
          <div><span class="ml">Bedel</span><strong>{{ fmtMoney(order.contractValue || 0, order.currency || 'EUR') }}</strong></div>
          <div><span class="ml">Tahsil Edilen</span><strong>{{ fmtMoney(collected, order.currency || 'EUR') }}</strong></div>
          <div><span class="ml">Alınma</span><strong>{{ order.orderDate ? fmtDate(order.orderDate) : fmtDate(order.createdAt) }}</strong></div>
        </div>
        <div class="pay-note" :class="{ ok: payComplete }">
          <i :class="payComplete ? 'pi pi-check-circle' : 'pi pi-clock'" />
          Ödemeler <b>{{ payComplete ? 'tamamlandı' : 'devam ediyor' }}</b>
        </div>
      </div>
      <div class="sum-right">
        <Knob :modelValue="payPct" :size="120" readonly valueTemplate="{value}%" :strokeWidth="9" />
        <span class="kn-label">tahsilat</span>
      </div>
    </div>

    <!-- Ödeme koşulları -->
    <Card>
      <template #title><span class="ct">Ödeme Koşulları</span></template>
      <template #content>
        <table class="pt-table">
          <thead><tr><th>Kod</th><th class="r">%</th><th class="r">Tutar</th><th>Tahmini Vade</th><th>Durum</th></tr></thead>
          <tbody>
            <tr v-for="(t, i) in sortedTerms" :key="i">
              <td><span class="code">{{ t.code }}</span></td>
              <td class="r">%{{ t.percent }}</td>
              <td class="r mono">{{ fmtMoney(amountOf(t), order.currency || 'EUR') }}</td>
              <td>{{ fmtDate(t.dueDate) }} <small v-if="t.status !== 'tahsil'" class="wl" :class="{ over: weeksLeft(t.dueDate).overdue }">· {{ weeksLeft(t.dueDate).text }}</small></td>
              <td><Tag :value="MILESTONE_STATUS[t.status].label" :severity="MILESTONE_STATUS[t.status].severity" /></td>
            </tr>
            <tr v-if="!(order.paymentTerms || []).length"><td colspan="5" class="empty">Ödeme koşulu yok. Siparişi düzenleyerek ekleyin.</td></tr>
          </tbody>
        </table>
        <p class="hint">Ödeme durumlarını Finans → Proje Gelirleri'nden güncelleyebilirsin.</p>
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
          <i class="pi pi-file" /><p>Henüz evrak yok. İrsaliye, fatura veya sevkiyat fotoğrafı yükleyin.</p>
        </div>
        <ul v-else class="doc-list">
          <li v-for="d in docs" :key="d.id" class="doc-row">
            <i :class="['doc-ic', 'pi', fileIcon(d.contentType)]" />
            <div class="doc-info">
              <a :href="d.url" target="_blank" rel="noopener" class="doc-name">{{ d.name }}</a>
              <span class="doc-meta">{{ fmtSize(d.size) }} · {{ fmtDate(d.uploadedAt) }}</span>
            </div>
            <a :href="d.url" target="_blank" rel="noopener" v-tooltip.top="'İndir / Aç'"><Button icon="pi pi-download" text rounded severity="secondary" /></a>
            <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteDoc(d)" v-tooltip.top="'Sil'" />
          </li>
        </ul>
      </template>
    </Card>
  </div>

  <div v-else class="notfound">
    <i class="pi pi-inbox" /><p>Sipariş bulunamadı.</p>
    <Button label="Siparişlere dön" text @click="router.push('/orders')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Avatar from "primevue/avatar";
import Knob from "primevue/knob";
import { getOrder, deleteOrder, watchOrderDocs, uploadShipmentDoc, deleteShipmentDoc } from "@/data/store";
import { orderStatus, fmtDate } from "@/utils";
import { fmtMoney, weeksLeft, MILESTONE_STATUS } from "@/finance/types";
import type { ShipmentDoc, PaymentTerm } from "@/types";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const order = computed(() => getOrder(route.params.id as string));

const amountOf = (t: PaymentTerm) => Math.round(((order.value?.contractValue ?? 0) * t.percent) / 100);
const sortedTerms = computed(() => [...(order.value?.paymentTerms ?? [])].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)));
const collected = computed(() =>
  (order.value?.paymentTerms ?? []).filter((t) => t.status === "tahsil").reduce((s, t) => s + amountOf(t), 0)
);
const payPct = computed(() => {
  const bedel = order.value?.contractValue ?? 0;
  return bedel ? Math.round((collected.value / bedel) * 100) : 0;
});
const payComplete = computed(() => (order.value?.contractValue ?? 0) > 0 && payPct.value >= 100);

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
    acceptLabel: "Sil", rejectLabel: "Vazgeç", acceptProps: { severity: "danger" },
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

function confirmDelete() {
  if (!order.value) return;
  const o = order.value;
  confirm.require({
    header: "Silme onayı",
    message: `"${o.orderNo}" siparişi silinsin mi?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sil", rejectLabel: "Vazgeç", acceptProps: { severity: "danger" },
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
.pt-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.pt-table th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; padding: 6px 10px; border-bottom: 1px solid #eef2f7; }
.pt-table td { padding: 10px; border-bottom: 1px solid #f4f7fa; color: #334155; }
.pt-table tbody tr:last-child td { border-bottom: none; }
.pt-table .r { text-align: right; }
.pt-table .mono { font-variant-numeric: tabular-nums; }
.code { font-size: 11px; font-weight: 800; color: #1488c8; background: #e8f4fb; padding: 3px 7px; border-radius: 6px; }
.wl { color: #94a3b8; font-weight: 600; }
.wl.over { color: #ef4444; }
.empty { text-align: center; color: #94a3b8; padding: 16px; }
.hint { font-size: 12px; color: #94a3b8; margin: 10px 0 0; }

.docs-card { margin-top: 18px; }
.docs-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.hidden-input { display: none; }
.docs-empty { text-align: center; color: #94a3b8; padding: 28px 0; }
.docs-empty i { font-size: 30px; }
.docs-empty p { margin: 10px 0 0; font-size: 13px; }
.doc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.doc-row { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #eef2f7; border-radius: 10px; padding: 10px 12px; }
.doc-ic { font-size: 20px; color: #1488c8; flex-shrink: 0; }
.doc-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.doc-name { font-weight: 600; color: #0f172a; text-decoration: none; word-break: break-all; }
.doc-name:hover { text-decoration: underline; color: #1488c8; }
.doc-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.notfound { text-align: center; color: #94a3b8; padding: 80px 0; }
.notfound i { font-size: 46px; }
.notfound p { margin: 14px 0; }
</style>
