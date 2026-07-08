<template>
  <div class="shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed }">
      <div class="brand">
        <div class="brand-logo"><img src="/logo-mark.svg" alt="RGD" /></div>
        <div v-if="!collapsed" class="brand-text">
          <span class="brand-name">RGD-ERP</span>
          <span class="brand-sub">Üretim Takip</span>
        </div>
      </div>

      <nav class="nav">
        <template v-for="item in nav" :key="item.label">
          <!-- Alt menüsü olmayan normal öğe -->
          <router-link
            v-if="!item.sections"
            :to="item.to!"
            class="nav-item"
            :class="{ active: isActive(item.to!) }"
            v-tooltip.right="collapsed ? item.label : undefined"
          >
            <i :class="['pi', item.icon]" />
            <span v-if="!collapsed">{{ item.label }}</span>
          </router-link>

          <!-- Açılır grup (Finans) — bölümlü -->
          <template v-else>
            <button
              class="nav-item nav-group"
              :class="{ active: groupActive(item) }"
              @click="toggle(item.label)"
              v-tooltip.right="collapsed ? item.label : undefined"
            >
              <i :class="['pi', item.icon]" />
              <span v-if="!collapsed">{{ item.label }}</span>
              <i v-if="!collapsed" class="pi pi-chevron-down chev" :class="{ open: isOpen(item.label) }" />
            </button>
            <div v-if="!collapsed && isOpen(item.label)" class="subnav">
              <template v-for="sec in item.sections" :key="sec.label">
                <div class="subnav-label">{{ sec.label }}</div>
                <router-link
                  v-for="c in sec.items"
                  :key="c.to"
                  :to="c.to"
                  class="nav-sub"
                  :class="{ active: subActive(c) }"
                >
                  <i :class="['pi', c.icon]" />
                  <span>{{ c.label }}</span>
                </router-link>
              </template>
            </div>
          </template>
        </template>
      </nav>
    </aside>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <Button
          text
          rounded
          :icon="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
          @click="collapsed = !collapsed"
          aria-label="Menü"
        />
        <div class="crumbs">
          <h1>{{ title }}</h1>
        </div>
        <div class="spacer" />
        <Avatar label="A" shape="circle" class="user-avatar" />
      </header>

      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import Avatar from "primevue/avatar";

const route = useRoute();
const collapsed = ref(false);

interface SubItem { to: string; label: string; icon: string; exact?: boolean }
interface NavSection { label: string; items: SubItem[] }
interface NavItem { to?: string; label: string; icon: string; sections?: NavSection[] }

const nav: NavItem[] = [
  { to: "/", label: "Genel Bakış", icon: "pi-th-large" },
  { to: "/orders", label: "Siparişler", icon: "pi-clipboard" },
  { to: "/projects", label: "Projeler", icon: "pi-sitemap" },
  {
    label: "Finans",
    icon: "pi-wallet",
    sections: [
      { label: "Özet", items: [
        { to: "/finance", label: "Genel Bakış", icon: "pi-chart-bar", exact: true },
        { to: "/finance/projeler", label: "Proje Finansı", icon: "pi-folder" },
      ] },
      { label: "Gelir", items: [
        { to: "/finance/gelirler", label: "Gelirler", icon: "pi-arrow-down-left" },
      ] },
      { label: "Proje Gideri", items: [
        { to: "/finance/giderler", label: "Proje Giderleri", icon: "pi-arrow-up-right" },
      ] },
      { label: "Şirket Yükümlülükleri", items: [
        { to: "/finance/sabit", label: "Sabit Giderler", icon: "pi-refresh" },
        { to: "/finance/krediler", label: "Krediler", icon: "pi-percentage" },
        { to: "/finance/cekler", label: "Çekler", icon: "pi-money-bill" },
      ] },
    ],
  },
  { to: "/products", label: "Ürünler", icon: "pi-box" },
  { to: "/suppliers", label: "Tedarikçiler", icon: "pi-truck" },
  { to: "/customers", label: "Müşteriler", icon: "pi-users" },
];

const title = computed(() => (route.meta.title as string) ?? "RGD-ERP");

// Açık gruplar — Finans, ilgili sayfadaysak otomatik açık.
const openGroups = ref<Record<string, boolean>>({ Finans: route.path.startsWith("/finance") });
const isOpen = (label: string) => !!openGroups.value[label];
const toggle = (label: string) => (openGroups.value[label] = !openGroups.value[label]);

function isActive(to: string) {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
}
function subActive(c: SubItem) {
  return c.exact ? route.path === c.to : route.path.startsWith(c.to);
}
function groupActive(item: NavItem) {
  return (item.sections ?? []).some((s) => s.items.some((c) => route.path.startsWith(c.to)));
}
</script>

<style scoped>
.shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: #0c2840;
  background: linear-gradient(180deg, #115c88 0%, #0c2840 100%);
  color: #cfe8f8;
  display: flex;
  flex-direction: column;
  padding: 18px 14px;
  transition: width 0.2s ease;
}
.sidebar.collapsed {
  width: 76px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 18px;
}
.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}
.brand-logo img {
  width: 28px;
  height: 28px;
  display: block;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.brand-name {
  font-weight: 800;
  font-size: 17px;
  color: #fff;
  letter-spacing: 0.3px;
}
.brand-sub {
  font-size: 11.5px;
  color: #66b8e6;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  color: #a1d2f0;
  font-weight: 500;
  font-size: 14.5px;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}
.nav-item i {
  font-size: 17px;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}
.nav-item.active {
  background: rgba(47, 157, 219, 0.22);
  color: #fff;
  box-shadow: inset 3px 0 0 #66b8e6;
}

/* Açılır grup başlığı */
.nav-group {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
}
.nav-group .chev {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.18s ease;
}
.nav-group .chev.open {
  transform: rotate(180deg);
}

/* Alt menü bölüm başlığı */
.subnav-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #6f9fbf;
  padding: 10px 12px 4px;
}
.subnav-label:first-child { padding-top: 2px; }

/* Alt menü */
.subnav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 2px 0 4px 14px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}
.nav-sub {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  color: #a1d2f0;
  font-size: 13.5px;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}
.nav-sub i {
  font-size: 14px;
}
.nav-sub:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.nav-sub.active {
  background: rgba(47, 157, 219, 0.2);
  color: #fff;
}

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.topbar {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 22px;
  flex-shrink: 0;
}
.crumbs h1 {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}
.spacer {
  flex: 1;
}
.user-avatar {
  background: #1488c8;
  color: #fff;
  font-weight: 700;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 26px;
}
</style>
