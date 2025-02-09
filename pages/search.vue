<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})

const searchStore = useSearchStore()

watch(() => searchStore.searchQuery, () => {
  searchStore.debouncedSearch()
})
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-text-field v-model="searchStore.searchQuery" autofocus class="mx-12" append-inner-icon="mdi-magnify" />
    </v-col>
    <v-col cols="12">
      <SearchResults />
    </v-col>
  </v-row>
</template>
