<script setup lang="ts">
const store = useListsStore()

const optionProps = defineProps<{ listId: string, size?: string}>()
async function deleteList () {
  store.deleteList(optionProps.listId)
  await navigateTo('/')
}
const options = reactive([{
  name: 'Delete',
  handler: deleteList
}])
</script>
<template>
  <v-menu>
    <template #activator="{props}">
      <v-icon v-bind="props">
        mdi-dots-horizontal
      </v-icon>
    </template>
    <v-list class="px-2">
      <v-list-item
        v-for="(option, index) in options"
        :key="index"
        :value="option.name"
        @click="option.handler"
      >
        <v-list-item-title class="text-body1" style="font-size: 0.8rem;">
          {{ option.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
