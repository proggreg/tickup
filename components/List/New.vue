<script setup lang="ts">
const listsStore = useListsStore()
const navOpen = useNav()
const { smAndDown } = useDisplay()
const dialog = useDialog()

async function createNewList() {
  const list = await listsStore.addList()

  if (list) {
    listsStore.newReset()
    dialog.value.open = false
    if (smAndDown.value) {
      navOpen.value = false
    }
  }
}
</script>

<template>
  <AppDialog
    title="New List"
    page="list"
  >
    <template #open />
    <v-container
      justify-center
      style="overflow-y: hidden;"
    >
      <v-text-field
        v-model="listsStore.newList.name"
        autofocus
        placeholder="New List"
        @keyup.enter="createNewList"
      >
        <template #append>
          <div style="min-width: 150px">
            <ListType />
          </div>
        </template>
      </v-text-field>
    </v-container>
    <template #buttons>
      <v-btn
        :disabled="!listsStore.newList.name.length"
        color="primary"
        variant="tonal"
        @click="createNewList"
      >
        Save
      </v-btn>
    </template>
  </AppDialog>
</template>
