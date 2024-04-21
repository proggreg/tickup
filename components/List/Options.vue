<script setup lang="ts">
const store = useListsStore()
const { params } = useRoute()
const emit = defineEmits(['rename'])

const { size } = defineProps<{
  size: string
}>()
async function deleteList() {
  if (!params.id) return
  store.deleteList(params.id[0])
  await navigateTo('/')
}

function renameList() {
  emit('rename')
}
const options = reactive([{
  name: 'Rename',
  handler: renameList
}, {
  name: 'Delete',
  handler: deleteList
}])

</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-icon v-bind="props" :size="size">
        mdi-dots-horizontal
      </v-icon>
    </template>
    <v-list class="px-2">
      <v-list-item v-for="(option, index) in options" :key="index" :value="option.name" @click="option.handler">
        <v-list-item-title class="text-body-2">
          {{ option.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
