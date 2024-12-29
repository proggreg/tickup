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
  listsStore.updateTodo(listsStore.currentTodo)
}

const formattedDesc = computed(() => {
  if (!listsStore.currentTodo.desc) return ''

  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g

  // Replace URLs with HTML links
  return listsStore.currentTodo.desc.replace(urlPattern, '<a href="$1" target="_blank">$1</a>')
})

watch(() => listsStore.currentTodo.desc, (newDesc) => {
  if (!newDesc) return

  // Check if desc contains a URL
  const urlPattern = /(https?:\/\/[^\s]+)/g
  if (urlPattern.test(newDesc)) {
    // Update the desc with formatted links
    listsStore.currentTodo.desc = formattedDesc.value
  }
})
</script>

<template>
  <v-card width="100%" elevation="0" class="pa-0 d-flex flex-column" style="height: 100%">
    <v-card-item>
      <v-row>
        <v-col cols="6">
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
    <v-textarea v-model="listsStore.currentTodo.desc" class="ma-4" auto-grow label="Description" hide-details max-rows="20" @input="updateDesc" @blur="updateDesc" />
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
