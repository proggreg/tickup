<script setup lang="ts">
const listsStore = useListsStore()
const { statuses } = useSettingsStore()

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
</script>

<template>
  <v-card width="100%" elevation="0" class="pa-2 d-flex flex-column" style="height: 100%">
    <v-card-item>
      <v-row>
        <v-col>
          <TodoStatus />
        </v-col>
        <v-spacer />
        <v-col sm="3" md="2" cols="6">
          <AppDueDate
            :todo-due-date="listsStore.currentTodo.dueDate" :todo="listsStore.currentTodo" :show-detail="true"
            @set-date="updateDueDate"
          />
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-title>
      <v-text-field v-model="listsStore.currentTodo.name" label="Title" hide-details @blur="updateName" />
    </v-card-title>
    <v-textarea v-model="desc" class="ma-4" auto-grow label="Description" rows="20" max-rows="20" @blur="updateDesc" />
    <v-card-actions class="py-6">
      <AppDeleteButton :todo="listsStore.currentTodo" />
      <AppGithubButton :todo="listsStore.currentTodo" />
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
