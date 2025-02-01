<script setup lang="ts">
const settingsStore = useSettingsStore()
const listsStore = useListsStore()
const statuses = computed(() => settingsStore.statuses)
const search = ref('')

const headers = reactive([
  {
    title: 'Status', key: 'status', sortable: true, sort: (a: string, b: string) => {
      return settingsStore.statuses.findIndex(status => status.name === a) - settingsStore.statuses.findIndex(status => status.name === b)
    },
  },
  { title: 'Title', key: 'name', sortable: true },
  { title: 'Description', key: 'desc', sortable: true },
  { title: 'Date', key: 'dueDate', sortable: true },
  { title: 'Priority', key: 'actions', sortable: true },
])

function formatDate(date: Date) {
  if (!date) {
    return ''
  }
  return new Date(date).toLocaleDateString('en-GB')
}

function getStatusColor(todoStatus: string) {
  if (!statuses.value) return
  const status = statuses.value.filter(status => status.name === todoStatus)
  if (status.length > 0) {
    return status[0].color
  }
}

function handleRowClick(event, row: any) {
  console.log('clicked row', row)
  listsStore.setCurrentTodo(row.item)
  navigateTo(`/todo/${row.item._id}`)
}
</script>

<template>
  <v-card flat>
    <template #text>
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      />
    </template>

    <v-data-table
      :headers="headers"
      :items="listsStore.currentList.todos"
      :item-value="item => item._id"
      :search="search"
      show-select
      hover
      @click:row="handleRowClick"
    >
      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)">
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.name="{ item }">
        <span @clicked="console.log('clicked', item)">{{ item.name }}</span>
      </template>
      <template #item.actions="{ item }">
        <v-chip v-if="item.priority">
          {{ item.priority }}
        </v-chip>
      </template>

      <template #item.dueDate="{ item }">
        <span v-if="item.dueDate">
          {{ formatDate(item.dueDate) }}
        </span>
      </template>
    </v-data-table>
  </v-card>
</template>
