<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
const query = ref<string>('')
const results = ref([])
const open = ref(false)
const todoDialogOpen = ref(false)
const { data } = useAuth()
const items = ref([])

if (import.meta.client) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      open.value = !open.value
      return false
    }

  })
}

function search() {
  $fetch('/api/search/todo', { query: { q: query.value, id: data?.value?.user?.sub } })
    .then((res) => {
      items.value = res
    })
    .catch((err) => {
      results.value = err
    })
}
const debouncedSearch = useDebounceFn(search, 500)

onMounted(() => {
  search()
})

</script>

<template>
  <v-dialog open-on-click :model-value="open" width="500">
    <template #activator="{ props }">
      <v-text-field 
        v-bind="props" hide-details placeholder="search" style="max-width: 1000px" class="mx-4">
        <template #append-inner>
          <span style="font-size: 0.70rem; width: 40px;">ctrl + k</span>
        </template>
      </v-text-field>

    </template>

    <template #default="{ isActive }">
      <v-card v-show="isActive">
        <v-card-item class=" pa-4">
          <v-text-field v-model="query" placeholder="search" autofocus class="ma-4"
            @keyup="debouncedSearch"/>
        </v-card-item>


        <v-divider />
        <v-virtual-scroll :items="items" height="300" item-height="50">
          <template #default="{ item }">
            <v-list-item link :to="`/todo/${item._id}`" @click="open = false">
              <template #prepend>
                <ListStatus :todo="item" />

              </template>

              <v-list-item-title class="font-weight-bold pa-4">
                {{ item.name }}
              </v-list-item-title>

              <template #append>
                <v-btn :to="`/todo/${item._id}`" icon="mdi-open-in-new" variant="text" />
              </template>
            </v-list-item>
          </template>
        </v-virtual-scroll>
        <!-- <v-list-item
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
            </v-list-item> -->
        <AppDialog :open="todoDialogOpen" @close="todoDialogOpen = false">
          <TodoDetail />
        </AppDialog>
      </v-card>
    </template>
  </v-dialog>
</template>
