<script setup lang="ts">
const listsStore = useListsStore()

function updateDueDate(newDate: Date) {
  console.log('updateDueDate', newDate)
  listsStore.currentTodo.dueDate = newDate
  listsStore.updateTodo(listsStore.currentTodo)
}
function updateName() {
  if (listsStore.currentTodo.name) {
    listsStore.updateTodo(listsStore.currentTodo)
  }
}

function updateDesc() {
  listsStore.currentTodo.desc = desc.value
  listsStore.updateTodo(listsStore.currentTodo)
}
const desc = ref(listsStore.currentTodo.desc)

</script>

<template>
  <v-card>
    <template #prepend>
      <TodoStatus />
    </template>
    <template #append>
      <AppDueDate :todo-due-date="listsStore.currentTodo.dueDate" :todo="listsStore.currentTodo" :show-detail="true"
        @set-date="updateDueDate" />
    </template>
    <v-card-title>
      <v-text-field v-model="listsStore.currentTodo.name" @blur="updateName" />
    </v-card-title>
    <v-card-item>
      <v-textarea v-model="desc" label="description" variant="solo-inverted" @blur="updateDesc" />
    </v-card-item>

    <v-card-actions>
      <v-spacer />
      <!-- <v-file-input
        label="File input"
        variant="solo-inverted"
        density="compact"
        hide-details
        TODO File Attachments
      /> -->
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-file-input {
  flex-grow: 0;
}

:deep(.v-file-input .v-input__control) {
  display: none;
}
</style>
