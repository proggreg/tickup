<script setup lang="ts">
const listsStore = useListsStore()
const { data } = useAuth()
const route = useRoute()
const emit = defineEmits(['save-todo'])

async function addTodo() {
  if (!route.params.id) {
    listsStore.newTodo.dueDate = new Date()
  }
  if (route.params.id) {
    listsStore.newTodo.listId = route.params.id as string
  }
  if (data.value?.user?.id) {
    listsStore.newTodo.userId = data.value?.user?.id
  }
  else if (data.value?.user?.sub) {
    listsStore.newTodo.userId = data.value?.user?.sub
  }

  if (listsStore.newTodo && listsStore.newTodo.name) {
    await listsStore.addTodo(listsStore.newTodo)
    if (!route.params.id) {
      await listsStore.getTodaysTodos(data.value?.user.id || data.value?.user.sub || '')
    }
    listsStore.newReset()
    emit('save-todo')
  }
}

// watch(() => saveTodo, (newVal) => {
//   if (newVal) {
//     addTodo()
//   }
// })
</script>

<template>
  <v-text-field
    v-if="listsStore.currentList" v-model="listsStore.newTodo.name"
    min-width="300"
    autofocus
    :placeholder="'Add todo to ' + listsStore.currentList.name" @keyup.enter="addTodo"
  >
    <template #append-inner>
      <AppDueDate :todo="listsStore.newTodo" :date="listsStore.newTodo.dueDate" @set-date="(newDate: Date) => listsStore.newTodo.dueDate = newDate" />

      <v-btn :disabled="!listsStore.newTodo.name" size="small" variant="text" icon="mdi-plus" @click="addTodo" />
    </template>
  </v-text-field>
</template>

<style scoped>
:deep(.v-field__field) {
  align-items: center;
}
</style>
