<script setup lang="ts">
import { onMounted, nextTick, watch } from 'vue'

const settingsStore = useSettingsStore()
const listsStore = useListsStore()

// Track expanded groups
const expanded = ref<string[]>(['Open'])
const opened = ref<string[]>([])

// Store table functions
const tableGroupFns = ref<{
  toggleGroup?: (item: any) => void
  isGroupOpen?: (item: any) => boolean
}>({})

// Handle initial expansion
onMounted(() => {
  nextTick(() => {
    const { toggleGroup, isGroupOpen } = tableGroupFns.value
    const openGroup = { key: 'status', value: 'Open' }

    if (toggleGroup && isGroupOpen) {
      const isOpen = isGroupOpen(openGroup)

      if (!isOpen) {
        toggleGroup(openGroup)
      }
    }
  })
})


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
    v-model:expanded="expanded"
    :headers="headers"
    :items="listsStore.currentList.todos"
    hover
    :group-by="group"
    multi-sort
    show-expand
    item-value="_id"
    items-per-page="-1"
    :opened="opened"
    :default-expanded="['Open']"
    variant="plain"
  >
    <template #headers="{}" />
    <template #body="{ columns, groupedItems, toggleGroup, isGroupOpen, sortBy, toggleSort }">
      <template v-if="groupedItems.length">
        <template v-for="groupItem in groupedItems" :key="groupItem.key">
          <ListTableGroupHeader
            :columns="columns" :group-item="groupItem"
            :is-group-open="isGroupOpen"
            :toggle-group="toggleGroup"
            :sort-by="sortBy"
            :toggle-sort="toggleSort"
            :expanded="expanded"
            @vue:mounted="tableGroupFns.value = { toggleGroup, isGroupOpen }"
          />
        </template>
      </template>
      <template v-else>
        <div class="pa-4">
          <TodoNew :save-todo="false" />
        </div>
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
