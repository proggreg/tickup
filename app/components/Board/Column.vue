<script setup lang="ts">
const isAddingTodo = ref(false);
const listsStore = useListsStore();
const newTodo = ref<Todo>(createNewTodoState());
const statusStore = useSettingsStore();

interface Props {
    status: Status;
    selectedClass?: string;
}

const { status } = defineProps<Props>();

const todos = computed(() => {
    return listsStore.currentList.todos.filter((todo: Todo) => todo.status === status.name);
});

function addTodo() {
    newTodo.value.listId = listsStore.currentList.id;
    newTodo.value.status = status.name;
    listsStore.addTodo(newTodo.value);
    newTodo.value = createNewTodoState();
}
function updateStatus(todo: Todo, status: Status) {
    const index = statusStore.statuses.findIndex(s => s.name === status.name);
    if (index < statusStore.statuses.length) {
        todo.status = statusStore.statuses[index + 1].name;
        listsStore.updateTodo(todo);
    }
}

function handleBlur() {
    if (!newTodo.value.name) {
        isAddingTodo.value = false;
    }
}
</script>

<template>
    <v-card
        :class="['ma-2 font-weight-bold', selectedClass, 'flex-column']"
        width="100%"
        :max-width="400"
        variant="tonal"
        :color="status.color"
    >
        <template #title>
            <div class="d-flex align-center justify-space-between">
                <div>
                    {{ status.name }}
                    <v-btn
                        :ripple="false"
                        class="pa-0 ma-0"
                        width="20"
                        size="small"
                        variant="plain"
                        :color="status.color"
                        icon="mdi-plus"
                        @click="isAddingTodo = !isAddingTodo"
                    />
                </div>
                <BoardOptions :status="status" />
            </div>
        </template>
        <v-card-item class="flex-fill list">
            <draggable
                :list="todos"
                item-key="id"
                group="status"
                class="draggable-container"
            >
                <v-card
                    v-for="todo in todos"
                    :key="todo.id"
                    class="mb-2 pa-0"
                    :color="status.color"
                    style="cursor: pointer;"
                    :max-width="'100%'"
                    :to="`/todo/${todo.id}`"
                >
                    <v-card-item
                        class="py-2 px-4"
                    >
                        <div class="d-flex align-center justify-space-between">
                            <v-checkbox
                                v-model="todo.selected"
                                size="small"
                                density="compact"
                                hide-details
                                class="flex-shrink-0"
                                @click.stop
                            />
                            <span class="text-truncate text-body-1 font-weight-bold flex-grow-1 mr-2">{{ todo.name }}</span>
                            <v-btn
                                v-if="status.name !== statusStore.statuses[statusStore.statuses.length - 1].name"
                                icon="mdi-arrow-right"
                                variant="plain"
                                size="small"
                                @click="updateStatus(todo, status)"
                            />
                        </div>
                    </v-card-item>
                </v-card>
            </draggable>
        </v-card-item>
        <v-card-item v-if="isAddingTodo">
            <v-card>
                <v-card-item>
                    <v-text-field
                        v-model="newTodo.name"
                        placeholder="Add todo"
                        hide-details
                        class="ma-0 pa-0"
                        autofocus
                        variant="plain"
                        @blur="handleBlur"
                        @keyup.enter.stop="addTodo"
                    />
                </v-card-item>
            </v-card>
        </v-card-item>
    </v-card>
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

  /* Mobile-specific styles */
  @media (max-width: 768px) {
    :deep(.v-card) {
      min-width: 0 !important;
      width: 100% !important;
    }

    :deep(.v-card-item) {
      padding: 8px 12px !important;
    }

    :deep(.text-truncate) {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }
</style>
