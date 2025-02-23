<script setup lang="ts">
const listsStore = useListsStore()
const { isMobile } = useDevice()
const { listId } = defineProps<{
  listId?: string
}>()
function deleteList() {
    if (listId) {
        listsStore.deleteList(listId)
        navigateTo('/')
    }
    listsStore.deleteList()
  console.log('deleteList', listsStore.currentList)
  let route = '/lists'
  if (!isMobile) {
    route = '/'
  }
  navigateTo(route)
}
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        size="small"
        variant="plain"
        color="primary"
        base-color="transparent"
        icon="mdi-dots-vertical"
      />
    </template>
    <v-list>
      <v-list-item @click.self="deleteList">
        <v-list-item-title class="text-red">Delete List</v-list-item-title>
        <template #prepend>
          <v-icon color="red" icon="mdi-delete" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
