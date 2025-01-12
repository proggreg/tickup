<script setup lang="ts">
const store = useListsStore()
const listType = ref(store.currentList.listType)
const listTypeOptions = ref(['status', 'simple'])
watch(listType, (newVal) => {
  if (store.currentList) {
    store.currentList.listType = newVal
  }
})

function updateListType() {
  if (store.currentList) {
    store.updateList()
  }
}
</script>

<template>
  <v-select
    v-model="listType"
    :items="listTypeOptions"
    label="List Type"
    @change="updateListType"
  />
</template>
