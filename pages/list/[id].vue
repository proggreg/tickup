<script setup lang="ts">
const route = useRoute()
const listsStore = useListsStore()
const tabs = ref<View[]>(['board', 'list'])
const currentTab = ref<View>('list')
const on = useToolbar()
const saveTodo = ref(false)
const dialog = useDialog()

onMounted(async () => {
  const data = await $fetch<List>(`/api/list/${route.params.id}`)
  const todos = await $fetch<Todo[]>(`/api/list/todos`, { query: { id: route.params.id } })

  data.todos = todos || []
  listsStore.setCurrentList(data)
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
    <div v-if="listsStore.currentList.name && isMobile" class="pa-2 d-flex justify-center text-capitalize" align-content="center">
      <v-btn :active="false" class="font-weight-bold text-h5 text-capitalize mx-auto" :to="`/list/${listsStore.currentList._id}`" :text="listsStore.currentList.name" />
    </div>

    <v-row>
      <v-spacer />
      <v-col cols="2">
        <ListType />
      </v-col>
    </v-row>

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

    <AppDialog page="todo" title="New Todo">
      <TodoNew :save-todo="saveTodo" @add-todo="dialog.open = false; saveTodo = false" />
      <template #buttons>
        <v-btn
          color="primary"
          :disabled="listsStore.newTodo.name === ''"
          @click.stop="saveTodo = true; dialog.open = false"
        >
          Save
        </v-btn>
      </template>
    </AppDialog>
  </div>
</template>
