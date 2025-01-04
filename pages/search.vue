<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})

const store = useSearchStore()

onMounted(async () => {
  // store.search()
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
