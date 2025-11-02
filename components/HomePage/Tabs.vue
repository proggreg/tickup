<script setup lang="ts">
const { userId } = useCurrentUser()
const listsStore = useListsStore()
const modelValue = defineModel<string>({ default: 'todo' })

watch(modelValue, (newTab) => {
  if (!userId.value) return

  if (newTab === 'overdue') {
    listsStore.getOverdueTodos(userId.value)
  }
 else if (newTab === 'todo') {
    listsStore.getTodaysTodos(userId.value)
  }
 else if (newTab === 'done') {
    listsStore.getTodaysTodos(userId.value)
  }
})

onBeforeMount(() => {
  if (userId.value) {
    listsStore.getTodaysTodos(userId.value)
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
