<script setup lang="ts">

const { smAndDown } = useDisplay()
const { lists, updateList } = useListsStore()
const navOpen = useNav()
const editListName = ref('')

async function selectList(list: List) {
  await navigateTo(`/list/${list._id}`)

  if (smAndDown.value) {
    navOpen.value = false
  }
}

function renameList(list: List) {
  updateList(list)
  editListName.value = ''
}

</script>
<template>
  <v-list-item v-for="list in lists" :key="list._id" class="my-2" link @click.passive="selectList(list)">
    <v-text-field v-if="editListName === list._id" v-model="list.name" variant="plain" @keyup.enter="renameList(list)"
      @blur="renameList(list)" />
    <v-list-item-title v-else>
      {{ list.name }}
    </v-list-item-title>

    <template #append>
      <ListOptions v-if="list._id" :list-id="list._id" @rename="editListName = list._id" />
    </template>
  </v-list-item>
</template>
