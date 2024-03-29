<script setup lang="ts">
const statuses = useSettingsStore().statuses
const store = useListsStore()
const dragging = ref(false)
const {data} = useAuth()
const route = useRoute()
const { todos } = defineProps<{ todos: Todo[] }>()
const newTodo = ref({
  name: '',
  userId: data.value?.user.id ? data.value?.user.id : data.value?.user.sub,
  listId: route.params.id,
})

const groupedTodos = computed(() => {

  return statuses.map((status) => {
    status.todos = todos.filter((todo) => todo.status === status.name).sort((a, b) => a.name - b.name)
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
    name: statusName
  };
}


function addTodo() {
  store.addTodo(newTodo.value)
  newTodo.value.name = ''
}

function handleBlur() {
  if (newTodo.value.name === '') {
    newTodo.value.status = ''
  } else {
    addTodo()
  }
}

</script>
<template>
  <v-row>
    <v-col
      v-for="status in groupedTodos" :key="status.name"
    >   
      <v-card class="ma-2" variant="tonal">
        <v-card-title>
          {{ status.name }}
        </v-card-title>
        <div>
          <draggable
            :list="status.todos"
            ghost-class="ghost"
            item-key="_id"
            group="status"
            :component-data="getComponentData(status.name)"
            @start="dragging = true"
            @end="dragging = false"
            @change="(e) => change(e, status)"
          >
            <template #item="{ element }">
              <v-card class="ma-2">
                <v-card-title v-if="element._id">
                  {{ element.name }}
                </v-card-title>
                <v-card-item v-else>
                  <v-text-field
                    v-model="element.name"
                    placeholder="Add todo"
                    hide-details
                    @keyup.enter="addTodo(element)"
                    />
                </v-card-item>
              </v-card>
            </template>
          </draggable>
        </div>

        <v-card v-if="newTodo.status === status.name" class="ma-2 px-4">
          <v-card-title>
            <v-text-field
              v-model="newTodo.name"
              placeholder="Add todo"
              variant="plain"
              :focused="true"
              hide-details
              class="pa-0"
              @keyup.enter="addTodo(newTodo)"
            />
          </v-card-title>
        </v-card>
        <v-card-actions>
       
          <v-btn
            color="primary"
            @click="newTodo.status = status.name"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<style>
  .ghost {
    opacity: 0.5;
  }
</style>