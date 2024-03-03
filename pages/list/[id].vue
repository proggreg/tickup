<script
  setup
  lang="ts"
>
const { params } = useRoute()
const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`)
const { data: todos } = await useFetch<Todo[]>(`/api/list/todos`, { query: { id: params.id } })
const store = useListsStore()
const tabs = ref<string[]>(['list', 'board'])
const currentTab = ref<string>('board')
const { xs } = useDisplay()

if (currentList.value.name) {
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
  <v-row class="fill-height">
    <v-col cols="12">
      <TodoNew :list-id="params.id" />
    </v-col>
    <v-col
      v-if="!xs"
      cols="12"
      class="fill-height"
    >
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
        class=" pa-2 fill-height"
      >
        <v-window-item value="list">
          <ListTable :list_id="params.id" />
        </v-window-item>
        <v-window-item
          value="board"
          class="fill-height"
        >
          <AppBoard />
        </v-window-item>
      </v-window>
    </v-col>
    <ListTable v-else />

  </v-row>
</template>
