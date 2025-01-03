<script setup lang="ts">
const route = useRoute()
const listStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const on = useToolbar()
const { isMobile } = useDevice()

onMounted(async () => {
  const data = await $fetch<List>(`/api/list/${route.params.id}`)
  const todos = await $fetch<Todo[]>(`/api/list/todos`, { query: { id: route.params.id } })

  data.todos = todos
  listStore.setCurrentList(data)
  console.log('list page', data)
})

if (!listStore.currentList) {
  navigateTo('/')
}

if (listStore.currentList) {
  useHead({
    title: `TickUp:${listStore.currentList.name}`,
  })
}

watch(currentTab, (newTab) => {
  listStore.setView(newTab)
})
watch(listStore.currentList.todos, (todos) => {
  if (!todos) return
  on.value = todos.filter((todo: Todo) => todo.selected).length > 0
})
</script>

<template>
  <div style="width: 100%;height: 100%;">
    <ListHeader />
    <div v-if="listStore.currentList.name && isMobile" class="pa-2 d-flex justify-center text-capitalize" align-content="center">
      <v-btn :active="false" class="font-weight-bold text-h5 text-capitalize mx-auto" :to="`/list/${listStore.currentList._id}`" :text="listStore.currentList.name" />
    </div>
    <div v-if="$device.isMobile">
      <ListTable />
    </div>
    <v-col v-else>
      <v-card cols="12" style="width: 100%; height: 100%;">
        <v-tabs v-model="currentTab">
          <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
        </v-tabs>
        <v-window v-model="currentTab" :touch="false" class="">
          <v-window-item value="board">
            <Board />
          </v-window-item>
          <v-window-item value="list" class="fill-height">
            <ListTable />
          </v-window-item>
        </v-window>
      </v-card>
    </v-col>
  </div>
</template>
