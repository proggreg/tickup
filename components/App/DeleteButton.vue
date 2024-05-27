<script setup lang="ts">
const listsStore = useListsStore()
const { todo } = defineProps<{
  todo: Todo
}>()
const deleteButton = ref()
const buttonFocused = ref(false)

async function deleteTodo() {
  await listsStore.deleteTodo(todo._id)
}
onMounted(() => {
  console.log('delete modal mounted')
})


onUpdated(() => {
  console.log('delete modal updated')
})
onUnmounted(() => {
  console.log('delete modal unmounted')
})

watchEffect(deleteButton => {
  console.log('delete button changed', deleteButton)
})

// TODO - autofocus delete button
async function focusDeleteButton() {
  await nextTick()
  console.log(deleteButton)
  
  setTimeout(() => {
    buttonFocused.value = true
  }, 100)

  buttonFocused.value = !buttonFocused.value
  if (deleteButton.value) {
    console.log(deleteButton)
    // deleteButton.value.focus()
  }
}
</script>
<template>
  <v-dialog width="250px">
        <template #activator="{ props: activatorProps }">
          <v-btn @click="focusDeleteButton" v-bind="activatorProps" color="red" 
          icon="mdi-trash-can" variant="text" size="x-small" />
        </template>
        <template #default="{ isActive }">
          <v-card>
            <v-card-text>
              Are you sure you want to delete this todo?
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn ref="deleteButton"  :focused="buttonFocused" color="red" @click="deleteTodo">
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