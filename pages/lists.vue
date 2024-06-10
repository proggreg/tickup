<script setup lang="ts">
definePageMeta({
  layout: 'mobile',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})
</script>
<template>
  <v-list>
    <AppNavItems />
  </v-list>  
</template>