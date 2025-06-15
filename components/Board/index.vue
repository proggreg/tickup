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
  color: 'inherit',
  links: [],
  order: 0, // Added missing required property
})

const groupedTodos = computed(() => {
  if (!statusStore.statuses || !listStore.currentList.todos || !listStore.currentList.todos.length) {
    return []
  }
  console.log('group todos', listStore.currentList.todos)
  return statusStore.statuses.map((status) => {
    return {
      ...status,
      todos: listStore.currentList.todos
        .filter(todo => todo.status === status.name),
      addTodo: newTodo.value.status === status.name,
    }
  })

  return []
})

const boardRef = ref<HTMLElement | null>(null)

const cardHeight = computed(() => {
  const boardElement = boardRef.value
  const parentElement = boardElement?.parentElement
  const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight
  console.log(`Calculating card height based on window size parentHeight ${parentHeight}`)
  return (parentHeight - 30) + 'px'
})

const cardWidth = computed(() => {
  const boardElement = boardRef.value
  const parentElement = boardElement?.parentElement
  const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth
  console.log(`Calculating card width based on window size parentWidth ${parentWidth}`)
  return (parentWidth / groupedTodos.value.length) + 'px'
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
  if (newTodo.value.name) {
    await listStore.addTodo(newTodo.value)
    newTodo.value.name = ''
    newTodo.value.status = ''
  }
}

function gotoTodo(todo: Todo) {
  listStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}

function toggleNewTodo(status: string) {
  newTodo.value.status = newTodo.value.status === status ? '' : status
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
  <v-slide-group ref="boardRef" :show-arrows="true" class="font-weight-bold">
    <v-slide-group-item v-for="status in groupedTodos" :key="status.name" v-slot="{ toggle, selectedClass }">
      <v-card :class="['ma-2 font-weight-bold', selectedClass, '', 'flex-column']" :height="cardHeight" width="100%"
        max-width="400" variant="tonal" :color="status.color" @click="toggle">
        <template #title>
          <div class="d-flex align-center justify-space-between">
            <div> 
              {{ status.name }}
              <v-btn :ripple="false" class="pa-0 ma-0" width="20" size="small" @click="toggleNewTodo(status.name)"
                variant="plain" :color="status.color" icon="mdi-plus"></v-btn>
            </div>
            <BoardOptions :status="status" />

          </div>
        </template>
        <v-card-item class="flex-fill fill-height list">
          <draggable v-model="status.todos" item-key="_id" group="status" @change="(e: any) => updateTodo(e, status)"
            class="draggable-container">
            @change="(e: any) => updateTodo(e, status)" style="min-height: 100% !important; overflow-y: auto;">
            <template #item="{ element }">
              <v-card :id="element._id" class="mb-2 pa-0" :color="status.color" style="cursor: pointer;"
                :max-width="cardWidth" @click="gotoTodo(element)">
                <v-card-item class="py-2 px-4">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-truncate text-body-1 font-weight-bold">{{ element.name }}</span>
                    <v-checkbox v-model="element.selected" size="small" density="compact" hide-details @click.stop />
                  </div>
                </v-card-item>

              </v-card>
            </template>
            <template v-if="status.addTodo" #footer>
              <v-card class="px-4">
                <v-card-item class="px-0">
                  <v-text-field v-model="newTodo.name" placeholder="Add todo" hide-details class="ma-0 pa-0" autofocus
                    variant="plain" @blur="newTodo.status = ''" @keyup.enter.stop="addTodo(status.name)" />
                </v-card-item>
              </v-card>
            </template>
          </draggable>
        </v-card-item>
      </v-card>
    </v-slide-group-item>
  </v-slide-group>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background-color: inherit;
}

:deep(.v-card-title) {
  font-weight: bold !important;
}

.list :deep(.v-card-item__content:first-child) {
  height: 100% !important;

  .draggable-container {
    min-height: 100%;
    overflow-y: auto;
  }
}
</style>
