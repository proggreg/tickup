<script setup lang="ts">
const { groupItem, isGroupOpen, columns, toggleGroup, myToggleGroup, sortBy, toggleSort, expanded } = defineProps(
  ['groupItem', 'isGroupOpen', 'columns', 'toggleGroup', 'myToggleGroup', 'sortBy', 'toggleSort', 'expanded'])
const { statuses } = useSettingsStore();
const { xs } = useDisplay();
const headerColumns = ref(columns);

function getStatusColor(todoStatus: string) {
  const status = statuses.filter((status) => status.name === todoStatus);
  if (status.length > 0) {
    return status[0].color;
  }
}

function isSorted(sortBy: any, column: any) {
  return sortBy.some((item: any) => item.key === column.key);
}

function isSortedIndex(sortBy: any, column: any) {
  let index = sortBy.findIndex((item: any) => item.key === column.key);
  index++
  if (index > 0) {
    return index
  }
  return false
}

onMounted(() => {
  // TODO weird bug where closed will render twice
  if (expanded.includes(groupItem.value) && !isGroupOpen(groupItem)) {
    toggleGroup(groupItem)
  }
})

</script>
<template>
  <tr v-if="groupItem.key === 'status'">
    <th :colspan="headerColumns.length">
      <v-btn class="mr-4" style="font-size: 1.2rem" variant="plain" :icon="isGroupOpen(groupItem) ? '$expand' : '$next'"
        @click="toggleGroup(groupItem)" />
      <v-btn size="x-small" :color="getStatusColor(groupItem.value)" variant="tonal" :text="groupItem.value"
        @click="toggleGroup(groupItem)" />
    </th>
  </tr>
  <template v-if="isGroupOpen(groupItem)">
    <tr>
      <th colspan="1">
        Status
      </th>

      <template v-for="column in headerColumns" :key="column.key">
        <v-hover v-if="column.key !== 'data-table-group' &&
          column.key !== 'data-table-expand' &&
          column.key !== 'status' &&
          column.key !== 'desc' &&
          column.key !== 'dueDate' &&
          column.key !== 'actions'
        ">

          <template #default="{ isHovering, props }">
            <th :style="isHovering ? 'cursor: pointer' : ''" v-bind="props" colspan="1" class="table-header"
              @click="toggleSort(column)">
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
    </tr>
    <ListTableItem :columns="columns" :group-item="groupItem" />
    <ListTableNewItem :group-item="groupItem" />
  </template>
</template>