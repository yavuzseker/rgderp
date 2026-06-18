<template>
  <div class="shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed }">
      <div class="brand">
        <div class="brand-logo"><i class="pi pi-bolt" /></div>
        <div v-if="!collapsed" class="brand-text">
          <span class="brand-name">RGD-ERP</span>
          <span class="brand-sub">Üretim Takip</span>
        </div>
      </div>

      <nav class="nav">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          v-tooltip.right="collapsed ? item.label : undefined"
        >
          <i :class="['pi', item.icon]" />
          <span v-if="!collapsed">{{ item.label }}</span>
        </router-link>
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

const nav = [
  { to: "/", label: "Genel Bakış", icon: "pi-th-large" },
  { to: "/orders", label: "Siparişler", icon: "pi-clipboard" },
  { to: "/products", label: "Ürünler", icon: "pi-box" },
  { to: "/suppliers", label: "Tedarikçiler", icon: "pi-truck" },
  { to: "/customers", label: "Müşteriler", icon: "pi-users" },
];

const title = computed(() => (route.meta.title as string) ?? "RGD-ERP");

function isActive(to: string) {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
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
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
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
