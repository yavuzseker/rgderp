<template>
  <div class="page">
    <div class="fin-head">
      <div>
        <h2>Finans</h2>
        <p>Proje gelir/gider takibi ve nakit akışı — <b>örnek veri</b></p>
      </div>
      <Tag value="DUMMY DATA" severity="warn" />
    </div>

    <nav class="subnav">
      <router-link v-for="s in sections" :key="s.to" :to="s.to" class="sub-pill" active-class="active" :exact-active-class="s.exact ? 'active' : ''">
        <i :class="['pi', s.icon]" /> {{ s.label }}
      </router-link>
    </nav>

    <div class="sub-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in"><component :is="Component" /></transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";

const sections = [
  { to: "/finance", label: "Genel Bakış", icon: "pi-chart-bar", exact: true },
  { to: "/finance/projeler", label: "Proje Finansı", icon: "pi-folder" },
  { to: "/finance/gelirler", label: "Gelirler", icon: "pi-arrow-down-left" },
  { to: "/finance/giderler", label: "Proje Giderleri", icon: "pi-arrow-up-right" },
  { to: "/finance/sabit", label: "Sabit Giderler", icon: "pi-refresh" },
  { to: "/finance/krediler", label: "Krediler", icon: "pi-percentage" },
  { to: "/finance/cekler", label: "Çekler", icon: "pi-money-bill" },
];
</script>

<style scoped>
.fin-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding: 0 4px; }
.fin-head h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
.fin-head p { margin: 3px 0 0; font-size: 13.5px; color: #64748b; }

.subnav { display: flex; gap: 8px; overflow-x: auto; padding: 0 2px 14px; border-bottom: 1px solid #e2e8f0; margin-bottom: 18px; }
.sub-pill {
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
  padding: 9px 15px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #64748b;
  transition: all 0.14s ease;
}
.sub-pill i { font-size: 14px; }
.sub-pill:hover { background: #f1f5f9; color: #334155; }
.sub-pill.active { background: #1488c8; color: #fff; }
</style>
