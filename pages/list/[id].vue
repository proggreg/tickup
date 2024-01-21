<script setup lang="ts">
const { params } = useRoute()
const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`)
const { data: todos } = await useFetch<Todo[]>(`/api/list/todo/${params.id}`)
const store = useListsStore()

if (currentList.value.name) {
  store.setListName(currentList.value.name)
}

if (todos) {
  store.setListTodos(todos)
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
    <v-col>
      <TodoNew :list-id="params.id" />
      <!-- <TodoNew :list-id="params.id" /> -->
      <!-- <ListView v-if="todos && currentList" :list-name="currentList.name" :todos="todos" /> -->
      <ListTable :list_id="params.id" />
    </v-col>
  </v-row>
</template>
