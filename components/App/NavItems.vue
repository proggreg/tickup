<script setup lang="ts">
const { smAndDown } = useDisplay()
const listsStore = useListsStore()
const navOpen = useNav()
const editList = ref('')

async function selectList(list: List) {
  await navigateTo(`/list/${list._id}`)

  if (smAndDown.value) {
    navOpen.value = false
  }
}

async function updateListName(list: List) {
  try {
    await listsStore.updateList(list)
    editList.value = ''
  } catch (error) {
    console.error(error)
  }

}


</script>

<template>
  <v-list>
    <v-list-item v-if="!listsStore.lists || !listsStore.lists.length">
      <v-list-item-title>No lists yet</v-list-item-title>
    </v-list-item>
    <v-list-item v-for="(list) in listsStore.lists" v-else :key="list._id" color="accent" fluid placeholder="My List"
      @click="selectList(list)">
      <v-list-item-title v-if="editList !== list._id" :id="list.name">
        {{ list.name }}
      </v-list-item-title>
      <v-text-field autofocus :ref="list.name" v-else v-model="list.name" @keyup.enter="updateListName(list)"
        @keyup.stop @keydown.stop @blur="updateListName(list)" />

      <template #append>
        <ListOptions v-if="list._id" :list-id="list._id" :list="list" @rename="editList = list._id" />
      </template>
    </v-list-item>
  </v-list>
</template>
<style scoped>
.nuxt-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
</style>
