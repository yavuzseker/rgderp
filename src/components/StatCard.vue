<template>
  <div class="stat lift">
    <div class="stat-icon" :style="{ background: tint, color: color }">
      <i :class="['pi', icon]" />
    </div>
    <div class="stat-body">
      <span class="stat-value">{{ value }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string | number;
  icon: string;
  color: string;
}>();

const tint = props.color + "1a";
</script>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  font-size: 22px;
  flex-shrink: 0;
}
.stat-body {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}
.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}
</style>
