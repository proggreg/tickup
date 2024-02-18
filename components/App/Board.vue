<script setup lang="ts">
const statuses = useSettingsStore().statuses
</script>
<template>
  <v-row class="fill-height">
    <v-col v-for="status in statuses" :key="status.name">
      <v-card class="fill-height" color="secondary">
        <v-card-title>
          {{ status.name }}
        </v-card-title>
        <div class="ma-2">
          
            <v-card>
          
          <v-card-title>Todo</v-card-title>
        </v-card>
          
        </div>
        
    </v-card>
    </v-col>
  </v-row>
</template>