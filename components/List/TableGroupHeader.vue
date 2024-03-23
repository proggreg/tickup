<script setup lang="ts">
const { groupItem, isGroupOpen, columns, toggleGroup, myToggleGroup, sortBy, toggleSort } = defineProps(
  ['groupItem', 'isGroupOpen', 'columns', 'toggleGroup', 'myToggleGroup', 'sortBy', 'toggleSort'])
const { statuses } = useSettingsStore();

function getStatusColor(todoStatus: string) {
  const status = statuses.filter((status) => status.name === todoStatus);
  if (status.length > 0) {
    return status[0].color;
  }
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

</script>
<template>
   <tr v-if="groupItem.key === 'status'">
      <th :colspan="columns.length">
        <v-btn
          size="small"
          variant="text"
          :icon="isGroupOpen(groupItem) ? '$expand' : '$next'"
          @click="myToggleGroup(toggleGroup, groupItem)"
        />
        <v-btn
          size="x-small"
          :color="getStatusColor(groupItem.value)"
          variant="tonal"
          :text="groupItem.value"
          @click="toggleGroup(groupItem)"
        />
      </th>
  </tr>
  <template v-if="isGroupOpen(groupItem)">
          <tr>
            <th colspan="1">
              Status
            </th>
            <template
              v-for="column in columns"
              :key="column.key"
            >
              <v-hover
                v-if="column.key !== 'data-table-group' &&
                column.key !== 'data-table-expand' &&
                column.key !== 'actions'"
              >
                <template #default="{ isHovering, props }">
                  <th
                    :style="isHovering ? 'cursor: pointer' : ''"
                    v-bind="props"
                    colspan="1"
                    class="table-header"
                    @click="toggleSort(column)"
                  >
                    <div style="display: flex;">
                      {{ column.title }}
                      <div style="width: 42px">
                        <v-icon v-if="isHovering && !isSorted(sortBy, column)">
                          mdi-arrow-up
                        </v-icon>

                        <template
                          v-for="sort in sortBy"
                          :key="sort.key"
                        >
                          <v-icon v-if="sort.key === column.key && sort.order === 'asc'">
                            mdi-arrow-up
                          </v-icon>
                          <v-icon v-if="sort.key === column.key && sort.order === 'desc'">
                            mdi-arrow-down
                          </v-icon>
                        </template>

                        <div
                          v-if="isSortedIndex(sortBy, column)"
                          class="v-data-table-header__sort-badge"
                        >
                          {{
                            isSortedIndex(sortBy, column) }}
                        </div>
                      </div>
                    </div>
                  </th>
                </template>
              </v-hover>
            </template>
            <th colspan="1" />
          </tr>
          <ListTableItem :columns="columns" :group-item="groupItem" />
          <ListTableNewItem :group-item="groupItem" :list-id="listId" />
        </template>
</template>