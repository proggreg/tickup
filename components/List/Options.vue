<script setup lang="ts">
const store = useListsStore()
const emit = defineEmits(['rename', 'delete'])

const optionProps = defineProps<{ listId: string, list?: List }>()
async function deleteList() {
  store.deleteList(optionProps.listId)
  await navigateTo('/')
}

async function renameList() {
  emit('rename')
}
const options = reactive([{
  name: 'Delete',
  handler: deleteList
}, {
  name: 'Rename',
  handler: renameList
}
])
</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-icon v-bind="props" :data-cp="list ? `option-btn-${list.name}` : ''">
        mdi-dots-horizontal
      </v-icon>
    </template>
    <v-list class="px-2">
      <v-list-item v-for="(option, index) in options" :key="index" :value="option.name" @click="option.handler"
        :data-cp="`option-menu-${option.name}`" :id="`option-menu-${option.name}`">
        <v-list-item-title class="text-body1" style="font-size: 0.8rem;">
          {{ option.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
