<script setup lang="ts">
const { data } = useAuth()
</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-img :src="data?.user?.image" width="50" style="margin-right: 15px;"></v-img>
      <v-label>{{ data?.user?.name }}</v-label>
    </template>
    <v-list />
  </v-menu>
</template>
