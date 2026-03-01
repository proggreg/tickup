<script setup lang="ts">
const isAddingTodo = ref(false);
const listsStore = useListsStore();
const statusStore = useSettingsStore();

interface Props {
    status: Status;
    selectedClass?: string;
}

const { status } = defineProps<Props>();

const todos = computed(() => {
    if (!listsStore.currentList || !listsStore.currentList.todos || !listsStore.currentList.todos.length || !status || !status.name) {
        return [];
    }
    return listsStore.currentList.todos.filter((todo: Todo) => todo.status === status.name);
});

function addTodo(status: Status) {
    listsStore.newTodo.status = status.name;
    listsStore.addTodo();
}
function updateStatus(todo: Todo, status: Status) {
    const index = statusStore.statuses.findIndex(s => s.name === status.name);
    if (index < statusStore.statuses.length) {
        todo.status = statusStore.statuses[index + 1].name;
        listsStore.updateTodo(todo);
    }
}

function handleBlur() {
    if (!listsStore.newTodo.name) {
        isAddingTodo.value = false;
    }
}

function handleDragChange(evt: any) {
    if (evt?.added?.element) {
        const todo = evt.added.element as Todo;
        if (todo.status !== status.name) {
            todo.status = status.name;
            listsStore.updateTodo(todo);
        }
    }
}
</script>

<template>
    <v-card
        :class="['mx-2 my-0 font-weight-bold', selectedClass, 'd-flex', 'flex-column', 'fill-height']"
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
                @change="handleDragChange"
            >
                <template #item="{ element: todo }">
                    <v-card
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
                            </div>
                        </v-card-item>
                    </v-card>
                </template>
            </draggable>
        </v-card-item>
        <v-card-item v-if="isAddingTodo">
            <v-card>
                <v-card-item>
                    <v-text-field
                        v-model="listsStore.newTodo.name"
                        placeholder="Add todo"
                        hide-details
                        class="ma-0 pa-0"
                        autofocus
                        variant="plain"
                        @blur="handleBlur"
                        @keyup.enter.stop="addTodo(status)"
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
