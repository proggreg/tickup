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
  <div>
    <v-list>
      <AppNavItems />
    </v-list>
    <ListNew :open="open" @close="open = false" />
    <v-fab
      size="large" color="primary" style="border-radius: 50% !important; position: fixed; bottom: 100px; z-index: 1000; right: 75px"
      icon="mdi-plus" variant="elevated"
      @click="open = true"
    />
  </div>
</template>
