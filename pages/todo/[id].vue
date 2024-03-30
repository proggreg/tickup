<script
  setup
  lang="ts"
>
const { params } = useRoute()
const listStore = useListsStore()
definePageMeta({
  layout: 'todo',
})
const todo = ref({})

onMounted(() => {
  $fetch(`/api/todo/${params.id}`).then((todo) => {
    listStore.setCurrentTodo(todo)
    console.log('todo', todo)
    $fetch(`/api/list/${todo.listId}`).then((data) => {
      console.log('list', data)
      listStore.setCurrentList(data)
    })
  })


})

</script>
<template>
  <v-col>
    <TodoDetail />
  </v-col>
</template>