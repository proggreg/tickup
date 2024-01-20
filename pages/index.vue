<script setup lang="ts">
const {status} = useAuth()
const listsStore = useListsStore()
listsStore.getTodos()
useHead({ title: 'TickUp:Home' })

const loggedIn = computed(() => status.value === 'authenticated')

if (!loggedIn.value) {
  navigateTo('/login')
}
definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login',
  },
})

</script>

<template>
  <div>
    <TodoNew />
    <ListTable
      v-if="listsStore.todos"
      :todos="listsStore.todos"
      list-name="Today"
    />
  </div>
</template>
