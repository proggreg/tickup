<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
const query = ref<string>('')
const results = ref([{ name: '' }])
const open = ref(false)
const input = ref(null)
const todoDialogOpen = ref(false)
const store = useListsStore()
const { data } = useAuth()
const { xs } = useDisplay()

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
  $fetch('/api/search/todo', { query: { q: query.value, id: data.value?.user.sub } })
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

function formattedDate(date: string) {
  if (date) {
    return new Date(date).toLocaleDateString('en-GB')
  }
}
function formattedTime(d: string) {
  if (d) {
    const date = new Date(d)
    return date.getHours() + ':' + date.getMinutes()
  }
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
        placeholder="search"
        style="max-width: 300px"
        class="mx-4"
        @click="setTextFieldFocus"
      >
        <template #append-inner>
          <span style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
        </template>
      </v-text-field>

    </template>

    <template #default="{ isActive }">
      <v-card v-show="isActive">
        <v-layout class="justify-center py-8">
          <v-text-field
            ref="input"
            v-model="query"
            hide-details
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

            <div
              v-if="result.updatedAt"
              class="text-overline"
            >
              Updated at: {{ formattedDate(result.updatedAt) }} {{ formattedTime(result.updatedAt) }}
            </div>
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
</template>
