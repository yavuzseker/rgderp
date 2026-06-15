<template>
  <router-view />
  <Toast position="top-right" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
</script>
