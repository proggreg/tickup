<script setup lang="ts">
const { data, status } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')

if (!loggedIn.value) {
  navigateTo('/login')
}
const listsStore = useListsStore()
listsStore.getTodaysTodos(data.value.user.sub)
useHead({ title: 'TickUp:Home' })
const tab = ref('todo')
if (loggedIn.value) {
  listsStore.getTodos()
}

definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',

  },
})
const newTodo = ref<Todo>({
  name: '',
  status: 'Open',
  dueDate: new Date(),
  userId: data.value?.user.id ? data.value?.user.id : data.value?.user.sub,
  _id: undefined
})

async function addTodayTodo() {
  await listsStore.addTodo(newTodo.value)
  await listsStore.getTodaysTodos(data.value?.user.sub)
  newTodo.value.name = ''
}

const todaysTodos = computed(() => {
  return listsStore.todaysTodos.filter((todo) => todo.status !== 'Closed')
})

const todaysClosedTodos = computed(() => {
  return listsStore.todaysTodos.filter((todo) => todo.status === 'Closed')
})

</script>

<template>
  <v-row class="fill-height">
    <v-col>
      <v-card class="pa-4">
        <h2 class="py-4">
          Today's Todo's
        </h2>
        <div>
          <v-text-field
            v-model="newTodo.name"
            placeholder="Add a new todo..."
            hide-details
            density="compact"
            @keyup.enter="addTodayTodo"
          >
            <template #append-inner>
              <v-btn
                :disabled="!newTodo.name"
                size="small"
                variant="text"
                elevation="0"
                icon="mdi-plus"
                @click="addTodayTodo"
              />
            </template>
          </v-text-field>
        </div>
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
          style="min-height: 150px;"
          class="fill-height"
        >
          <v-window-item
            value="todo"
            class="fill-height"
          >
            <v-list v-if="todaysTodos.length">
              <v-list-item
                v-for="todo in todaysTodos"
                :key="todo._id"
                class="fill-height"
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
            <v-card
              v-else
              height="200"
              class="d-flex align-center justify-center ma-2"
            >
              Nothing todo today 🎉
            </v-card>
          </v-window-item>
          <v-window-item value="done">
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
          </v-window-item>
        </v-window>
      </v-card>
    </v-col>
    <!-- <v-col>
      <v-card class="pa-4">
        <h2>reminders</h2>
      </v-card>
    </v-col> -->
  </v-row>
</template>
