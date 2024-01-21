<script setup lang="ts">
const { smAndDown } = useDisplay()
const dialogProps = defineProps<{
  title?: string,
  open: boolean
}>()
const emit = defineEmits(['close'])

</script>

<template>
  <v-dialog max-width="500" :model-value="dialogProps.open" :fullscreen="smAndDown" transition="dialog-bottom-transition" @update:model-value="emit('close')">
    <template #activator>
      <slot name="open" />
    </template>

    <v-card>
      <slot />
      <v-card-actions>
        <v-btn @click="emit('close')">
          Close
        </v-btn>
        <slot name="buttons" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
