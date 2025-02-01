<script setup lang="ts">
const { groupItem, isGroupOpen, columns, toggleGroup, sortBy, toggleSort, expanded } = defineProps(
  {
    groupItem: { type: Object, required: true },
    isGroupOpen: { type: Function, required: true },
    columns: { type: Array, required: true },
    toggleGroup: { type: Function, required: true },
    sortBy: { type: Array, required: true },
    toggleSort: { type: Function, required: true },
    expanded: { type: Array, required: true },
  })
const { statuses } = useSettingsStore()
const headerColumns = ref(columns)

onBeforeMount(() => {
  if (groupItem.value === 'Open' && !isGroupOpen(groupItem)) {
    toggleGroup(groupItem)
  }
})

// TODO fix exapanded keep state
function getStatusColor(todoStatus: string) {
  const status = statuses.filter(status => status.name === todoStatus)
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
        class="mr-4" style="font-size: 1.2rem" variant="plain" :icon="isGroupOpen(groupItem) ? '$expand' : '$next'"
        @click="toggleGroup(groupItem)"
      />
      <v-btn
        size="x-small" :color="getStatusColor(groupItem.value)" variant="tonal" :text="groupItem.value"
        @click="toggleGroup(groupItem)"
      />
    </th>
    <th colspan="8" />
  </tr>
  <template v-if="isGroupOpen(groupItem)">
    <tr>
      <th colspan="1">
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
              :style="isHovering ? 'cursor: pointer' : ''" v-bind="props" colspan="1" class="table-header"
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
