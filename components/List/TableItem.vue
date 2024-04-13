<script setup lang="ts">
const { groupItem, columns } = defineProps(['groupItem', 'columns'])
const store = useListsStore()
const { xs } = useDisplay()

function showModal(todo: any) {
  store.setCurrentTodo(todo.raw);
  navigateTo(`/todo/${todo.raw._id}`);
}
function formatDate(date: Date) {
  if (!date) {
    return "";
  }
  return new Date(date).toLocaleDateString("en-GB");
}

function deleteItem(todo: Todo) {
  if (todo.value) {
    store.deleteTodo(todo.value);
  }
}
</script>
<template>
  <tr v-for="item in groupItem.items" :key="item.key" style="cursor: pointer" @click="showModal(item)">
    <td>
      <ListStatus :todo="item.raw" />
    </td>
    <template v-for="column in columns" :key="column.key">
      <template v-if="column.key !== 'data-table-group'">
        <td v-if="column.key === 'name' || (column.key === 'desc' && !xs)">
          {{ item.columns[column.key] }}
        </td>
        <td v-else-if="column.key === 'dueDate' && !xs">
          {{ formatDate(item.columns[column.key]) }}
        </td>
        <td v-else-if="column.key === 'actions' && !xs">
          <v-btn icon="mdi-delete" variant="text" rounded="lg" elevation="0" small @click.stop="deleteItem(item)" />
        </td>
      </template>
    </template>
  </tr>
</template>