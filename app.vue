<script setup lang="ts">
import { useListsStore } from '@/stores/lists'
const listsStore = useListsStore()
const { data } = useFetch<Todo[]>('/api/todos')
listsStore.getLists()
if (data.value) {
  listsStore.todos = data.value
}

</script>
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
