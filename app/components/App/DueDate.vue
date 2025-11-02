<script setup lang="ts">
const emit = defineEmits(['setDate'])
const dueDateProps = defineProps<{ todoDueDate?: Date | string, todo: Todo, showDetail?: boolean }>()
const { xs } = useDisplay()
const formattedDate = computed(() => {
  if (dueDateProps.todoDueDate) {
    return new Date(dueDateProps.todoDueDate).toLocaleDateString('en-GB')
  }
  return ''
})

function updateDueDate(newDate: Date | unknown) {
  const newTodo = Object.assign({}, dueDateProps.todo, { dueDate: newDate })
  emit('setDate', newDate, newTodo)
}
</script>

<template>
  <v-dialog location="top" class="ma-2" max-width="500">
    <template #activator="{ props }">
      <v-text-field
        v-if="dueDateProps.showDetail" v-bind="props" placeholder="date" width="100%"
        :value="formattedDate" autocomplete="off"
      >
        <template #append-inner>
          <v-icon :color="$colorMode.preference === 'dark' ? 'white': 'black'" @click.stop="updateDueDate(null)">
            mdi-close
          </v-icon>
          <v-icon :color="$colorMode.preference === 'dark' ? 'white': 'black'" @click.stop="updateDueDate(null)">
            mdi-calendar
          </v-icon>
        </template>
      </v-text-field>
      <v-btn v-else v-bind="props" icon="mdi-calendar" variant="text" />
    </template>
    <template #default="{ isActive }">
      <v-icon :color="$colorMode.preference === 'dark' ? 'white': 'black'" style="position: absolute; right: 0; margin: 15px" @click="isActive.value = false">
        mdi-close
      </v-icon>
      <v-date-picker width="100%" @update:model-value="(val: unknown) => updateDueDate(val)" />
    </template>
  </v-dialog>
</template>

<style scoped>
.v-picker__body {
  max-width: 100%;

}

.v-btn :deep(.v-btn__content) {
  @media (max-width: 600px) {
    font-size: 1rem;
  }
}

.v-icon {
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-left: 5px;
  }
}

.v-text-field :deep(.v-field__input) {
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
}
</style>
