<script setup lang="ts">
const { result, search } = useAlgoliaSearch('todos')

onMounted(async () => {
  await search({ query: 'Samsung' })
})
</script>
<template>
  <v-text-field
    hide-details
    density="compact"
    rounded="lg"
    variant="solo-filled"
    placeholder="search"
    style="max-width: 300px"
  >
    <template #append-inner>
      <span style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
    </template>
  </v-text-field>
  <div>{{ result }}</div>
</template>
