<script setup lang="ts">
const { groupItem, isGroupOpen, columns, toggleGroup, sortBy, toggleSort, expanded } = defineProps<{
  groupItem: any // Using any for now since Vuetify's internal types are complex
  isGroupOpen: (item: any) => boolean
  columns: any[] // Using any[] since Vuetify's internal header type is complex
  toggleGroup: (item: any) => void
  sortBy: any[] // Using any[] since Vuetify's internal sort type is complex
  toggleSort: (column: any) => void
  expanded: string[]
}>()
const { statuses } = useSettingsStore()
const headerColumns = ref(columns)
const { mdAndUp } = useDisplay()

onMounted(() => {
  if (!isGroupOpen(groupItem) && groupItem.key === 'status' && groupItem.value === 'Open') {
    console.log('Group is open:', groupItem)
    toggleGroup(groupItem)
  }
})

// TODO fix exapanded keep state
function getStatusColor(todoStatus: string) {
  const status = statuses.filter((status: Status) => status.name === todoStatus)
  if (status.length > 0) {
    return status[0].color
  }
}

function isSorted(sortBy: { key: string }[], column: { key: string }) {
  return sortBy.some(item => item.key === column.key)
}

function isSortedIndex(sortBy: { key: string, order: string }[], column: { key: string }) {
  let index = sortBy.findIndex(item => item.key === column.key)
  index++
  if (index > 0) {
    return index
  }
  return false
}
</script>

<template>
  <tr v-if="groupItem.key === 'status'">
    <th :colspan="2">
      <v-btn
        class="mr-4" style="font-size: 1.4rem" variant="text" :icon="isGroupOpen(groupItem) ? '$expand' : '$next'"
        size="x-small"
        @click="toggleGroup(groupItem)"
      />
      <v-btn
        size="x-small" :color="getStatusColor(groupItem.value)" variant="tonal" :text="groupItem.value"
        style="font-size: 1rem"
        @click="toggleGroup(groupItem)"
      />
    </th>
    <th colspan="8" />
  </tr>
  <template v-if="isGroupOpen(groupItem)">
    <tr v-if="mdAndUp">
      <th colspan="1" class="text-h6">
        Status
      </th>

      <template v-for="column in headerColumns" :key="column.key">
        <v-hover
          v-if="column.key !== 'data-table-group'
            && column.key !== 'data-table-expand'
            && column.key !== 'status'
            && column.key !== 'desc'
            && column.key !== 'dueDate'
            && column.key !== 'actions'
          "
        >
          <template #default="{ isHovering, props }">
            <th
              :style="isHovering ? 'cursor: pointer' : ''" v-bind="props" colspan="1" class="table-header text-h6"
              @click="toggleSort(column)"
            >
              <div style="display: flex;">
                {{ column.title }} {{ column.key }}
                <div style="width: 42px">
                  <v-icon v-if="isHovering && !isSorted(sortBy, column)">
                    mdi-arrow-up
                  </v-icon>

                  <template v-for="sort in sortBy" :key="sort.key">
                    <v-icon v-if="sort.key === column.key && sort.order === 'asc'">
                      mdi-arrow-up
                    </v-icon>
                    <v-icon v-if="sort.key === column.key && sort.order === 'desc'">
                      mdi-arrow-down
                    </v-icon>
                  </template>

                  <div v-if="isSortedIndex(sortBy, column)" class="v-data-table-header__sort-badge">
                    {{
                      isSortedIndex(sortBy, column) }}
                  </div>
                </div>
              </div>
            </th>
          </template>
        </v-hover>
      </template>

      <th colspan="8" />
    </tr>
    <ListTableItem :columns="columns" :group-item="groupItem" />
    <ListTableNewItem :group-item="groupItem" />
  </template>
</template>
