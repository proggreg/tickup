<script setup lang="ts">
const listsStore = useListsStore()

function updateDueDate(newDate: Date) {
  listsStore.currentTodo.dueDate = newDate
  listsStore.updateTodo(listsStore.currentTodo)
}
function updateName() {
  if (listsStore.currentTodo.name) {
    listsStore.updateTodo(listsStore.currentTodo)
  }
}

function updateDesc() {
  listsStore.currentTodo.desc = desc.value
  listsStore.updateTodo(listsStore.currentTodo)
}
const desc = ref(listsStore.currentTodo.desc)

async function deleteTodo() {
  const id = listsStore.currentTodo._id
  await listsStore.deleteTodo(id)
  let url = "/"
  if (listsStore?.currentList?._id) {
    url = `/list/${listsStore.currentList._id}`
  }

  navigateTo(url)
}

</script>

<template>
  <v-card width="100%" elevation="0" class="pa-2">
    <template #prepend>
      <TodoStatus />
    </template>
    <template #append>
      <AppDueDate :todo-due-date="listsStore.currentTodo.dueDate" 
                  :todo="listsStore.currentTodo" :show-detail="true"
                  @set-date="updateDueDate"
      />
    </template>
    <v-card-title>
      <v-text-field v-model="listsStore.currentTodo.name" label="Title" hide-details @blur="updateName" />
    </v-card-title>
    <v-card-item>
      <v-textarea v-model="desc" class="mt-2" label="Description" @blur="updateDesc" />
    </v-card-item>

    <v-card-actions>
      <v-dialog width="250px">
        <template #activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" color="red" icon="mdi-trash-can" />
        </template>
        <template #default="{ isActive }">
          <v-card>
            <v-card-text>
              Are you sure you want to delete this todo?
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="red" @click="deleteTodo">
               Yes
              </v-btn>
              <v-btn @click="isActive.value = false">
               No
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <v-spacer />
      <v-file-input label="File input" variant="solo-inverted" density="compact" hide-details disabled />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-file-input {
  flex-grow: 0;
}

:deep(.v-file-input .v-input__control) {
  display: none;
}
</style>
