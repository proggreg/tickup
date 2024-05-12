<script setup lang="ts">
const store = useListsStore()
const { params } = useRoute()
const emit = defineEmits(['rename'])
const { size } = defineProps<{
  size?: string
}>()

async function deleteList() {
  if (params.id) {
    await store.deleteList(params.id.toString())
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
      <v-btn v-bind="props" icon="mdi-dots-horizontal" variant="text" :size="size" />
    </template>
    <v-list class="px-2">
      <v-list-item v-for="(option, index) in options" 
      :key="index" :value="option.name"
      :append-icon="option.icon" 
      :class="option.destructive ? 'text-red' : ''"
      @click="option.handler">
        <v-list-item-title class="text-body-2">
          {{ option.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
