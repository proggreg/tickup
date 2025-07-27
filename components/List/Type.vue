<script setup lang="ts">
  const store = useListsStore()
  const listTypeOptions = ref(['table', 'simple'])
  watch(() => store.currentList.listType, (newVal: ListType, oldVal: ListType) => {
    if (store.currentList) {
      store.currentList.listType = newVal

      if (oldVal && oldVal !== newVal) {
        store.updateList()
      }
    }
  })
</script>

<template>
  <v-select
    v-model="store.currentList.listType"
    :items="listTypeOptions"
    single-line
    max-width="150"
    variant="outlined"
    flat
    elevation="0"
  />
</template>

<style scoped>
  :deep(.v-field__input) {
    padding: 0.75em;
    min-height: 0;
    height: 100%;
    /* max-height: 48px; */
  }
</style>
