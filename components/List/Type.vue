<script setup lang="ts">
const store = useListsStore()
const listTypeOptions = ref(['status', 'simple'])
watch(() => store.currentList.listType, (newVal, oldVal) => {
  console.log('listtype', { newVal, oldVal })
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
    label="List Type"
  />
</template>
