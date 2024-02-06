<script setup lang="ts">
const listsStore = useListsStore()
listsStore.getTodaysTodos()
useHead({ title: 'TickUp:Home' })
const newTodo = ref<Todo>({
  name: '',
  status: 'open',
  dueDate: new Date().toISOString()
})

async function addTodayTodo () {
  await listsStore.addTodo(newTodo.value)
  await listsStore.getTodaysTodos()
  newTodo.value.name = ''
}

</script>

<template>
  <v-row>
    <v-col>
      <v-card class="pa-4">
        <h2>Today's Todo's</h2>
        <div>
          <v-text-field
            v-model="newTodo.name"
            @keyup.enter="addTodayTodo"
          >
            <template #append>
              <v-btn
                icon
                elevation="0"
                @click="addTodayTodo"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>
        <v-list v-if="listsStore.todaysTodos.length">
          <v-list-item
            v-for="todo in listsStore.todaysTodos"
            :key="todo._id"
          >
            <v-list-item-title>{{ todo.name }}</v-list-item-title>
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
        <div
          v-else
          class="pa-4"
        >
          Nothing todo today 🎉
        </div>
      </v-card>
    </v-col>
    <v-col>
      <v-card class="pa-4">
        <h2>reminders</h2>
      </v-card>
    </v-col>
  </v-row>
</template>
