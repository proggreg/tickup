<script setup lang="ts">
const { params } = useRoute()
const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`)
const { data: todos } = await useFetch<Todo[]>(`/api/list/todos`, { query: { id: params.id } })
const store = useListsStore()
const tabs = ref<string[]>(['list', 'board'])
const currentTab = ref<string>('board')
const { xs } = useDisplay()

console.log('currentList', currentList.value)


if (currentList.value) {
  store.setListName(currentList.value.name)
}
console.log('todos', todos.value)
if (todos) {
  store.setListTodos(todos)
} else {
  console.log('no todos')
}

if (!currentList) {
  navigateTo('/')
}

if (currentList.value) {
  useHead({
    title: 'TickUp:' + currentList.value.name
  })
}

</script>
<template>
  <v-row>
    <v-col cols="12">
      <TodoNew :list-id="params.id" />
    </v-col> 
 
    <v-col v-if="!xs" cols="12" class="fill-height">
        <v-tabs v-model="currentTab">
          <v-tab
            v-for="tab in tabs"
            :key="tab"
            :text="tab"
            :value="tab"
          />
        </v-tabs>
        <v-window
          v-model="currentTab"
        >
          <v-window-item value="list">
            <ListTable v-if="todos" :list_id="params.id" />
          </v-window-item>
          <v-window-item
            value="board"
          >
            <AppBoard v-if="todos" :todos="todos" />
          </v-window-item>
        </v-window>
      </v-col>
      <!-- <ListTable v-else /> -->

  </v-row>
</template>
