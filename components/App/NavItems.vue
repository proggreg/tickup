<script setup lang="ts">
const store = useListsStore()
const editListName = ref('')
const emit = defineEmits(['open'])
const { isMobile } = useDevice()

function renameList(list: List) {
  store.updateList(list)
  editListName.value = ''
}

function rename(list: List) {
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
            class=""
            style="cursor: pointer;"
            data-test-id="nav-item"
            :to="`/list/${item._id}`"
          >
            <v-text-field
              v-if="editListName === item._id" v-model="item.name" class="font-weight-bold "
              autofocus variant="plain" @input.stop="() => rename(item)" @keyup.enter="renameList(item)"
              @blur="renameList(item)"
            />
            <v-list-item-title data-test-id="nav-item-title" v-else>
              {{ item.name }}
            </v-list-item-title>
            <template #prepend>
              <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
              <v-icon v-else>mdi-format-list-bulleted</v-icon>
            </template>
            <template #append>
              <list-settings-button :list-id="item._id" />
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
