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
  <v-row>
    <v-col cols="12">
      <SearchBar />
    </v-col>
    <v-col cols="12">
      <SearchResults /> 
    </v-col>
  </v-row>
</template>