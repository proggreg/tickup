<script setup lang="ts">
const {status} = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
console.log(loggedIn.value)
if (!loggedIn.value) {
  navigateTo('/login')
}
const listsStore = useListsStore()
useHead({ title: 'TickUp:Home' })
listsStore.getTodos()

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
