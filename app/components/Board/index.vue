<script setup lang="ts">
const statusStore = useSettingsStore();
</script>

<template>
  <div class="overflow-x-auto overflow-y-hidden pa-1 pb-6" style="height: calc(100vh - 180px)">
    <v-row no-gutters class="flex-nowrap align-start" style="min-width: max-content; height: 100%">
      <v-col v-for="status in statusStore.statuses" :key="status.name" class="pr-6" min-width="300">
        <BoardColumn :status="status" />
      </v-col>
    </v-row>
  </div>
</template>
