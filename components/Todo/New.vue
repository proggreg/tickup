<script setup lang="ts">
const listsStore = useListsStore()
const props = defineProps<{ listId?: string }>()
const { data } = useAuth()
const newTodo = ref<Todo>({
  name: '',
  dueDate: undefined,
  status: 'Open',
  desc: '',
  listId: props.listId ? props.listId : '',
  _id: undefined,
  userId: data.value?.user.id ? data.value?.user.id : data.value?.user.sub
})
const emit = defineEmits(['newTodo'])

async function addTodo() {
  await listsStore.addTodo(newTodo.value)

  emit('newTodo', newTodo)

  newTodo.value.name = ''
  newTodo.value.dueDate = undefined
}

</script>
<template>
      <v-text-field
        v-if="listsStore.currentList"
        v-model="newTodo.name"
        :placeholder="'Add todo to ' + listsStore.currentList.name"
        class="my-4"
        hide-details
        @keyup.enter="addTodo"
      >
        <template #append-inner>
          <AppDueDate
            :todo="newTodo"
            :date="newTodo.dueDate"
            @set-date="(newDate: Date) => newTodo.dueDate = newDate"
          />

          <v-btn
            :disabled="!newTodo.name"
            size="small"
            variant="text"
            icon="mdi-plus"
            @click="addTodo"
          />
        </template>
      </v-text-field>
  
</template>
