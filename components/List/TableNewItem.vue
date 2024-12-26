<script setup lang="ts">
const { data } = useAuth()
const newTodoVariant = ref<'text' | 'outlined'>('text')
const openNewTodo = ref('')
const newTodoTitle = ref('')
const store = useListsStore()
const { groupItem } = defineProps(['groupItem'])
const { params } = useRoute()

async function createTodo(status: string) {
  if (newTodoTitle.value) {
    const newTodo: Todo = {
      name: newTodoTitle.value,
      status,
      desc: '',
      listId: params.id as string,
      userId: data?.value?.user?.sub,
      color: 'grey',
      edit: false,
    }
    await store.addTodo(newTodo)
    newTodoTitle.value = ''
  }
  else {
    openNewTodo.value = ''
  }
}
</script>

<template>
  <tr>
    <td v-if="openNewTodo === '' || openNewTodo !== groupItem.value" colspan="5">
      <v-btn
        :variant="newTodoVariant" size="x-small" elevation="0" @click="openNewTodo = groupItem.value"
        @mouseover="newTodoVariant = 'outlined'" @mouseleave="newTodoVariant = 'text'"
      >
        Add Todo
      </v-btn>
    </td>

    <td v-else-if="groupItem.value === openNewTodo" colspan="5">
      <v-text-field
        v-model="newTodoTitle" autofocus variant="plain" placeholder="new todo"
        @blur="createTodo(groupItem.value)" @keyup.enter="$event.target.blur()"
      />
    </td>
  </tr>
</template>
