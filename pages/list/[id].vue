<script setup lang="ts">
const { params } = useRoute()
const { data: currentList } = await useFetch<List>(`/api/list/${params.id}`)
const { data: todos } = await useFetch<Todo[]>(`/api/list/todos`, {query: {id: params.id}})
const store = useListsStore()

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
    <v-col>
      <TodoNew :list-id="params.id" />
      <ListTable :list_id="params.id" />
    </v-col>
  </v-row>
</template>
