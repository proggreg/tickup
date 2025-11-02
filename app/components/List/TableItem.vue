<script setup lang="ts">
  import AppDeleteButton from '../App/DeleteButton.vue'
  import ListStatus from './Status.vue'
  import type { Column, GroupItem, TableItem } from '../../types/table-item.types'
    
  const store = useListsStore()
  const { xs } = useDisplay()
  const props = defineProps<{
    groupItem: GroupItem
    columns: Column[]
  }>()

  
  function showModal(item: TableItem) {
    store.setCurrentTodo(item.raw)
    navigateTo(`/todo/${item.raw.id}`)
  }

  function formatDate(date: Date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-GB')
  }
</script>

<template>
  <tr
    v-for="item in props.groupItem.items"
    :key="item.key"
    class="table-row"
    tabindex="0"
    @click="showModal(item)"
  >
    <td class="status-cell">
      <ListStatus :todo="item.raw" />
    </td>
    <template v-for="column in props.columns" :key="column.key">
      <template v-if="column.key !== 'data-table-group'">
        <td v-if="column.key === 'name'" colspan="6" class="text-h6">
          <v-text class="text-h6 text-truncate" data-testid="todo-title" style="max-width: 250px; display: block;" lines="1">
            {{ item.columns[column.key] }}
          </v-text>
        </td>
        <td v-else-if="column.key === 'dueDate' && !xs" colspan="2" class="text-h6">
          <v-text class="text-h6 text-truncate" style="max-width: 120px; display: block;" lines="1">
            {{ formatDate(item.columns[column.key]) }}
          </v-text>
        </td>
        <td v-else-if="column.key === 'actions' && !xs" colspan="4" class="text-h6">
          <div class="d-flex justify-end">
            <v-checkbox
              v-model="item.raw.selected"
              size="small"
              density="compact"
              hide-details
              @click.stop
            />
            <AppDeleteButton :todo="item.raw" />
          </div>
        </td>
      </template>
    </template>
  </tr>
</template>

<style scoped>
.table-row {
  cursor: pointer;
}
.status-cell {
  width: 10px;
}
</style>
