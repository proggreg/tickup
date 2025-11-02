<script setup lang="ts">
import { ListSimple } from '#components'

const route = useRoute()
const listsStore = useListsStore()
const tabs = ref<ViewType[]>(['board', 'list'])
const currentTab = ref<ViewType>('list')
const on = useToolbar()
const saveTodo = ref(false)
const dialog = useDialog()
// const { data: user } = useAuth()

onBeforeMount(async () => {
  // if (user?.value?.user._id) {
  //   await listsStore.getLists(user?.value?.user._id)
  // }
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

watch(listsStore.currentList.todos, (todos: Todo[]) => {
  if (!todos) return
  on.value = todos.filter((todo: Todo) => todo.selected).length > 0
})
</script>

<template>
  <v-container fluid>
  <v-row class="fill-height">
    <ListHeader />
    <v-col class="fill-height" cols="12">
      <v-tabs v-model="currentTab">
        <v-tab v-for="tab in tabs" :key="tab" :text="tab" :value="tab" />
      </v-tabs>
      <v-window v-model="currentTab" :touch="false" class="mt-4" style="height: 100%;">
        <v-window-item value="board" class="fill-height">
          <Board />
        </v-window-item>
        <v-window-item value="list" class="fill-height">
          <v-row>
            <v-col>
              <TodoNew />
            </v-col>
            <v-col cols="auto">
              <ListType />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <ListTable v-if="listsStore.currentList.listType === 'table'" />
              <ListSimple v-else />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-col>
  </v-row>
</v-container>
</template>
