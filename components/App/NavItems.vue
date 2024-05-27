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
    store.currentList = list;
  }
}

</script>
<template>
  <v-hover v-for="list in store.lists">
    <template v-slot:default="{ isHovering, props }">
      <v-list-item v-bind="props" :variant="isHovering ? 'tonal': 'text'" 
                  :key="list._id" class="my-2 font-weight-bold"
                  style="cursor: pointer;" 
                  @click.passive="() => navigate(list)" >
        <v-text-field @input.stop="() => rename(list)" v-if="editListName === list._id" 
                      v-model="list.name" class="font-weight-bold" autofocus 
                      variant="plain" @keyup.enter="renameList(list)" @blur="renameList(list)" />
        <v-list-item-title class="font-weight-bold" v-else>
          {{ list.name }}
        </v-list-item-title>

        <template #append>
          <ListOptions v-if="list._id" :list-id="list._id" @rename="editListName = list._id" />
        </template>
      </v-list-item>
  </template>
</v-hover>
</template>
