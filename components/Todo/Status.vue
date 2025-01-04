<script setup lang="ts">
const listStore = useListsStore()
const { statuses } = useSettingsStore()
const index = ref(0)
const currentStatus = computed((): Status => {
  const status = statuses.find(status => status.name === listStore.currentTodo.status)
  if (status) {
    return status
  }
  return statuses[0]
})

function selectStatus(statusName: string) {
  console.log('select status', statusName)
  if (!statusName) return

  console.log('current Status', currentStatus.value)
  listStore.currentTodo.status = statusName
  updateStatus(currentStatus.value.name)
}

function updateStatus(statusName: string) {
  listStore.currentTodo.status = statusName
  listStore.updateTodo(listStore.currentTodo)
}
</script>

<template>
  <v-select
    v-model="listStore.currentTodo.status" flat tile density="compact" hide-selected center-affix
    item-title="name" :bg-color="currentStatus.color" :items="statuses" variant="plain" @update:model-value="selectStatus"
  >
    <template #selection="{}">
      <v-list-item class="py-0 my-0">
        {{ listStore.currentTodo.status }}
      </v-list-item>
    </template>
    <template #item="{ props, item }">
      <v-list-item v-bind="props" :base-color="item.raw.color" :title="item.raw.name" />
    </template>
  </v-select>
</template>
