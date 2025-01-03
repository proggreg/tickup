<script setup lang="ts">
const { data } = useAuth()
const newList = ref<List>({
  name: '',
  todos: [],
  _id: undefined,
})
const listsStore = useListsStore()
const navOpen = useNav()
const { smAndDown } = useDisplay()
const dialog = useDialog()

async function createNewList() {
  newList.value.userId = data?.value?.user?._id ? data?.value?.user?._id : data?.value?.user?.sub

  const list = await listsStore.addList(newList.value)

  if (list) {
    newList.value = {
      name: '',
      todos: [],
      _id: undefined,
    }
    dialog.value.open = false
    if (smAndDown.value) {
      navOpen.value = false
    }
    await navigateTo(`/list/${list._id}`)
  }
}
</script>

<template>
  <AppDialog
    :open="dialog.page === 'list' && dialog.open"
    title="Create List"
    @close="dialog.open = false"
  >
    <template #open />
    <v-container
      justify-center
      style="overflow-y: hidden;"
    >
      <v-text-field
        v-model="newList.name"
        autofocus
        placeholder="New List"
        @keyup.enter="createNewList"
      />
    </v-container>
    <template #buttons>
      <v-btn
        :disabled="!newList.name.length"
        color="primary"
        variant="tonal"
        @click="createNewList"
      >
        Save
      </v-btn>
    </template>
  </AppDialog>
</template>
