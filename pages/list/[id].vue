<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const on = useToolbar()
const { isMobile } = useDevice()

onBeforeMount(async () => {
  const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`, { cache: 'no-cache', key: `/api/list/${params.id}` })
  const { data: todos } = await useFetch<Todo[]>('/api/list/todos', { query: { id: params.id }, cache: 'no-cache' })

  console.log('before mount todos', todos.value)
  if (todos.value && todos.value.length) {
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

watch(currentTab, (newTab) => {
  listStore.setView(newTab)
})
watch(listStore.currentList.todos, (todos) => {
  if (!todos) return
  on.value = todos.filter((todo: Todo) => todo.selected).length > 0
})
</script>

<template>
  <div style="width: 100%;height: 100%;">
    <div v-if="isMobile && listStore.currentList.name" class="pa-2 d-flex justify-center" align-content="center">
      <v-btn :active="false" class="font-weight-bold text-h5 text-capitalize mx-auto" :to="`/list/${listStore.currentList._id}`" :text="listStore.currentList.name" />
    </div>
    <div v-if="$device.isMobile">
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
  </div>
</template>
