<template>
  <div class="page">
    <div class="fin-head">
      <div>
        <h2>Finans</h2>
        <p>Proje gelir/gider takibi ve nakit akışı — <b>örnek veri</b></p>
      </div>
      <Tag value="DUMMY DATA" severity="warn" />
    </div>

    <Tabs :value="tab" @update:value="(v) => (tab = String(v))">
      <TabList>
        <Tab value="overview"><i class="pi pi-chart-bar" /> Genel Bakış</Tab>
        <Tab value="projects"><i class="pi pi-folder" /> Proje Finansı</Tab>
        <Tab value="obligations"><i class="pi pi-building-columns" /> Yükümlülükler</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="overview"><FinanceOverview /></TabPanel>
        <TabPanel value="projects"><ProjectFinance /></TabPanel>
        <TabPanel value="obligations"><Obligations /></TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Tag from "primevue/tag";
import FinanceOverview from "@/views/finance/FinanceOverview.vue";
import ProjectFinance from "@/views/finance/ProjectFinance.vue";
import Obligations from "@/views/finance/Obligations.vue";

const tab = ref("overview");
</script>

<style scoped>
.fin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 0 4px; }
.fin-head h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
.fin-head p { margin: 3px 0 0; font-size: 13.5px; color: #64748b; }
:deep(.p-tabpanels) { background: transparent; padding: 18px 0 0; }
:deep(.p-tab) { display: flex; align-items: center; gap: 7px; }
</style>
