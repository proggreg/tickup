<script setup lang="ts">
const { smAndDown } = useDisplay()
const store = useListsStore()
const navOpen = useNav()
const editListName = ref('')

async function navigate(list: List) {
  console.log('navigate to list')

  await navigateTo(`/list/${list._id}`)
  if (smAndDown.value) {
    navOpen.value = false
  }
}

function renameList(list: List) {
  store.updateList(list)
  editListName.value = ''
}

function rename(list: List) {
  console.log('rename list', list)
  if (store.currentList._id === list._id) {
    store.currentList = list
  }
}
</script>

<template>
  <v-hover v-for="list in store.lists">
    <template #default="{ isHovering, props }">
      <v-list-item v-bind="props" :key="list._id" :variant="isHovering ? 'tonal' : 'text'" class="my-2 font-weight-bold"
        style="cursor: pointer;" @click.passive="() => navigate(list)">
        <v-text-field v-if="editListName === list._id" v-model="list.name" class="font-weight-bold text-body-2" autofocus
          variant="plain" @input.stop="() => rename(list)" @keyup.enter="renameList(list)" @blur="renameList(list)" />
        <v-list-item-title v-else class="font-weight-bold text-body-2">
          {{ list.name }}
        </v-list-item-title>

        <template #append>
          <ListOptions v-if="list._id" :list-id="list._id" @rename="editListName = list._id" size="small" />
        </template>
      </v-list-item>
    </template>
  </v-hover>
</template>
