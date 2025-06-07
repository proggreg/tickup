<script setup lang="ts">
const route = useRoute()
const listsStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('board')
const on = useToolbar()
const saveTodo = ref(false)
const dialog = useDialog()
const { data: user } = useAuth()

onBeforeMount(async () => {
  if (user?.value?.user._id) {
    await listsStore.getLists(user?.value?.user._id)
  }
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
  <v-row class="fill-height" no-gutters>
    <ListHeader />
    <div v-if="$device.isMobile">
      <v-col>
        <ListTable />
      </v-col>
    </div>
    <v-col v-else class="fill-height" cols="12">
      <v-sheet width="100%" class="pa-0 fill-height">
        <v-tabs v-model="currentTab">
          <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
        </v-tabs>
        <v-window v-model="currentTab" :touch="false" style="height: 100%;">
          <v-window-item value="board" class="fill-height">
            <Board />
          </v-window-item>
          <v-window-item value="list" class="fill-height">
            <ListTable />
          </v-window-item>
        </v-window>
      </v-sheet>
    </v-col>
  </v-row>
</template>
