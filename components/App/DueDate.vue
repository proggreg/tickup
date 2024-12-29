<script setup lang="ts">
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
  <v-dialog location="top" :fullscreen="xs" class="ma-2" max-width="500">
    <template #activator="{ props }">
      <v-text-field
        v-if="dueDateProps.showDetail" v-bind="props" placeholder="date" class="text-h6" width="100%"
        :value="formattedDate" append-inner-icon="mdi-calendar" autocomplete="off"
      >
        <template #append-inner>
          <v-icon @click.stop="updateDueDate(null)">
            mdi-close
          </v-icon>
        </template>
      </v-text-field>
      <v-btn v-else v-bind="props" icon="mdi-calendar" variant="text" />
    </template>
    <template #default="{ isActive }">
      <v-icon style="position: absolute; right: 0; margin: 15px" @click="isActive.value = false">
        mdi-close
      </v-icon>
      <v-date-picker width="100%" @update:model-value="(val: unknown) => updateDueDate(val)" />
    </template>
  </v-dialog>
</template>

<style>
.v-picker__body {
  max-width: 100%;
}
</style>
