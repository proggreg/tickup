<script setup lang="ts">
const { statuses } = useSettingsStore()
const store = useListsStore()
const dragging = ref(false)
const { data } = useAuth()
const route = useRoute()
const listStore = useListsStore()
const selected = ref('')
const showFooter = ref('')
const newTodo = ref({
  name: '',
  userId: data.value?.user.id ? data.value?.user.id : data.value?.user.sub,
  listId: route.params.id,
  status: '',
  edit: true,
})

const groupedTodos = computed(() => {
  return statuses.map((status) => {
    status.todos = store.currentList.todos.filter(todo => todo.status === status.name).sort((a, b) => a.name - b.name)
    return status
  })
})

async function change(e: Event, status: Status) {
  if (e.added) {
    if (e.added.element.status !== status.name) {
      e.added.element.status = status.name
      await store.updateTodo(e.added.element)
    }
  }
  else if (e.moved) {
    const orderedItems = status.todos.map((item: Todo, index: number) => ({
      ...item,
      order: index,
    }))
    await $fetch('/api/list/todos', { method: 'PUT', body: { orderedItems } })
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
  const savedTodo = await store.addTodo(newTodo.value)
  for (const status of statuses) {
    if (status.name === savedTodo.status) {
      status.todos.push(savedTodo)
    }
  }
  newTodo.value.name = ''
  newTodo.value.status = ''
}

function gotoTodo(todo: Todo) {
  // TODO temp turn off for testing
  return
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
  <v-slide-group
    v-model="selected"
    :show-arrows="true"
    class="fill-height"
  >
    <v-slide-group-item
      v-for="status in groupedTodos"
      :key="status.name"
      v-slot="{ toggle, selectedClass }"
      class="fill-height"
    >
      <v-card
        :class="['ma-2', selectedClass]"
        width="300"
        height="100%"
        variant="tonal"
        :title="status.name"
        :color="status.color"
        @click="toggle"
      >
        <template #append>
          <BoardOptions :status="status" />
        </template>
        <v-card-item
          class="flex-fill"
          style="overflow-y: auto; "
        >
          <draggable
            :list="status.todos"
            item-key="_id"
            group="status"

            :component-data="getComponentData(status.name)"
            auto-scroll
            @start="dragging = true"
            @end="dragging = false"
            @change="(e) => change(e, status)"
          >
            <template #item="{ element }">
              <v-card
                :color="status.color"
                class="px-4 ma-2"
                style="cursor: pointer"
                :title="element.name"
                @click="gotoTodo(element)"
              >
                <template
                  #append
                >
                  <v-checkbox
                    v-model="element.selected"
                    size="small"
                    density="compact"
                    hide-details
                    @click.stop
                    @mouseover="console.log('hovering')"
                  />
                </template>
              </v-card>
            </template>
            <template #footer>
              <v-card

                class="px-4 ma-2"
              >
                <v-card-item class="px-0">
                  <v-text-field
                    v-model="newTodo.name"
                    placeholder="Add todo"
                    hide-details
                    class="ma-0 pa-0"
                    autofocus
                    variant="text"
                    @blur="showFooter = ''"
                    @keyup.enter="addTodo(status.name)"
                  />
                </v-card-item>
              </v-card>
            </template>
          </draggable>
        </v-card-item>
        <v-card-actions>
          <v-btn
            class="px-4 mb-2"
            block
            append-icon="mdi-plus"
            variant="tonal"
            @click="toggleNewTodo(status.name)"
          >
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
