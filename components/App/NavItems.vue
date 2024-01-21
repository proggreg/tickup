<script setup lang="ts">
const { smAndDown } = useDisplay()
const listsStore = useListsStore()
const navOpen = useNav()

async function selectList (list: List) {
  await navigateTo(`/list/${list._id}`)

  if (smAndDown.value) {
    navOpen.value = false
  }
}

</script>

<template>
  <v-list>
    <v-list-item v-if="!listsStore.lists || !listsStore.lists.length">
      <v-list-item-title>No lists yet</v-list-item-title>
    </v-list-item>
    <v-list-item
      v-for="(list, i) in listsStore.lists"
      v-else
      :key="i"
      color="accent"
      rounded="lg"
      fluid
      :value="i"
      placeholder="My List"
      @click="selectList(list)"
    >
      <v-list-item-title>{{ list.name }}</v-list-item-title>

      <template #append>
        <ListOptions v-if="list._id" :list-id="list._id" />
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
