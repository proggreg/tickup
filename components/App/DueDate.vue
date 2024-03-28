<script setup lang="ts">
import type { AnyArray } from 'mongoose';

const emit = defineEmits(['setDate'])
const dueDateProps = defineProps<{ todoDueDate?: Date | string, todo: Todo, showDetail?: boolean }>()
const { xs } = useDisplay()
const formattedDate = computed(() => {
  if (dueDateProps.todoDueDate) {
    return new Date(dueDateProps.todoDueDate).toLocaleDateString('en-GB')
  }
})

function updateDueDate(newDate: Date | unknown) {
  const newTodo = Object.assign({}, dueDateProps.todo, { dueDate: newDate })
  emit('setDate', newDate, newTodo)
}

</script>
<template>
  <v-dialog
    location="top"
    :fullscreen="xs"
    class="ma-2"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-text-field
        v-if="dueDateProps.showDetail"
        style="min-width: 200px"
        v-bind="props"
        placeholder="date"
        class="text-h6"
        :value="formattedDate"
        append-icon="mdi-calendar"
        hide-details
        autocomplete="off"
      >
        <template #append-inner>
          <v-icon @click.stop="updateDueDate(null)">
            mdi-close
          </v-icon>
        </template>
      </v-text-field>
      <v-btn
        v-else
        v-bind="props"
        icon="mdi-calendar"
        variant="text"
        size="small"
      />
    </template>
    <template #default="{ isActive }">
      <v-icon
        style="position: absolute; right: 0; margin: 15px"
        @click="isActive.value = false"
      >
        mdi-close
      </v-icon>
      <v-date-picker
        width="100%"
        @update:model-value="(val: unknown) => updateDueDate(val)"
      />
    </template>

  </v-dialog>
</template>

<style>
.v-picker__body {
  max-width: 100%;
}
</style>