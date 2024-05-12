<script setup lang="ts">
const listsStore = useListsStore()
const { data } = useAuth()
const route = useRoute()
const newTodo = ref<Todo>({
  name: '',
  dueDate: undefined,
  status: 'Open',
  desc: '',
  listId: route.params.id ? route.params.id : '',
  _id: undefined,
  userId: data.value?.user.id ? data.value?.user.id : data.value?.user.sub
})

const emit = defineEmits(['addTodo'])

async function addTodo() {
  if (!route.params.id) {
    newTodo.value.dueDate = new Date()
  }

  await listsStore.addTodo(newTodo.value)

  if (!route.params.id) {
    await listsStore.getTodaysTodos(data.value?.user.id ? data.value?.user.id : data.value?.user.sub)
  }
  newTodo.value.name = ''
  newTodo.value.dueDate = undefined
  emit('addTodo')
}

</script>
<template>
      <v-text-field
        v-if="listsStore.currentList"
        v-model="newTodo.name"
        :placeholder="'Add todo to ' + listsStore.currentList.name"
        class="my-4"
        hide-details
        autofocus
        @keyup.enter="addTodo"
      >
        <template #append-inner>
          <AppDueDate
            :todo="newTodo"
            :date="newTodo.dueDate"
            @set-date="(newDate: Date) => newTodo.dueDate = newDate"
          />

          <v-btn
            :disabled="!newTodo.name"
            size="small"
            variant="text"
            icon="mdi-plus"
            @click="addTodo"
          />
        </template>
      </v-text-field>
</template>