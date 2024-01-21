<script setup lang="ts">
const store = useListsStore()
const selectedSort = ref(null)
const sortOptions = ref([
  { text: 'Default', value: 'default' },
  { text: 'Priority', value: 'priority' },
  { text: 'Due Date', value: 'dueDate' }
])
const sortDirection = ref('ascending')

watch([selectedSort, sortDirection], ([newOption, newDirection]) => {
  store.sortByDate(newDirection)
})
const icon = ref('mdi-arrow-down')
function changeIcon () {
  if (sortDirection.value === 'ascending') {
    sortDirection.value = 'descending'
    icon.value = 'mdi-arrow-down'
  } else {
    sortDirection.value = 'ascending'
    icon.value = 'mdi-arrow-up'
  }
}
</script>

<template>
  <v-row>
    <v-col>
      <v-select
        v-model="selectedSort"
        :items="sortOptions"
        item-title="text"
        item-value="value"
        label="Sort By"
        outlined
      />
    </v-col>
    <v-col>
      <v-btn
        :icon="icon"
        @click="changeIcon"
      />
    </v-col>
  </v-row>
</template>
