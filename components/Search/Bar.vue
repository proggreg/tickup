<script setup lang="ts">
const store = useSearchStore()
const { mdAndUp } = useDisplay()


if (import.meta.client) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      open.value = !open.value
      return false
    }
  })
}



</script>
<template>
  <v-text-field v-model="store.query"  placeholder="search" style="max-width: 1000px" class="mx-4">
      <template #append-inner>
        <span v-if="mdAndUp" style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
      </template>
  </v-text-field>
</template>