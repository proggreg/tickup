<script setup lang="ts">
const { data } = useAuth()
const newTodoVariant = ref<'text' | 'outlined'>("text");
const newTodo = ref(null)
const openNewTodo = ref('');
const newTodoTitle = ref("");
const store = useListsStore()
const { groupItem } = defineProps(['groupItem'])
const {params} = useRouter()

async function createTodo(status: string) {
  if (newTodoTitle.value) {
    const newTodo: Todo = {
      name: newTodoTitle.value,
      _id: "",
      status,
      desc: "",
      listId: params.id,
      userId: data?.value?.user?.sub
    };
    await store.addTodo(newTodo);
    newTodoTitle.value = ''

  } else {
    openNewTodo.value = ''
  }
  if (newTodo.value.length > 0) {
    newTodo.value[0].focus()
  }
}
</script>
<template>
   <tr v-if="openNewTodo === '' || openNewTodo !== groupItem.value">
            <td colspan="5">
              <v-btn
                :variant="newTodoVariant"
                size="x-small"
                elevation="0"
                @click="openNewTodo = groupItem.value"
                @mouseover="newTodoVariant = 'outlined'"
                @mouseleave="newTodoVariant = 'text'"
              >
                Add Todo
              </v-btn>
            </td>
          </tr>
          <tr v-else-if="groupItem.value === openNewTodo">
            <td colspan="5">
              <v-text-field
                ref="newTodo"
                v-model="newTodoTitle"
                variant="plain"
                placeholder="new todo"
                @blur="createTodo(groupItem.value)"
                @keyup.enter="$event.target.blur()"
              />
            </td>
          </tr>
</template>