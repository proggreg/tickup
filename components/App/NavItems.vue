<script setup lang="ts">
const store = useListsStore()
const editListName = ref('')
const emit = defineEmits(['open'])
const { isMobile } = useDevice()

function renameList(list: List) {
  console.log('renameList', list)
  store.updateList(list)
  editListName.value = ''
}

function rename(list: List) {
  console.log('rename', list)
  if (store.currentList._id === list._id) {
    store.currentList = list
  }
}

function openContextMenu(el: MouseEvent, list: List) {
  emit('open', el, list)
}
</script>

<template>
  <v-hover v-for="list in store.lists" :key="list._id">
    <template #default="{ props }">
      <v-list-item
        v-bind="props" :key="list._id"
        class="my-2 px-4 py-2"
        style="cursor: pointer;" :to="`/list/${list._id}`"

        @click.right.prevent="(el: any) => openContextMenu(el, list)"
      >
        <v-text-field
          v-if="editListName === list._id" v-model="list.name" class="font-weight-bold "
          autofocus variant="plain" @input.stop="() => rename(list)" @keyup.enter="renameList(list)"
          @blur="renameList(list)"
        />
        <v-list-item-title v-else>
          <span class="text-h5 text-sm-h6 text-capitalize  nav-item-title">{{ list.name }}</span>
        </v-list-item-title>
        <template #prepend>
          <v-icon v-if="list.icon">{{ list.icon }}</v-icon>
          <v-icon v-else>mdi-format-list-bulleted</v-icon>
        </template>
      </v-list-item>
      <v-divider v-if="isMobile" />
    </template>
  </v-hover>
</template>

<style scoped>
.nav-item-title {
  text-transform: capitalize !important;
  font-weight: bold;
  @media (min-width: 600px) {
    font-size: 1rem !important;
   }
}
</style>
