<script setup lang="ts">
definePageMeta({
  layout: 'default',
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/login' }
})
useHead({ title: 'TickUp:Home' })

const saveTodo = ref(false)
const dialog = useDialog()
const tab = ref('todo')
</script>

<template>
  <v-col
    cols="12"
    class="fill-height"
  >
    <HomePageTabs v-model="tab" />
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
  </v-col>
</template>
