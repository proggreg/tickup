<script setup lang="ts">
const { status, data } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
const listsStore = useListsStore()
const tab = ref('todo')
const saveTodo = ref(false)
const dialog = useDialog()
definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})
useHead({ title: 'TickUp:Home' })

listsStore.setCurrentListName('')

if (!loggedIn.value) {
  navigateTo('/login')
}

onBeforeMount(() => {
  const userId = data?.value?.user?.sub
  if (userId) {
    listsStore.getTodaysTodos(userId)
  }
})

const todaysTodos = computed(() => {
  return listsStore.todaysTodos.filter(todo => todo.status !== 'Closed')
})

const todaysClosedTodos = computed(() => {
  return listsStore.todaysTodos.filter(todo => todo.status === 'Closed')
})

function selectTodo(todo: Todo) {
  listsStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}
</script>

<template>
  <v-col
    cols="12"
    class="pa-0 fill-height"
  >
    <v-tabs
      v-model="tab"
      grow
      align-tabs="center"
      :hide-slider="true"
      class="mb-4"
    >
      <v-tab class="text-h5">Todo</v-tab>
      <v-tab class="text-h5">Done</v-tab>
    </v-tabs>
    <v-window
      v-model="tab"
      class="fill-height px-4"
    >
      <v-window-item
        value="todo"
        class="fill-height"
      >
        <v-card
          v-if="todaysTodos && todaysTodos.length"
          variant="tonal"
        >
          <v-list>
            <v-list-item
              v-for="todo in todaysTodos"
              :key="todo._id"
              @click="selectTodo(todo)"
            >
              <template #prepend>
                <ListStatus :todo="todo" />
              </template>
              <v-list-item-title class="ml-4 text-h6">
                {{ todo.name }}
              </v-list-item-title>

              <template #append>
                <AppDeleteButton :todo="todo" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-card
          v-else
          variant="tonal"
          class="d-flex flex-column justify-center align-center fill-height"
        >
          <AppEmptyState height="100%" />
        </v-card>
      </v-window-item>
      <v-window-item
        value="done"
        class="fill-height"
      >
        <v-card v-if="todaysClosedTodos.length" variant="tonal">
          <v-list
            class="pa-4"
          >
            <v-list-item
              v-for="todo in todaysClosedTodos"
              :key="todo._id"
            >
              <template #prepend>
                <ListStatus :todo="todo" />
              </template>
              <v-list-item-title class="ml-4 text-h6">
                {{ todo.name }}
              </v-list-item-title>

              <template #append>
                <v-btn
                  icon
                  elevation="0"
                  @click="listsStore.deleteTodo(todo._id!)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <AppEmptyState v-else height="100%" />
      </v-window-item>
    </v-window>

    <AppDialog
      :open="dialog.page === 'index' && dialog.open"
      @close="dialog.open"
    >
      <TodoNew :save-todo="saveTodo" class="mx-8" @add-todo="dialog = false; saveTodo = false" />
      <template #buttons>
        <v-btn
          color="primary"
          :disabled="listsStore.newTodo.name === ''"
          @click.stop="saveTodo = true; dialog.open = false"
        >
          Save
        </v-btn>
      </template>
    </AppDialog>
  </v-col>
</template>
