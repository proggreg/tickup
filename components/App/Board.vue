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
  console.log('change', e, status)
  if (e.added) {
    console.log('added', e.added.element.status, status.name)
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

function dragEnd(e) {
  console.log('drag end: ', e)
  dragging.value = false
}

watch(groupedTodos, (groupedTodo) => {
  console.log('watch groupedTodo', groupedTodo)
})

function move(newContext, oldContext) {
  // console.log('move element', newContext, oldContext)
  // console.log('move to', newContext.relatedContext.component.componentData.name)
  // if (newContext.draggedContext.element.status !== newContext.relatedContext.component.componentData.name) {
  //   console.log('update todo')
  //   newContext.draggedContext.element.status = newContext.relatedContext.component.componentData.name
  //   // const response = await store.updateTodo(newContext.draggedContext.element)
  //   // console.log(response)

  //   return true
  // } else {
  //   console.log('dont move')
  //   return false
  // }
  return true

  // console.log('move context ', context)

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
            @end="dragEnd"
            :move="move"
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