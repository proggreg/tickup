<script setup lang="ts">
const { smAndDown } = useDisplay()
const { title, open } = defineProps<{
  title?: string,
  open: boolean
}>()
const emit = defineEmits(['close'])

</script>

<template>
  <v-dialog
max-width="500" :model-value="open" :fullscreen="smAndDown" transition="dialog-bottom-transition"
    location="top" @update:model-value="emit('close')">
    <template #activator>
      <slot name="open" />
    </template>

    <v-card class="pa-12">
      <v-card-title class="font-weight-bold">
        {{ title }}
      </v-card-title>
      <slot />
      <v-card-actions>
        <v-spacer />
        <v-btn @click="emit('close')">
          Close
        </v-btn>
        <slot name="buttons" />

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
