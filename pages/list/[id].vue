<script setup lang="ts">
const route = useRoute()
const listsStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const on = useToolbar()
// const saveTodo = ref(false)
// const dialog = useDialog()

onBeforeMount(async () => {
  await listsStore.getLists()
  const currentList = listsStore.lists.find((list: List) => list._id === route.params.id)

  if (currentList) {
    listsStore.setCurrentList(currentList)
  }
})

if (!listsStore.currentList) {
  navigateTo('/')
}

if (listsStore.currentList) {
  useHead({
    title: `TickUp:${listsStore.currentList.name}`,
  })
}

watch(currentTab, (newTab) => {
  listsStore.setView(newTab)
})
watch(listsStore.currentList.todos, (todos) => {
  if (!todos) return
  on.value = todos.filter((todo: Todo) => todo.selected).length > 0
})
</script>

<template>
  <div style="width: 100%;height: 100%;">
    <ListHeader />
    <div v-if="$device.isMobile">
      <v-col>
        <ListTable />
      </v-col>
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
