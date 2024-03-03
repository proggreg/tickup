<script
  setup
  lang="ts"
>
const statuses = useSettingsStore().statuses
const store = useListsStore()
const dragging = ref(false)

const groupedTodos = computed(() => {
  return statuses.map((status) => {
    status.todos = store.currentList.todos.filter((todo) => todo.status === status.name)
    return status
  })
})

async function change(e: any, status: any) {
  if (e.added) {
    if (e.added.element.status !== status.name) {
      e.added.element.status = status.name
      await store.updateTodo(e.added.element)
    }
  } else if (e.moved) {
    const orderedItems = status.todos.map((item: Todo, index: number) => ({
      ...item,
      order: index
    }));
    await $fetch(`/api/list/todos`, { method: 'PUT', body: { orderedItems } })
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
  <v-row style="height: 90%">
    <v-col
      v-for="status in groupedTodos"
      :key="status.name"
      class="d-flex flex-column mb-6 justify-start"
    >
      <v-card
        class="flex-grow-1 mb-6"
        color="secondary"
      >
        <v-card-title>
          {{ status.name }}
        </v-card-title>
        <div class="ma-2 fill-height">
          <draggable
            :list="status.todos"
            ghost-class="ghost"
            item-key="_id"
            group="status"
            :component-data="getComponentData(status.name)"
            @start="dragging = true"
            @end="dragging = false"
            @change="(e) => change(e, status)"
            @sort="(s) => console.log('sort', s)"
          >
            <template #item="{ element }">
              <v-card class="ma-2">
                <v-card-title>
                  {{ element.name }}
                </v-card-title>
                <v-card-item>
                  {{ element.desc }}
                </v-card-item>
              </v-card>
            </template>
          </draggable>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style>
.ghost {
  opacity: 0.5;
}
</style>