<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
const query = ref<string>('')
const results = ref([{name: 'test'}])
const open = ref(false)
const input = ref(null)
const todoDialogOpen = ref(false)
const store = useListsStore()


if (process.client) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      open.value = !open.value
      return false
    }
    
  })
}

function search() {
  console.log('searching...', query.value)
  $fetch('/api/search/todo', {query: {q: query.value}})
    .then((res) => {
      console.log(res)
      results.value = res
    })
    .catch((err) => {
      results.value = err
    })
}
const debouncedSearch = useDebounceFn(search, 500)


function setTextFieldFocus() {
  setTimeout(() => {
    input.value.focus()
  }, 100)
}
async function openTodoDialog(result: Todo) {
  console.log('getting todo...', result._id)
  const data = await store.getTodo(result._id)
  console.log(data)
  todoDialogOpen.value = true
}


</script>
<template>
  <v-dialog
    open-on-click
    :model-value="open"
    width="500"
  >
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
        hide-details
        density="compact"
        rounded="lg"
        variant="solo-filled"
        placeholder="search"
        style="max-width: 300px"
        @click="setTextFieldFocus"
      >
        <template #append-inner>
          <span style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
        </template>
      </v-text-field>
    </template>
<<<<<<< HEAD
  </v-text-field>
=======

    <template #default="{isActive}">
      <v-card
        v-show="isActive"
      >
        <v-layout class="justify-center py-8">
          <v-text-field
            ref="input"
            v-model="query"
            hide-details
            density="compact"
            rounded="lg"
            variant="solo-filled"
            placeholder="search"
            style="max-width: 300px"
            :focused="true"
            @keyup="debouncedSearch"
          >
            <template #append-inner>
              <span style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
            </template>
          </v-text-field>
        </v-layout>

        <v-list>
          <v-list-item
            v-for="(result, index) in results"
            :key="index"
            @click="openTodoDialog(result)"
          >
            <v-list-item-title class="font-weight-bold">
              {{ result.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ result.status }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <AppDialog
          :open="todoDialogOpen"
          @close="todoDialogOpen = false"
        >
          <TodoDetail />
        </AppDialog>
      </v-card>
    </template>
  </v-dialog>
>>>>>>> 48b8b48 (Add search functionality and API endpoint for searching todos)
</template>
