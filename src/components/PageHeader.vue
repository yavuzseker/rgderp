<template>
  <div class="page-header">
    <div class="ph-text">
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="ph-actions">
      <IconField iconPosition="left" class="ph-search">
        <InputIcon class="pi pi-search" />
        <InputText
          :modelValue="search"
          @update:modelValue="$emit('update:search', $event as string)"
          :placeholder="searchPlaceholder"
        />
      </IconField>
      <Button :label="addLabel" icon="pi pi-plus" @click="$emit('add')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

defineProps<{
  title: string;
  subtitle?: string;
  addLabel: string;
  search: string | null;
  searchPlaceholder?: string;
}>();
defineEmits<{ add: []; "update:search": [value: string] }>();
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 4px 4px 16px;
}
.ph-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}
.ph-text p {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: #64748b;
}
.ph-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ph-search :deep(input) {
  width: 240px;
}
@media (max-width: 640px) {
  .ph-search :deep(input) { width: 150px; }
}
</style>
