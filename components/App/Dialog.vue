<script setup lang="ts">
const { title } = defineProps<{
  title?: string
  page: string
}>()
const dialog = useDialog()
</script>

<template>
  <v-dialog
    max-width="500" :model-value="dialog.open && dialog.page === page" transition="dialog-bottom-transition"
    location="top" @update:model-value="dialog.open = false"
  >
    <template #activator>
      <slot name="open" />
    </template>

    <v-card class="" append-icon="mdi-close">
      <template #prepend>
        <v-card-title class="font-weight-bold">
          <span class="headline">{{ title }}</span>
        </v-card-title>
      </template>
      <template #append>
        <v-icon @click="dialog.open = false">mdi-close</v-icon>
      </template>

      <slot />
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
