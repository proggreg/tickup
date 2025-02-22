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
  <v-virtual-scroll
    :item-size="1"
    :items="store.lists"
    class="pa-0 nav-items-scroll"
    height="100%"
  >
    <template #default="{ item }">
      <v-hover>
        <template #default="{ props }">
          <v-list-item
            v-bind="props" :key="item._id"
            class="my-2 px-4 py-2"
            style="cursor: pointer;" :to="`/list/${item._id}`"

            @click.right.prevent="(el: any) => openContextMenu(el, item)"
          >
            <v-text-field
              v-if="editListName === item._id" v-model="item.name" class="font-weight-bold "
              autofocus variant="plain" @input.stop="() => rename(item)" @keyup.enter="renameList(item)"
              @blur="renameList(item)"
            />
            <v-list-item-title v-else>
              <span class="text-h5 text-sm-h6 text-capitalize  nav-item-title">{{ item.name }}</span>
            </v-list-item-title>
            <template #prepend>
              <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
              <v-icon v-else>mdi-format-list-bulleted</v-icon>
            </template>
          </v-list-item>
          <v-divider v-if="isMobile" />
        </template>
      </v-hover>
    </template>
  </v-virtual-scroll>
</template>

<style scoped>
.nav-items-scroll {
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.nav-item-title {
  text-transform: capitalize !important;
  font-weight: bold;
  @media (min-width: 600px) {
    font-size: 1rem !important;
   }
}
</style>
