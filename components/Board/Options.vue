<script setup lang="ts">
const store = useListsStore()
const on = useToolbar()
const { status } = defineProps(['status'])
const selectAll = () => {
  for (const todo of store.currentList.todos) {
    if (todo.status === status.name) {
      todo.selected = true
    }
  }
  on.value = true
}

const unselectAll = () => {
  for (const todo of store.currentList.todos) {
    if (todo.status === status.name) {
      todo.selected = false
    }
  }
  on.value = true
}
</script>

<template>
  <div>
    <v-menu offset-y>
      <template #activator="{ props }">
        <v-btn
          class="pa-0"
          v-bind="props"
          icon="mdi-dots-horizontal"
          variant="text"
          size="small"
        />
      </template>
      <v-list>
        <v-list-item @click="selectAll">
          Select All
        </v-list-item>
        <v-list-item @click="unselectAll">
          Unselect All
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style>
/* Add your custom styles here */
</style>
