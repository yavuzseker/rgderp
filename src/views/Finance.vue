<template>
  <div class="page">
    <div class="fin-head">
      <div>
        <h2>{{ (route.meta.title as string)?.replace('Finans · ', '') || 'Finans' }}</h2>
        <p>Proje gelir/gider takibi ve nakit akışı — <b>örnek veri</b></p>
      </div>
      <Tag value="DUMMY DATA" severity="warn" />
    </div>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in"><component :is="Component" /></transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import Tag from "primevue/tag";

const route = useRoute();
</script>

<style scoped>
.fin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding: 0 4px; }
.fin-head h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
.fin-head p { margin: 3px 0 0; font-size: 13.5px; color: #64748b; }
</style>
