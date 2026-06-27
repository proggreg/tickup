<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const listsStore = useListsStore();
const parentTodo = ref<Todo | null>(null);
const isLoading = ref(true);
const transitionKey = ref(0);


async function loadTodo(id: string | string[]) {
  try {
    isLoading.value = true;

    const todo = await $fetch<Todo>(`/api/todo/${id}`);
    listsStore.setCurrentTodo(todo);

    // Explicitly fetch subtasks for this todo
    await listsStore.fetchSubtasks(id as string);

    // If this is a subtask, ensure we have the correct parent todo
    if (todo.parentId) {
      const needsNewParent = !parentTodo.value || parentTodo.value.id !== todo.parentId;
      if (needsNewParent) {
        parentTodo.value = await $fetch<Todo>(`/api/todo/${todo.parentId}`);
      }
    }
    else {
      // No parent for this todo
      parentTodo.value = null;
    }

    if (todo && todo.listId) {
      const list = await $fetch<List>(`/api/list/${todo.listId}`);
      listsStore.setCurrentList(list);
    }

    // Only bump the transition key once everything for this todo is loaded,
    // so the fade happens between fully-rendered states.
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

const backTo = computed(() => {
  if (parentTodo.value) return `/todo/${parentTodo.value.id}`;
  if (listsStore.currentTodo?.listId) return `/list/${listsStore.currentTodo.listId}`;
  return '/';
});

const backLabel = computed(() => {
  if (parentTodo.value) return parentTodo.value.name;
  if (listsStore.currentList?.name) return listsStore.currentList.name;
  return 'Home';
});

const backTestId = computed(() => {
  if (parentTodo.value) return 'nav-back-parent';
  if (listsStore.currentTodo?.listId && listsStore.currentList?.id) return 'nav-back-list';
  return 'nav-back-home';
});
</script>
<template>
  <div class="breadcrumb-bar">
    <NuxtLink v-if="!isLoading" :data-testid="backTestId" @click="router.back" class="breadcrumb-back">
      <i class="mdi mdi-arrow-left breadcrumb-back__icon" />
    </NuxtLink>
    <div v-if="!isLoading" class="breadcrumb-trail">
      <NuxtLink :to="backTo" class="breadcrumb-segment breadcrumb-segment--parent">
        {{ backLabel }}
      </NuxtLink>
      <i class="mdi mdi-chevron-right breadcrumb-chevron" />
      <span class="breadcrumb-segment breadcrumb-segment--current">
        {{ listsStore.currentTodo?.name }}
      </span>
    </div>
  </div>
</template>
<style scoped>
.todo-fade-enter-active {
  transition: opacity 0.18s ease;
}

.todo-fade-enter-from {
  opacity: 0;
}

/* Breadcrumb bar */
.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
}

.breadcrumb-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.breadcrumb-back:hover {
  background: rgba(var(--v-border-color), 0.1);
  color: rgb(var(--v-theme-on-surface));
}

.breadcrumb-back__icon {
  font-size: 18px;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.breadcrumb-segment {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-segment--parent {
  color: rgba(var(--v-theme-on-surface), 0.55);
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb-segment--parent:hover {
  color: rgb(var(--v-theme-primary));
}

.breadcrumb-segment--current {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-chevron {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.35);
  flex-shrink: 0;
}

/* Page surface */
.todo-page-surface {
  background: #f7f9fb;
  min-height: calc(100vh - 120px);
  padding: 0 12px 40px;
}
</style>