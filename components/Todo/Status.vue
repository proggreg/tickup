<script setup lang="ts">
const listStore = useListsStore()
const { statuses } = useSettingsStore()
const index = ref(0)
let currentStatus = computed((): Status => {
  // statuses[index.value]).value
  const defaultStatus = { name: 'Open', color: 'grey', todos: [] }
  console.log('computed currentStatus', listStore.currentTodo)
  if (listStore.currentTodo.status) {
    const status = statuses.find(status => status.name === listStore.currentTodo.status)
    if (status) {
      return status
    }
  }
  return defaultStatus
})

// if (initStatus) {
//   console.log('initStatus', initStatus)
//   console.log('current Todo', listStore.currentTodo)
//   currentStatus = reactive({ name: initStatus.name, color: initStatus.color, todos: [] })
// }

function selectStatus(status: Status, newIndex: number) {
  index.value = newIndex
  currentStatus.name = status.name
  currentStatus.color = status.color
}
function nextStatus() {
  if (index.value < statuses.length - 1) {
    index.value++

    currentStatus.name = statuses[index.value].name
    currentStatus.color = statuses[index.value].color
  }
}

watch(currentStatus, () => {
  listStore.currentTodo.status = currentStatus.name
  listStore.updateTodo(listStore.currentTodo)
})
</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" :color="currentStatus.color" variant="elevated" min-width="20px" border="1">
        {{ currentStatus.name }}
        <template #append>
          <v-icon @click.stop="nextStatus">
            mdi-chevron-right
          </v-icon>
        </template>
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-for="(status, index) in statuses" :key="index" @click="selectStatus(status, index)">
        {{ status.name }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>
