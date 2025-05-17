<script setup lang="ts">
const route = useRoute()
const listsStore = useListsStore()
const on = useToolbar()
const saveTodo = ref(false)
const dialog = useDialog()
const { isMobile } = useDevice()
onMounted(async () => {
  listsStore.getList(route.params.id as string)
})

if (!listsStore.currentList) {
  navigateTo('/')
}

if (listsStore.currentList) {
  useHead({
    title: `TickUp:${listsStore.currentList.name}`,
  })
}

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
      <ListSimple v-if="listsStore.currentList.listType === 'simple'" />
      <ListTable v-else />
    </div>
    <v-col v-else>
      <v-card cols="12" style="width: 100%; height: 100%;">
        <ListSimple v-if="listsStore.currentList.listType === 'simple'" />
        <ListComplex v-else />
        <!-- <ListComplex /> -->
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
