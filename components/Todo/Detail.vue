<script setup lang="ts">
import { ref } from 'vue'
const listsStore = useListsStore()
const hasGithub = await useHasGithub()

console.log('hasGithub', hasGithub)

const newSubtaskName = ref('')

function updateDueDate(newDate: Date) {
  listsStore.currentTodo.dueDate = newDate
  listsStore.updateTodo(listsStore.currentTodo)
}
function updateName() {
  // TODO add a validation message to say todo names can't be blank
  if (listsStore.currentTodo.name) {
    listsStore.updateTodo(listsStore.currentTodo)
  }
}

function addSubtask() {
  if (!newSubtaskName.value) return
  if (!listsStore.currentTodo.subtasks) listsStore.currentTodo.subtasks = []
  listsStore.currentTodo.subtasks.push({
    name: newSubtaskName.value,
    status: 'open',
    _id: crypto.randomUUID(),
  })
  newSubtaskName.value = ''
  listsStore.updateTodo(listsStore.currentTodo)
}
</script>

<template>
  <v-card width="100%" elevation="0" class="pa-0 d-flex flex-column rounded-lg">
    <v-card-item class="pb-0 pt-4 px-6 mb-6">
      <v-row align="center">
        <v-col sm="3" md="2" cols="6">
          <TodoStatus />
        </v-col>
        <v-spacer />
        <v-col sm="4" md="4" cols="6">
          <AppDueDate
            :todo-due-date="listsStore.currentTodo.dueDate" :todo="listsStore.currentTodo" :show-detail="true"
            @set-date="updateDueDate"
          />
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-title class="px-6 pt-2 mb-2">
      <v-text-field v-model="listsStore.currentTodo.name" label="Title" hide-details variant="outlined" class="rounded-lg" @blur="updateName" />
    </v-card-title>
    <v-card-item class="px-6 pt-0 pb-2 mb-2">
      <v-textarea
        v-model="listsStore.currentTodo.desc" auto-grow
        class="mt-2 rounded-lg"
        hide-details max-rows="20" variant="outlined"
        @input="listsStore.updateTodo(listsStore.currentTodo)"
        @blur="listsStore.updateTodo(listsStore.currentTodo)"
      />
    </v-card-item>

    <!-- Subtasks Checklist -->
    <v-card-item class="px-6 pt-0 pb-2">
      <div class="pa-4 rounded-lg">
        <div class="mb-2 text-subtitle-1 font-weight-bold">Subtasks</div>
        <v-list density="compact" class="pa-0" v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length">
          <v-list-item v-for="(subtask, idx) in listsStore.currentTodo.subtasks" :key="subtask._id" class="py-2 px-0 align-center">
            <template #prepend>
              <v-checkbox
                v-model="listsStore.currentTodo.subtasks[idx].status"
                :true-value="'done'"
                :false-value="'open'"
                @change="listsStore.updateTodo(listsStore.currentTodo)"
                class="me-2"
                density="compact"
              />
            </template>
            <v-text-field
              v-model="listsStore.currentTodo.subtasks[idx].name"
              hide-details
              variant="plain"
              :readonly="listsStore.currentTodo.subtasks[idx].status === 'done'"
              :class="{'text-decoration-line-through text-disabled': listsStore.currentTodo.subtasks[idx].status === 'done'}"
              @blur="listsStore.updateTodo(listsStore.currentTodo)"
            />
            <template #append>
              <v-btn icon="mdi-delete" size="small" variant="text" @click="listsStore.currentTodo.subtasks.splice(idx, 1); listsStore.updateTodo(listsStore.currentTodo)" />
            </template>
            <v-divider v-if="idx < listsStore.currentTodo.subtasks.length - 1" class="my-1" />
          </v-list-item>
        </v-list>
        <div v-else class="text-grey text-body-2 pa-2">No subtasks yet. Add one below!</div>
        <div class="d-flex align-center mt-4">
          <v-text-field
            v-model="newSubtaskName"
            label="Add subtask"
            hide-details
            variant="outlined"
            class="me-2 flex-grow-1"
            @keyup.enter="addSubtask"
            style="min-width: 120px;"
          />
          <v-btn icon="mdi-plus" size="small" variant="tonal" color="primary" :disabled="!newSubtaskName" @click="addSubtask" />
        </div>
      </div>
    </v-card-item>
    <!-- End Subtasks Checklist -->

    <v-card-item class="px-6 pt-0 pb-2">
      <TodoLinks />
    </v-card-item>

    <v-card-actions class="py-6 px-6">
      <AppDeleteButton :todo="listsStore.currentTodo" />
      <AppGithubButton v-if="hasGithub" :todo="listsStore.currentTodo" />
      <v-spacer />
      <v-file-input label="File input" variant="solo-inverted" density="compact" hide-details disabled class="rounded-lg" />
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

.subtask-done-outline {
  border: 2px solid var(--v-theme-primary);
  border-radius: 8px;
  background-color: #f5f5f5;
}
</style>
