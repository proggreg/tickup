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
  <div style="width: 100%; height: 100%;">
    <AppNavItems />
    <ListNew />
  </div>
</template>
