<script setup lang="ts">
const { data } = useAuth()
const listsStore = useListsStore()
const modelValue = defineModel<string>({ default: 'todo' })

watch(modelValue, (newTab) => {
  const sub = data?.value?.user?.sub
  if (!sub) return

  if (newTab === 'overdue') {
    listsStore.getOverdueTodos(sub)
  } else if (newTab === 'todo') {
    listsStore.getTodaysTodos(sub)
  } else if (newTab === 'done') {
    listsStore.getTodaysTodos(sub)
  }
})

onBeforeMount(() => {
  const sub = data?.value?.user?.sub
  if (sub) {
    listsStore.getTodaysTodos(sub)
  }
})
</script>

<template>
  <v-tabs
    v-model="modelValue"
    grow
    align-tabs="center"
    :hide-slider="false"
    class="mb-4"
  >
    <v-tab value="overdue" class="text-h5">
      Overdue
    </v-tab>
    <v-tab value="todo" class="text-h5">
      Todo
    </v-tab>
    <v-tab value="done" class="text-h5">
      Done
    </v-tab>
  </v-tabs>
</template>

