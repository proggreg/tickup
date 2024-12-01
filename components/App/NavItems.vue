<script setup lang="ts">
const { smAndDown } = useDisplay()
const store = useListsStore()
const navOpen = useNav()
const editListName = ref('')

async function navigate(list: List) {
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
  console.log('rename', list)
  if (store.currentList._id === list._id) {
    store.currentList = list
  }
}
</script>

<template>
  <v-hover v-for="list in store.lists" :key="list._id">
    <template #default="{ isHovering, props }">
      <v-list-item v-bind="props" :key="list._id" :variant="isHovering ? 'tonal' : 'text'" class="my-2 font-weight-bold"
        style="cursor: pointer;" :to="`/list/${list._id}`">
        <v-text-field v-if="editListName === list._id" v-model="list.name" class="font-weight-bold text-body-2"
          autofocus variant="plain" @input.stop="() => rename(list)" @keyup.enter="renameList(list)"
          @blur="renameList(list)" />
        <v-list-item-title v-else class="font-weight-bold text-body-2">
          {{ list.name }}
        </v-list-item-title>

        <template #append>
          <ListOptions v-if="list._id" :list-id="list._id" size="small" @rename="editListName = list._id" />
        </template>
      </v-list-item>
    </template>
  </v-hover>
</template>
