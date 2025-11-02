<script setup lang="ts">
const listsStore = useListsStore()
const { userId } = useCurrentUser()
const route = useRoute()
const emit = defineEmits(['save-todo'])

async function addTodo() {
  if (!route.params.id) {
    listsStore.newTodo.dueDate = new Date()
  }
  if (route.params.id) {
    listsStore.newTodo.listId = route.params.id as string
  }
  listsStore.newTodo.userId = userId.value

  if (listsStore.newTodo && listsStore.newTodo.name) {
    await listsStore.addTodo(listsStore.newTodo)
    if (!route.params.id) {
      await listsStore.getTodaysTodos(userId.value)
    }
    listsStore.newReset()
    emit('save-todo')
  }
}
</script>

<template>
  <v-text-field
    v-if="listsStore.currentList" v-model="listsStore.newTodo.name"
    min-width="150"
    width="100%"
    :placeholder="'Add todo to ' + listsStore.currentList.name" autofocus @keyup.enter="addTodo"
  >
    <template #append-inner>
      <AppDueDate :todo="listsStore.newTodo" :date="listsStore.newTodo.dueDate" @set-date="(newDate: Date) => listsStore.newTodo.dueDate = newDate" />

      <v-btn :disabled="!listsStore.newTodo.name" size="small" variant="text" icon="mdi-plus" @click="addTodo" />
    </template>
  </v-text-field>
</template>

<style>
  input {
    height: 100%;
  }
</style>
