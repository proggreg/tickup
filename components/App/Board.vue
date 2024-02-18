<script setup lang="ts">
const statuses = useSettingsStore().statuses
const store = useListsStore()
const dragging = ref(false)

const groupedTodos = computed(() => {
  return statuses.map((status) => {
    status.todos = store.currentList.todos.filter((todo) => todo.status === status.name)
    return status
  })
})

function change(e, status) {
  if (e.added) {
    if (e.added.element.status !== status.name) {
      e.added.element.status = status.name
      store.updateTodo(e.added.element)
    }
  }
}


function getComponentData(statusName: string) {
  return {
    wrap: true,
    name: statusName,
    class: 'fill-height'
  };
}



</script>
<template>
  <v-row class="fill-height">
    <v-col
      v-for="status in groupedTodos"
      :key="status.name"
    >
      <v-card
        class="fill-height"
        color="secondary"
      >
        <v-card-title>
          {{ status.name }}
        </v-card-title>
        <div class="ma-2 fill-height">
          <draggable
            :list="status.todos"
            item-key="name"
            @start="dragging = true"
            @end="dragging = false"
            group="status"
            @change="(e) => change(e, status)"
            :componentData="getComponentData(status.name)"
          >
            <template #item="{ element }">
              <v-card class="ma-2">
                <v-card-title>
                  {{ element.name }}
                </v-card-title>
              </v-card>
            </template>
          </draggable>
        </div>

      </v-card>
    </v-col>
  </v-row>
</template>