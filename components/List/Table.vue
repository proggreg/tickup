<script setup lang="ts">
const store = useListsStore();
const { statuses } = useSettingsStore();
let expanded = reactive(['Open'])

function showModal(todo: any) {
  store.setCurrentTodo(todo.raw);
  navigateTo(`/todo/${todo.raw._id}`);
}

function isSorted(sortBy, column) {
  return sortBy.some(item => item.key === column.key);
}

function isSortedIndex(sortBy, column) {
  let index = sortBy.findIndex(item => item.key === column.key);
  index++
  if (index > 0) {
    return index
  }
  return false
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

function getStatusColor(todoStatus: string) {
  const status = statuses.filter((status) => status.name === todoStatus);
  if (status.length > 0) {
    return status[0].color;
  }
}

async function createTodo(status: string) {
  if (newTodoTitle.value) {
    const newTodo: Todo = {
      name: newTodoTitle.value,
      _id: undefined,
      status,
      desc: "",
      listId: props.listId,
    };
    await store.addTodo(newTodo);
    newTodoTitle.value = ''

  } else {
    openNewTodo.value = ''
  }
  if (newTodo.value) {
    newTodo.value[0].focus()
  }
}

onMounted(() => {
  if (!xs.value) {
    headers.concat(desktopHeaders)
  }
})


function myToggleGroup(toggleGroup, groupItem) {
  toggleGroup(groupItem)
  if (expanded.includes(groupItem.value)) {
    expanded = expanded.filter((item) => item !== groupItem.value)
  } else {
    expanded.push(groupItem.value);
  }
}

const headers = reactive([
  { title: "Title", key: "name", sortable: true },
  { title: "Description", key: "desc", sortable: true },
  { title: "Date", key: "dueDate", sortable: true },
  { title: "", key: "actions", sortable: false },
  {
    title: "Status", key: "status", sortable: true, sort: (a: string, b: string) => {
      return statuses.findIndex(status => status.name === a) - statuses.findIndex(status => status.name === b)
    }
  }
])



const group = ref([
  {
    key: "status",
    order: true,
    title: "Status"
  },
]);


</script>

<template>
  <v-data-table :headers="headers" :items="todos" :group-by="group" multi-sort hover show-expand :expanded="expanded"
    item-value="_id" items-per-page="-1" :opened="opened">

    <template #headers="{ }" />

    <template #body="{ columns, groupedItems, toggleGroup, isGroupOpen, sortBy, toggleSort }">

      <template v-for="groupItem in groupedItems" :key="groupItem.key">
        <ListTableGroupHeader :columns="columns" :group-item="groupItem" :is-group-open="isGroupOpen"
          :toggle-group="toggleGroup" :my-toggle-group="myToggleGroup" :sort-by="sortBy" :toggle-sort="toggleSort" />

      </template>
    </template>
    <template #bottom />
  </v-data-table>
</template>
<style scoped>
.table-header {
  padding: 0 !important;
}
</style>