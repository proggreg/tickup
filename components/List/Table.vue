<script setup lang="ts">
const store = useListsStore();
const { statuses } = useSettingsStore();
const props = defineProps<{ list_id: string }>();
const newTodo = ref(null)
const dialog = ref(false);
const newTodoVariant = ref<'text' | 'outlined'>("text");
const openNewTodo = ref('');
const newTodoTitle = ref("");

const headers = [
  { title: "Title", key: "name", sortable: true },
  { title: "Description", key: "desc", sortable: true },
  { title: "Date", key: "dueDate", sortable: true },
  { title: "", key: "actions", sortable: false },
  { title: "Status", key: "status", sortable: true, sort: (a, b) => {
      return statuses.findIndex(status => status.name === a) - statuses.findIndex(status => status.name === b)
    }
  }, 
];

const group = ref([
  {
    key: "status",
    order: true, 
    title: "Status"
  },
]);

function showModal(todo: any) {
  store.setCurrentTodo(todo.raw);
  dialog.value = true;
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
      status,
      desc: "",
      list_id: props.list_id,
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

</script>

<template>
  <v-data-table
    :headers="headers"
    :items="store.currentList.todos"
    :group-by="group"
    multi-sort
    hover
    show-expand
    item-value="_id"
    items-per-page="-1"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title :text="store.currentList.name" />
        <v-spacer />
      </v-toolbar>
    </template>

    <template #headers="{ }" />

    <template #body="{ columns, groupedItems, toggleGroup, isGroupOpen, sortBy, toggleSort }">
      <template
        v-for="groupItem in groupedItems"
        :key="groupItem.key"
      >
        <tr v-if="groupItem.key === 'status'">
          <th :colspan="columns.length">
            <VBtn
              size="small"
              variant="text"
              :icon="isGroupOpen(groupItem) ? '$expand' : '$next'"
              @click="toggleGroup(groupItem)"
            />
            <VBtn
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
                  column.key !== 'actions'
                " 
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
          <tr
            v-for="item in groupItem.items"
            :key="item.key"
            @click="showModal(item)"
          >
            <td><ListStatus :todo="item.raw" /></td>
            <template
              v-for="column in columns"
              :key="column.key"
            >
              <template v-if="column.key !== 'data-table-group'">
                <td v-if="column.key === 'name' || column.key === 'desc'">
                  {{ item.columns[column.key] }}
                </td>
                <td v-else-if="column.key === 'dueDate'">
                  {{ formatDate(item.columns[column.key]) }}
                </td>
                <td v-else-if="column.key === 'actions'">
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    rounded="lg"
                    elevation="0"
                    small
                    @click.stop="deleteItem(item)"
                  />
                </td>
              </template>
            </template>
          </tr>
          <AppDialog
            :open="dialog"
            @close="dialog = false"
          >
            <TodoDetail />
          </AppDialog>

          <tr v-if="openNewTodo === '' || openNewTodo !== groupItem.value">
            <td colspan="5">
              <v-btn
                :variant="newTodoVariant"
                size="x-small"
                elevation="0"
                @click="openNewTodo = groupItem.value"
                @mouseover="newTodoVariant = 'outlined'"
                @mouseleave="newTodoVariant = 'text'"
              >
                Add Todo
              </v-btn>
            </td>
          </tr>
          <tr v-else-if="groupItem.value === openNewTodo">
            <td colspan="5">
              <v-text-field
                ref="newTodo"
                v-model="newTodoTitle"
                variant="plain"
                placeholder="new todo"
                @blur="createTodo(groupItem.value)"
                @keyup.enter="$event.target.blur()"
              />
            </td>
          </tr>
        </template>
      </template>
    </template>
    <template #bottom />
  </v-data-table>
</template>
<style scoped>
.table-header {
  /* display: flex; */

  padding: 0 !important;
}
</style>
```