<script setup lang="ts">
const { status, data } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
const listsStore = useListsStore()
const tab = ref('todo')
const dialog = ref(false)
const saveTodo = ref(false)
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
    class="pa-0"
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
          <AppEmptyState />
        </v-card>
      </v-window-item>
      <v-window-item
        value="done"
        class="fill-height"
      >
        <v-card variant="tonal" class="fill-height">
          <v-list
            v-if="todaysClosedTodos.length"
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
          <AppEmptyState v-else />
        </v-card>
      </v-window-item>
    </v-window>
    <v-fab
      size="large" color="primary" style="border-radius: 50% !important; position: fixed; bottom: 100px; z-index: 1000; right: 75px"
      icon="mdi-plus" variant="elevated"
      @click="dialog = true"
    />
    <AppDialog
      :open="dialog"
      @close="dialog = false"
    >
      <TodoNew :save-todo="saveTodo" class="mx-8" @add-todo="dialog = false; saveTodo = false" />
      <template #buttons>
        <v-btn
          color="primary"
          @click="saveTodo = true; dialog = false"
        >
          Save
        </v-btn>
      </template>
    </AppDialog>
  </v-col>

  <!-- TODO add reminders feature -->
  <!-- <v-col >
      <v-card class="pa-4">
        <h2>reminders</h2>
      </v-card>
    </v-col> -->
</template>
