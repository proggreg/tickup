<script setup lang="ts">
const { groupItem, columns } = defineProps(['groupItem', 'columns'])
const store = useListsStore()
const { xs } = useDisplay()
interface TableTodo {
  raw: Todo
}

function showModal(todo: TableTodo) {
  store.setCurrentTodo(todo.raw)
  navigateTo(`/todo/${todo.raw._id}`)
}
function formatDate(date: Date) {
  if (!date) {
    return ''
  }
  return new Date(date).toLocaleDateString('en-GB')
}
</script>

<template>
  <tr v-for="item in groupItem.items" :key="item.key" style="cursor: pointer" @click="showModal(item)">
    <td colspan="1" style="width: 10px">
      <ListStatus :todo="item.raw" />
    </td>
    <template v-for="column in columns" :key="column.key">
      <template v-if="column.key !== 'data-table-group'">
        <td v-if="column.key === 'name' " colspan="7">
          {{ item.columns[column.key] }}
        </td>
        <td v-else-if="column.key === 'dueDate' && !xs">
          {{ formatDate(item.columns[column.key]) }}
        </td>
        <td v-else-if="column.key === 'actions' && !xs">
          <div class="d-flex">
            <AppDeleteButton :todo="item.raw" />
            <v-checkbox
              v-model="item.raw.selected" size="small" density="compact" hide-details @click.stop
            />
          </div>
        </td>
      </template>
    </template>
  </tr>
</template>
