<script setup lang="ts">
const { smAndDown } = useDisplay()
const { title, open } = defineProps<{
  title?: string,
  open: boolean
}>()
const emit = defineEmits(['close'])

</script>

<template>
  <v-dialog max-width="500" :model-value="open"  transition="dialog-bottom-transition"
    location="top" @update:model-value="emit('close')">
    <template #activator>
      <slot name="open" />
    </template>

    <v-card class=""  append-icon="mdi-close" >
      <template #prepend>
        <v-card-title class="font-weight-bold">
          <span class="headline">{{ title }}</span>
        </v-card-title>
      </template>
      <template #append>
          <v-icon  @click="emit('close')">mdi-close</v-icon>
        </template>
      
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
