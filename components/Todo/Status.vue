<script setup lang="ts">
const { currentTodo, updateTodo } = useListsStore()
const { statuses } = useSettingsStore()
const index = ref(0)
const initStatus = statuses.find(status => status.name === currentTodo.status)
let currentStatus: Status = { name: 'Open', color: 'grey' }
if (initStatus) {
  currentStatus = reactive({ name: initStatus.name, color: initStatus.color })
}

function selectStatus (status: Status, newIndex: number) {
  index.value = newIndex
  currentStatus.name = status.name
  currentStatus.color = status.color
}
function nextStatus () {
  if (index.value < statuses.length - 1) {
    index.value++

    currentStatus.name = statuses[index.value].name
    currentStatus.color = statuses[index.value].color
  }
}

watch(currentStatus, () => {
  currentTodo.status = currentStatus.name
  updateTodo(currentTodo)
})
</script>
<template>
  <v-menu>
    <template #activator="{props}">
      <v-btn v-bind="props" :color="currentStatus.color" variant="tonal">
        {{ currentStatus.name }}
        <template #append>
          <v-icon @click.stop="nextStatus">
            mdi-chevron-right
          </v-icon>
        </template>
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="(status, index) in statuses"
        :key="index"
        @click="selectStatus(status, index)"
      >
        {{ status.name }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>
