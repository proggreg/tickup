<script setup lang="ts">
const settingsStore = useSettingsStore()
const expanded = reactive(['Open', 'In Progress']) // TODO open status renders twice?
const opened = ref([])
// const { todos } = defineProps<{ todos: Todo[] }>()
const listsStore = useListsStore()

const headers = reactive([
  { title: 'Title', key: 'name', sortable: true },
  { title: 'Description', key: 'desc', sortable: true },
  { title: 'Date', key: 'dueDate', sortable: true },
  { title: '', key: 'actions', sortable: false },
  {
    title: 'Status', key: 'status', sortable: true, sort: (a: string, b: string) => {
      return settingsStore.statuses.findIndex(status => status.name === a) - settingsStore.statuses.findIndex(status => status.name === b)
    },
  },
])

const group = ref([
  {
    key: 'status',
    order: true,
    title: 'Status',
  },
])
</script>

<template>
  <v-data-table
    :headers="headers" :items="listsStore.currentList.todos" style="border-radius: 25px; margin-top: 1rem;"
    height="100%" hover :group-by="group" multi-sort show-expand item-value="_id" items-per-page="-1" :opened="opened"
  >
    <template #headers="{}" />
    <template #body="{ columns, groupedItems, toggleGroup, isGroupOpen, sortBy, toggleSort }">
      <template v-if="groupedItems.length">
        <template v-for="groupItem in groupedItems" :key="groupItem.key">
          <ListTableGroupHeader
            :columns="columns" :group-item="groupItem" :is-group-open="isGroupOpen"
            :toggle-group="toggleGroup" :sort-by="sortBy" :toggle-sort="toggleSort" :expanded="expanded"
          />
        </template>
      </template>
      <template v-else>
        <AppEmptyState />
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
