<script setup lang="ts">
const statusStore = useSettingsStore()
const dragging = ref(false)
const { data } = useAuth()
const route = useRoute()
const listStore = useListsStore()
const showFooter = ref('')
const newTodo = ref<Todo>({
  name: '',
  userId: data.value?.user.id || data.value?.user?.sub,
  listId: route.params.id as string,
  status: '',
  edit: true,
  selected: false,
  color: 'grey',
  links: [],
})

const groupedTodos = computed(() => {
  if (statusStore.statuses) {
    return statusStore.statuses.map((status) => {
      return {
        ...status,
        todos: listStore.currentList.todos
          .filter(todo => todo.status === status.name),
        addTodo: newTodo.value.status === status.name,
      }
    })
  }
  return []
})

async function updateTodo(e: { added?: { element: Todo } }, status: Status) {
  if (e.added) {
    if (e.added.element.status !== status.name) {
      const index = listStore.currentList.todos.findIndex((todo: Todo) => todo._id === e.added?.element._id)
      listStore.currentList.todos[index].status = status.name

      const updatedTodo = {
        ...e.added.element,
        status: status.name,
      }
      await listStore.updateTodo(updatedTodo)
    }
  }
}

function getComponentData(statusName: string) {
  return {
    wrap: true,
    name: statusName,
  }
}

async function addTodo(status: string) {
  newTodo.value.status = status
  await listStore.addTodo(newTodo.value)
  newTodo.value.name = ''
  newTodo.value.status = ''
}

function gotoTodo(todo: Todo) {
  listStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}

function toggleNewTodo(status: string) {
  newTodo.value.status = status
  if (newTodo.value.name) {
    addTodo(status)
  }
  else {
    showFooter.value = showFooter.value === status ? '' : status
  }
}

watch(dragging, (isDragging) => {
  if (isDragging) {
    document.body.style.cursor = 'grabbing'
  }
  else {
    document.body.style.cursor = 'auto'
  }
})
</script>

<template>
  <v-slide-group :show-arrows="true" class="fill-height">
    <v-slide-group-item v-for="status in groupedTodos" :key="status.name" v-slot="{ toggle, selectedClass }">
      <v-card
        :class="['ma-2', selectedClass, '', 'flex-column']" width="300" variant="tonal" :title="status.name"
        :color="status.color" @click="toggle"
      >
        <template #append>
          <BoardOptions :status="status" />
        </template>
        <v-card-item class="flex-fill" style="overflow-y: auto; ">
          <draggable
            v-model="status.todos" item-key="_id" group="status"
            :component-data="getComponentData(status.name)" auto-scroll @start="dragging = true" @end="dragging = false"
            @change="(e: any) => updateTodo(e, status)"
          >
            <template #item="{ element }">
              <v-card
                class="mb-2" :color="status.color" style="cursor: pointer" :title="element.name"
                @click="gotoTodo(element)"
              >
                <template #append>
                  <v-checkbox v-model="element.selected" size="small" density="compact" hide-details @click.stop />
                </template>
              </v-card>
            </template>
            <template v-if="status.addTodo" #footer>
              <v-card class="px-4 ma-2">
                <v-card-item class="px-0">
                  <v-text-field
                    v-model="newTodo.name" placeholder="Add todo" hide-details class="ma-0 pa-0" autofocus
                    variant="plain" @blur="newTodo.status = ''" @keyup.enter.stop="addTodo(status.name)"
                  />
                </v-card-item>
              </v-card>
            </template>
          </draggable>
        </v-card-item>
        <v-card-actions class="mt-auto">
          <v-btn class="px-4 mb-2" block append-icon="mdi-plus" variant="tonal" @click="toggleNewTodo(status.name)">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-slide-group-item>
  </v-slide-group>
</template>

<style>
.ghost {
  opacity: 0.5;
}
</style>
