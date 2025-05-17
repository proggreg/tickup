<script setup lang="ts">
definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})
useHead({ title: 'TickUp:Home' })

const listsStore = useListsStore()
const tab = ref('1')
const saveTodo = ref(false)
const dialog = useDialog()

watch(tab as any, (newTab) => {
  console.log('newTab', newTab)
  if (newTab === '1') {
    listsStore.getTodaysTodos()
  }
  else if (newTab === '0') {
    listsStore.getOverdueTodos()
  }
})
</script>

<template>
  <v-col
    cols="12"
    class="pa-0 fill-height"
  >
    <v-tabs
      v-model="tab"
      grow
      align-tabs="center"
      :hide-slider="false"
      class="mb-4"
    >
      <v-tab class="text-h5">Overdue</v-tab>
      <v-tab class="text-h5">Todo</v-tab>
      <v-tab class="text-h5">Done</v-tab>
    </v-tabs>
    <v-window
      v-model="tab"
      class="fill-height px-4"
    >
      <v-window-item
        value="overdue"
        class="fill-height"
      >
        <HomePageOverDue />
      </v-window-item>
      <v-window-item
        value="todo"
        class="fill-height"
      >
        <div class="mb-4">
          <TodoNew :save-todo="saveTodo" @add-todo="dialog.open = false; saveTodo = false" />
        </div>
        <HomePageToday />
      </v-window-item>
      <v-window-item
        value="done"
        class="fill-height"
      >
        <HomePageTodayClosed />
      </v-window-item>
    </v-window>

    <AppDialog
      title="New Todo"
      page="todo"
    >
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
  </v-col>
</template>
