<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const on = useToolbar()

onBeforeMount(async () => {
  const currentList = await $fetch<List>(`/api/list/${params.id}`, { cache: 'no-cache', key: `/api/list/${params.id}` })
  const todos = await $fetch<Todo[]>('/api/list/todos', { query: { id: params.id }, cache: 'no-cache' })

  if (todos) {
    listStore.setListTodos(todos)
  }
  if (currentList.name) {
    listStore.setCurrentListName(currentList.name)
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

watch(currentTab, (newTab) => {
  listStore.setView(newTab)
})
watch(listStore.currentList.todos, (todos) => {
  if (!todos) return
  on.value = todos.filter((todo: Todo) => todo.selected).length > 0
})
</script>

<template>
  <div v-if="$device.isMobile" style="width: 100%;height: 100%;">
    <ListTable />
  </div>
  <div v-else cols="12" style="width: 100%; height: 100%;">
    <v-tabs v-model="currentTab">
      <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
    </v-tabs>
    <v-window v-model="currentTab" :touch="false" class="">
      <v-window-item value="board">
        <Board />
      </v-window-item>
      <v-window-item value="list" class="fill-height">
        <ListTable />
      </v-window-item>
    </v-window>
  </div>
</template>
