<script setup lang="ts">
const store = useListsStore();
const { statuses } = useSettingsStore();
const { xs } = useDisplay()
let expanded = reactive(['Open'])
const opened = ref([])

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
])

const desktopHeaders = [{ title: "Description", key: "desc", sortable: true },
{ title: "Date", key: "dueDate", sortable: true },
{ title: "", key: "actions", sortable: false },
{
  title: "Status", key: "status", sortable: true, sort: (a: string, b: string) => {
    return statuses.findIndex(status => status.name === a) - statuses.findIndex(status => status.name === b)
  }
}]

const group = ref([
  {
    key: "status",
    order: true,
    title: "Status"
  },
]);

onMounted(() => {
  if (!xs.value) {
    headers.concat(desktopHeaders)
  }
})

</script>

<template>
  <v-data-table
    :headers="headers"
    :items="store.currentList.todos"
    :group-by="group"
    multi-sort
    hover
    show-expand
    :expanded="expanded"
    item-value="_id"
    items-per-page="-1"
    :opened="opened"
  >

    <template #headers="{ }" />

    <template #body="{ columns, groupedItems, toggleGroup, isGroupOpen, sortBy, toggleSort }">
      <template
        v-for="groupItem in groupedItems"
        :key="groupItem.key"
      >
       <ListTableGroupHeader
        :columns="columns" 
        :group-item="groupItem" 
        :is-group-open="isGroupOpen" 
        :toggle-group="toggleGroup"
        :my-toggle-group="myToggleGroup"
        :sort-by="sortBy"
        />
      
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