<script setup lang="ts">
const listsStore = useListsStore()
const props = defineProps<{listId?: string}>()
const newTodo = ref<Todo>({
  name: '',
  dueDate: undefined,
  status: 'Open',
  desc: ''
})
const emit = defineEmits(['newTodo'])

async function addTodo () { 
  newTodo.value.list_id = props.listId
  console.log('add to do', newTodo.value)
  await listsStore.addTodo(newTodo.value)
  
  emit('newTodo', newTodo)

  newTodo.value.name = ''
  newTodo.value.dueDate = undefined
}

</script>
<template>
  <v-row
    v-if="listsStore.currentList"
    no-gutters
  >
    <v-col cols="12">
      <v-text-field
        v-if="listsStore.currentList"
        v-model="newTodo.name"
        variant="solo-filled"
        rounded="lg"
        :placeholder="'Add todo to ' + listsStore.currentList.name"
        class="add-todo-field"
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
            rounded="lg"
            variant="text"
            icon="mdi-plus"
            @click="addTodo"
          />
        </template>
      </v-text-field>
      <slot />
    </v-col>
  </v-row>
</template>
