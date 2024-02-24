<script setup lang="ts">
const { data, status } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
const newTodoInput = ref()
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
  dueDate: new Date().toISOString(),
  userId: data.value?.user.id ? data.value?.user.id : data.value?.user.sub
})

async function addTodayTodo() {
  const invalid = await newTodoInput.value.validate()
  console.log('valid', invalid.length)
  if (invalid.length === 0) {
    await listsStore.addTodo(newTodo.value)
    await listsStore.getTodaysTodos(data.value?.user.sub)
    newTodo.value.name = ''
  }
  
}

const todaysTodos = computed(() => {
  return listsStore.todaysTodos.filter((todo) => todo.status !== 'Closed')
})

const todaysClosedTodos = computed(() => {
  return listsStore.todaysTodos.filter((todo) => todo.status === 'Closed')
})

const newTodoRules = [
  (v: string) => !!v || 'Todo is required',
]



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
            ref="newTodoInput"
            v-model="newTodo.name"
            placeholder="Add a new todo..."
            density="compact"
            bg-color="secondary"
            :rules="newTodoRules"
            validate-on="submit lazy"
            @keyup.enter="addTodayTodo"
          >
            <template #append-inner>
              <v-icon
                size="small"
                @click="addTodayTodo"
              >
              mdi-plus
              </v-icon>
            </template>
          </v-text-field>
        </div>
        <v-tabs v-model="tab" align-tabs="center">
          <v-tab>
            todo
          </v-tab>
          <v-tab>
            done
          </v-tab>
        </v-tabs>
        <v-window v-model="tab" class="" style="min-height: 150px;">
          <v-window-item value="todo">
            <v-list v-if="todaysTodos.length">
              <v-list-item
                v-for="todo in todaysTodos"
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
                    variant="text"
                    size="small"
                    @click="listsStore.deleteTodo(todo._id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <div
              v-else
              class="fill-height m-auto text-center d-flex align-center justify-center"
            >
              Nothing todo today 🎉
            </div>
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
