<script setup lang="ts">
const store = useListsStore()
const open = ref(false)

const optionProps = defineProps<{ listId: string, size?: string, list: List}>()
async function deleteList () {
  // throw new Error('Not implemented')
  await store.deleteList(optionProps.listId)
  open.value = true
}
const options = reactive([{
  name: 'Delete',
  handler: deleteList
}])
</script>
<template>
  <v-menu>
    <template #activator="{props}">
      <v-icon :data-cy="'list-options-' + list.name" v-bind="props">
        mdi-dots-horizontal
      </v-icon>
    </template>
    <v-list class="px-2">
      <v-list-item
        v-for="(option, index) in options"
        :key="index"
        :value="option.name"
        :data-cy="'list-option-' + option.name"
        @click="option.handler"
      >
        <v-list-item-title class="text-body1" style="font-size: 0.8rem;">
          {{ option.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
  <v-snackbar v-model="open" data-cy="snackbar">
    List Deleted
  </v-snackbar>
</template>
