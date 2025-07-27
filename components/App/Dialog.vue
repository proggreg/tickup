<script setup lang="ts">
const { title } = defineProps<{
  title: string
  page: string
}>()
const dialog = useDialog()
const listsStore = useListsStore()
function resetState() {
  dialog.value.open = false
  dialog.value.page = ''
  console.log('dialog afterLeave')
  listsStore.newReset()
}
</script>

<template>
  <v-dialog
    max-width="500" :model-value="dialog.open && dialog.page === page" transition="dialog-bottom-transition"
    location="top" @update:model-value="dialog.open = false"
    @after-leave="resetState"
  >
    <template #activator>
      <slot name="open" />
    </template>

    <v-card append-icon="mdi-close">
      <template #prepend>
        <v-card-title class="font-weight-bold" data-testid="dialog-title">
          <span class="headline">{{ title }}</span>
        </v-card-title>
      </template>
      <template #append>
        <v-icon data-testid="dialog-close" @click="dialog.open = false">mdi-close</v-icon>
      </template>
      <v-card-item>
        <slot />
      </v-card-item>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog.open = false">
          Close
        </v-btn>
        <slot name="buttons" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
