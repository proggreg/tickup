<script setup lang="ts">
const { status } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
const listsStore = useListsStore()
const tab = ref('todo')
const dialog = ref(false)

if (!loggedIn.value) {
  navigateTo('/login')
}

listsStore.currentList.name = "Today's Todo's"

useHead({ title: 'TickUp:Home' })

definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})

const todaysTodos = computed(() => {
  return listsStore.todaysTodos.filter((todo) => todo.status !== 'Closed')
})

const todaysClosedTodos = computed(() => {
  return listsStore.todaysTodos.filter((todo) => todo.status === 'Closed')
})

function selectTodo(todo: Todo) {
  listsStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}

</script>
<template>
  <v-col cols="12">
    <v-tabs
      v-model="tab"
      align-tabs="center"
    >
      <v-tab>
        todo
      </v-tab>
      <v-tab v-if="todaysClosedTodos.length">
        done
      </v-tab>
    </v-tabs>
    <v-window
      v-model="tab"
      class=""
      style="min-height: 150px;"
    >
      <v-window-item value="todo">
        <v-card
          v-if="todaysTodos.length"
          variant="tonal"
        >
          <v-list>
            <AppDialog
              :open="dialog"
              @close="dialog = false"
            >
              <TodoDetail />
            </AppDialog>

            <v-list-item
              v-for="todo in todaysTodos"
              :key="todo._id"
              class="fill-height"
              @click="selectTodo(todo)"
            >

              <template #prepend>
                <ListStatus :todo="todo" />
              </template>
              <v-list-item-title class="ml-4">
                {{ todo.name }}
              </v-list-item-title>

              <template #append>
                <v-btn
                  icon="mdi-delete"
                  elevation="0"
                  variant="text"
                  size="small"
                  @click.stop="listsStore.deleteTodo(todo._id)"
                />
              </template>
            </v-list-item>

          </v-list>
        </v-card>
        <v-card
          v-else
          variant="tonal"
        >
          <v-card-item class="text-center">
            Nothing todo today 🎉
          </v-card-item>
        </v-card>
      </v-window-item>
      <v-window-item
        value="done"
        height="100"
      >
        <v-card variant="tonal">
          <v-list v-if="todaysClosedTodos.length">
            <v-list-item
              v-for="todo in todaysClosedTodos"
              :key="todo._id"
            >
              <template #prepend>
                <ListStatus :todo="todo" />
              </template>
              <v-list-item-title class="ml-4">
                {{ todo.name }}
              </v-list-item-title>

              <template #append>
                <v-btn
                  icon
                  elevation="0"
                  @click="listsStore.deleteTodo(todo._id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-window-item>
    </v-window>
  </v-col>
  <!-- TODO add reminders feature -->
  <!-- <v-col >
      <v-card class="pa-4">
        <h2>reminders</h2>
      </v-card>
    </v-col> -->
</template>
