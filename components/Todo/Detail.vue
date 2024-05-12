<script setup lang="ts">
const listsStore = useListsStore()

function updateDueDate(newDate: Date) {
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
  <v-card width="100%" elevation="0" class="pa-2">
    <template #prepend>
      <TodoStatus />
    </template>
    <template #append>
      <AppDueDate :todo-due-date="listsStore.currentTodo.dueDate" 
                  :todo="listsStore.currentTodo" :show-detail="true"
                  @set-date="updateDueDate"
      />
    </template>
    <v-card-title>
      <v-text-field v-model="listsStore.currentTodo.name" label="Title" hide-details @blur="updateName" />
    </v-card-title>
    <v-card-item>
      <v-textarea v-model="desc" class="mt-2" label="Description" @blur="updateDesc" />
    </v-card-item>

    <v-card-actions>
      <AppDeleteButton :todo="listsStore.currentTodo" />
      <v-spacer />
      <v-file-input label="File input" variant="solo-inverted" density="compact" hide-details disabled />
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
