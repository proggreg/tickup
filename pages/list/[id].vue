<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const on = useToolbar()

onBeforeMount(async () => {
  const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`, { cache: 'no-cache', key: `/api/list/${params.id}` })
  const { data: todos } = await useFetch<Todo[]>('/api/list/todos', { query: { id: params.id }, cache: 'no-cache' })
  console.log('currentList', currentList.value)
  console.log('currentList todos', todos.value)
  if (todos.value) {
    listStore.setListTodos(todos.value)
  }
  if (currentList.value?.name) {
    listStore.setCurrentListName(currentList.value.name)
  }
})

if (!listStore.currentList) {
  navigateTo('/')
}

if (listStore.currentList) {
  useHead({
    title: `TickUp:${listStore.currentList.name}`,
  })
}

onMounted(() => {
  console.log('list page mounted')
})
onUnmounted(() => {
  console.log('list page unmounted')
})
watch(currentTab, (newTab) => {
  listStore.setView(newTab)
})
watch(listStore.currentList.todos, (todos) => {
  if (!todos) return
  on.value = todos.filter((todo: Todo) => todo.selected).length > 0
  console.log('todos changed', on.value)
})
</script>

<template>
  <v-col cols="12" style="height: 100%;">
    <v-tabs v-model="currentTab">
      <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
    </v-tabs>
    <v-window v-model="currentTab" :touch="false" class="">
      <v-window-item value="board" class="">
        <Board />
      </v-window-item>
      <v-window-item value="list" class="fill-height">
        <ListTable />
      </v-window-item>
    </v-window>
  </v-col>
</template>
