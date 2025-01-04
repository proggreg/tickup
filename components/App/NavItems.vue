<script setup lang="ts">
const { smAndDown } = useDisplay()
const store = useListsStore()
const editListName = ref('')
const emit = defineEmits(['open'])

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
    <template #default="{ isHovering, props }">
      <v-list-item
        v-bind="props" :key="list._id" :variant="isHovering || smAndDown ? 'tonal' : 'text'" class="my-2 font-weight-bold"
        style="cursor: pointer;" :to="`/list/${list._id}`"
        @click.right.prevent="(el: any) => openContextMenu(el, list)"
      >
        <v-text-field
          v-if="editListName === list._id" v-model="list.name" class="font-weight-bold text-body-2"
          autofocus variant="plain" @input.stop="() => rename(list)" @keyup.enter="renameList(list)"
          @blur="renameList(list)"
        />
        <v-list-item-title v-else class="font-weight-bold text-body-2 text-capitalize">
          {{ list.name }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-hover>
</template>
