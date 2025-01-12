<script setup lang="ts">
definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})
useHead({ title: 'TickUp:Home' })

const { status, data } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
const listsStore = useListsStore()
const tab = ref('1')
const saveTodo = ref(false)
const dialog = useDialog()

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

function setClosed(todo: Todo) {
  todo.status = 'Closed'
  listsStore.updateTodo(todo)
}

function setOpen(todo: Todo) {
  todo.status = 'Open'
  listsStore.updateTodo(todo)
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
      :hide-slider="false"
      class="mb-4"
    >
      <v-tab class="text-h5">Overdue</v-tab>
      <v-tab class="text-h5">Todo</v-tab>
      <v-tab class="text-h5">Done</v-tab>
    </v-tabs>
    <v-window
      v-model="tab"
      class="fill-height"
    >
      <v-window-item
        value="overdue"
        class="fill-height"
      >
        <HomePageOverDue />
      </v-window-item>
      <v-window-item
        value="todo"
        class="fill-height"
      >
        <div class="ma-4">
          <TodoNew :save-todo="saveTodo" @add-todo="dialog = false; saveTodo = false" />
        </div>
        <HomePageToday />
      </v-window-item>
      <v-window-item
        value="done"
        class="fill-height"
      >
        <v-card v-if="todaysClosedTodos.length" variant="flat">
          <v-list
            class="pa-4"
          >
            <v-list-item
              v-for="todo in todaysClosedTodos"
              :key="todo._id"
            >
              <template #prepend>
                <v-checkbox :model-value="true" @click.stop="setOpen(todo)" />
              </template>
              <v-list-item-title class="text-h6">
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
        <v-card
          v-else
          variant="flat"
          :class="['d-flex flex-column justify-center align-center', !isMobile ? 'fill-height' : '']"
        >
          <AppEmptyState height="100%" />
        </v-card>
      </v-window-item>
    </v-window>

    <AppDialog
      title="New Todo"
      page="todo"
    >
      <TodoNew :save-todo="saveTodo" @add-todo="dialog = false; saveTodo = false" />
      <TodoNew :save-todo="saveTodo" @add-todo="dialog = false; saveTodo = false" />
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
