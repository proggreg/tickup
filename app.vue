<script setup lang="ts">
import { useListsStore } from '@/stores/lists'
const listsStore = useListsStore()
const { data: todos } = useFetch<Todo[]>('/api/todos')
const { data, status } = useAuth()

console.log(status.value)
if (status.value === 'authenticated') {
    listsStore.getLists(data.value?.user.sub)
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