<script setup lang="ts">
import { useListsStore } from '@/stores/lists'
const listsStore = useListsStore()
const { data, status } = useAuth()

const route = useRoute()

if (status.value === 'authenticated') {
    // @ts-ignore
    listsStore.getLists(data?.value?.user?.sub)
    listsStore.getTodaysTodos(data?.value?.user?.sub)
}

if (route.params.id) {
    const { data: currentList } = await useFetch<List>(`/api/list/${route.params.id}`)
    if (currentList.value) {
        listsStore.setListName(currentList.value.name)    
    }
}

</script>
<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>