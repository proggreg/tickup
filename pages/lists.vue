<script setup lang="ts">
definePageMeta({
  layout: 'mobile',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})
const open = ref(false)
</script>
<template>
  <v-list>
    <AppNavItems />
  </v-list>  
  <ListNew :open="open" @close="open = false" />
  <v-fab @click="open = true" color="primary" style="position: fixed; bottom: 75px; z-index: 1000; right: 15px" icon="mdi-plus" variant="elevated"></v-fab>
</template>