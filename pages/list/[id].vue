<script setup lang="ts">
const { params } = useRoute()
const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`)
const { data: todos } = await useFetch<Todo[]>('/api/list/todos', { query: { id: params.id } })
const store = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const { xs } = useDisplay()

if (currentList.value) {
  store.setListName(currentList.value.name)
  store.currentList = currentList.value
}

if (todos.value) {
  store.setListTodos(todos.value)
}

if (!currentList) {
  navigateTo('/')
}

if (currentList.value) {
  useHead({
    title: `TickUp:${currentList.value.name}`,
  })
}

watch(currentTab, (newTab) => {
  store.setView(newTab)
})
</script>

<template>
  <v-col cols="12" style="height: 100%;">
    <v-tabs v-model="currentTab">
      <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
    </v-tabs>
    <v-window v-model="currentTab" :touch="false" class="">
      <v-window-item value="board" class="">
        <Board v-if="todos" :todos="todos" />
      </v-window-item>
      <v-window-item value="list" class="fill-height">
        <ListTable v-if="todos" :list_id="params.id" :todos="todos" />
      </v-window-item>
    </v-window>
  </v-col>
</template>
