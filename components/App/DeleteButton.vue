<script setup lang="ts">
const listsStore = useListsStore()
const { todo } = defineProps<{
  todo: Todo
}>()
const deleteButton = ref()
const buttonFocused = ref(false)

async function deleteTodo() {
  if (!todo._id) {
    console.error('No todo id', todo)
    return
  }
  await listsStore.deleteTodo(todo._id)
}

// TODO - autofocus delete button
async function focusDeleteButton() {
  await nextTick()

  setTimeout(() => {
    buttonFocused.value = true
  }, 100)

  buttonFocused.value = !buttonFocused.value
  if (deleteButton.value) {
    // deleteButton.value.focus()
  }
}
</script>

<template>
  <v-dialog width="250px">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps" color="red" icon="mdi-trash-can" variant="text" size="small"
        @click="focusDeleteButton"
      />
    </template>
    <template #default="{ isActive }">
      <v-card>
        <v-card-text>
          Are you sure you want to delete this todo?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn ref="deleteButton" :focused="buttonFocused" color="red" @click="deleteTodo">
            Yes
          </v-btn>
          <v-btn @click="isActive.value = false">
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
