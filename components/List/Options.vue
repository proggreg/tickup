<script setup lang="ts">
const store = useListsStore()
const emit = defineEmits(['rename'])
const { listId } = defineProps<{
  listId: string,
}>()

async function deleteList() {
  if (listId) {
    await store.deleteList(listId)
    await navigateTo('/')
  }
}

function renameList() {
  emit('rename')
}
const options = reactive([{
  name: 'Rename',
  handler: renameList,
  icon: 'mdi-pencil',
}, {
  name: 'Delete',
  handler: deleteList,
  icon: 'mdi-delete',
  destructive: true,
}])
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn class="pa-0" v-bind="props" icon="mdi-dots-horizontal" variant="text" size="small" />
    </template>
    <v-list class="px-2">
      <v-list-item v-for="(option, index) in options" :key="index" :value="option.name" :append-icon="option.icon"
        :class="option.destructive ? 'text-red' : ''" @click.passive="option.handler">
        <v-list-item-title class="text-body-2">
          {{ option.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
