<script setup lang="ts">
import { Button } from '@vuetify/v0';

const route = useRoute();
const listsStore = useListsStore();
const parentTodo = ref<Todo | null>(null);
const isLoading = ref(true);
const transitionKey = ref(0);

async function loadTodo(id: string | string[]) {
    try {
        isLoading.value = true;

        const todo = await $fetch<Todo>(`/api/todo/${id}`);
        listsStore.setCurrentTodo(todo);

        await listsStore.fetchSubtasks(id as string);

        if (todo.parentId) {
            const needsNewParent = !parentTodo.value || parentTodo.value.id !== todo.parentId;
            if (needsNewParent) {
                parentTodo.value = await $fetch<Todo>(`/api/todo/${todo.parentId}`);
            }
        }
        else {
            parentTodo.value = null;
        }

        if (todo && todo.listId) {
            const list = await $fetch<List>(`/api/list/${todo.listId}`);
            listsStore.setCurrentList(list);
        }

        transitionKey.value++;
    }
    finally {
        isLoading.value = false;
    }
}

watch(
    () => route.params.id,
    (id) => {
        if (id) loadTodo(id);
    },
    { immediate: true },
);
</script>

<template>
    <NuxtErrorBoundary>
        <template #error="{ error }">
            <div class="error-alert">
                <i class="mdi mdi-alert-circle error-alert__icon" />
                {{ error }}
            </div>
        </template>
        <div class="todo-page-nav">
            <Button.Root
                v-if="parentTodo"
                class="back-btn"
                data-testid="nav-back-parent"
                :to="`/todo/${parentTodo.id}`"
            >
                <Button.Icon>
                    <i class="mdi mdi-arrow-left" />
                </Button.Icon>
                {{ parentTodo.name }}
            </Button.Root>
            <Button.Root
                v-else-if="listsStore.currentTodo?.listId && listsStore.currentList?.id"
                class="back-btn"
                data-testid="nav-back-list"
                :to="`/list/${listsStore.currentTodo.listId}`"
            >
                <Button.Icon>
                    <i class="mdi mdi-arrow-left" />
                </Button.Icon>
                {{ listsStore.currentList.name }}
            </Button.Root>
            <Button.Root
                v-else-if="!isLoading"
                class="back-btn"
                data-testid="nav-back-home"
                to="/"
            >
                <Button.Icon>
                    <i class="mdi mdi-arrow-left" />
                </Button.Icon>
                Home
            </Button.Root>
        </div>
        <div class="todo-page-content">
            <Transition name="todo-fade">
                <TodoDetail :key="transitionKey" />
            </Transition>
        </div>
    </NuxtErrorBoundary>
</template>

<style scoped>
.error-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    background: rgba(var(--v-theme-error), 0.1);
    color: rgb(var(--v-theme-error));
    font-size: 0.875rem;
    margin: 16px;
}

.error-alert__icon {
    font-size: 20px;
}

.todo-page-nav {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 8px;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    font-size: 0.9375rem;
    font-family: inherit;
    transition: background 0.1s;
    text-decoration: none;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.back-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.back-btn .mdi {
    font-size: 18px;
    flex-shrink: 0;
}

.todo-page-content {
    padding: 0 8px;
}

.todo-fade-enter-active {
    transition: opacity 0.18s ease;
}

.todo-fade-enter-from {
    opacity: 0;
}
</style>
