<template>
  <div class="strip">
    <div v-for="(s, i) in items" :key="i" class="chip" :class="s.tone">
      <span v-if="s.icon" class="ic"><i :class="['pi', s.icon]" /></span>
      <div class="txt">
        <span class="lbl">{{ s.label }}</span>
        <b class="val">{{ s.value }}</b>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
}
defineProps<{ items: StatItem[] }>();
</script>

<style scoped>
.strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 4px 14px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 150px;
  flex: 1 1 0;
}
.ic {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 15px;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
}
.chip.blue .ic { background: #e8f4fb; color: #1488c8; }
.chip.green .ic { background: #e7f7ef; color: #10b981; }
.chip.amber .ic { background: #fef3e2; color: #f59e0b; }
.chip.red .ic { background: #fdeaea; color: #ef4444; }
.chip.slate .ic { background: #f1f5f9; color: #475569; }
.txt { display: flex; flex-direction: column; min-width: 0; }
.lbl { font-size: 11.5px; color: #94a3b8; }
.val { font-size: 17px; font-weight: 800; color: #0f172a; font-variant-numeric: tabular-nums; }
</style>
