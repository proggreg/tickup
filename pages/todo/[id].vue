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
  $fetch(`/api/todo/${params.id}`).then((data) => {
    listStore.setCurrentTodo(data)
    $fetch(`/api/list/${todo.value.listId}`).then((data) => {
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