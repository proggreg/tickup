<script setup lang="ts">
import { useListsStore } from '@/stores/lists'
const listsStore = useListsStore()
const { data, status } = useAuth()

if (status.value === 'authenticated') {
    listsStore.getTodaysTodos(data.value?.user.sub)
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