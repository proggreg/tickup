<script setup lang="ts">
const { params } = useRoute()
const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`)
const { data: todos } = await useFetch<Todo[]>("/api/list/todos", { query: { id: params.id } })
const store = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('board')
const { xs } = useDisplay()

if (currentList.value) {
  store.setListName(currentList.value.name)
  store.currentList = currentList.value
}

if (todos) {
  store.setListTodos(todos)
}

if (!currentList) {
  navigateTo('/')
}

if (currentList.value) {
  useHead({
    title: `TickUp:${currentList.value.name}`
  })
}

watch(currentTab, (newTab) => {
  store.setView(newTab)
})

</script>

<template>
  <v-row class="">
  <v-col v-if="!xs" cols="12" class="fill-height">
    <v-tabs v-model="currentTab">
      <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
    </v-tabs>
    <v-window v-model="currentTab">
      <v-window-item value="board">
        <AppBoard v-if="todos" :todos="todos" />
      </v-window-item>
      <v-window-item value="list">
        <ListTable v-if="todos" :list_id="params.id" :todos="todos" />
      </v-window-item>
    </v-window>
  </v-col>
  <v-col class="" v-else>
    <ListTable v-if="todos" :todos="todos" :list_id="params.id" />
  </v-col>
  
</v-row>

</template>
