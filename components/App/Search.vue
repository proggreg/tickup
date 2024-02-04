<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
const query = ref<string>('')
const results = ref([{name: 'test'}])
const open = ref(false)

if (process.client) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      open.value = !open.value
      return false
    }
    
  })
}

function search() {
  console.log('searching...', query.value)
  $fetch('/api/search/todo', {query: {q: query.value}})
    .then((res) => {
      console.log(res)
      results.value = res
    })
    .catch((err) => {
      results.value = err
    })
}
const debouncedSearch = useDebounceFn(search, 500)

</script>
<template>
  <v-dialog
    open-on-click
    :model-value="open"
    width="500"
  >
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
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
    </template>

    <template #default="{isActive}">
      <v-card
        v-if="isActive"
      >
        <v-layout class="justify-center py-4">
          <v-text-field
            v-model="query"
            hide-details
            density="compact"
            rounded="lg"
            variant="solo-filled"
            placeholder="search"
            style="max-width: 300px"
            :focused="isActive.value"
            @keyup="debouncedSearch"
          >
            <template #append-inner>
              <span style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
            </template>
          </v-text-field>
        </v-layout>

        <v-list>
          <v-list-item
            v-for="(result, index) in results"
            :key="index"
          >
            <v-list-item-title class="font-weight-bold">
              {{ result.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ result.status }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </template>
  </v-dialog>
</template>
