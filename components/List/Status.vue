<script setup lang="ts">
const { statuses } = useSettingsStore() 
const store = useListsStore()
const statusProps = defineProps<{todo: Todo}>()
function getStatusColor (todoStatus: string) {
  const status = statuses.filter(status => status.name === todoStatus)
  if (status.length > 0) {
    return status[0].color
  }
}

const updateStatus = (status: string) => {
  const updatedTodo = statusProps.todo
  updatedTodo.status = status
  store.updateTodo(updatedTodo)
}

</script>
<template>
  <v-menu>
    <template #activator="{props}">
      <v-btn
        v-bind="props"
        size="x-small"
        rounded="xl"
        :style="{
          backgroundColor: getStatusColor(statusProps.todo.status)
        }"
      />
    </template>
    <v-list min-width="200px">
      <v-list-item
        v-for="(status, index) in statuses"
        :key="index"
        :value="status.name"
        @click="updateStatus(status.name)"
      >
        <template #prepend>
          <v-btn
            size="x-small"
            rounded="xl"
            :style="{
              backgroundColor: status.color,
              marginRight: '8px'
            }"
          />
        </template>
        <v-list-item-title class="text-body-2">
          {{ status.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<style scoped>
.status-icon {
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
}

</style>
