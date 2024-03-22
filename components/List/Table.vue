<script setup lang="ts">
const store = useListsStore();
const { statuses } = useSettingsStore();
const { listId } = defineProps<{ listId?: string }>();
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
        />
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
    </template>
    <template #bottom />
  </v-data-table>
</template>
<style scoped>
.table-header {
  padding: 0 !important;
}
</style>