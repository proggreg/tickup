<script setup lang="ts">
const listsStore = useListsStore();

type View = 'list' | 'table' | 'board';

const currentView = ref<View>('list');
const newTodoName = ref('');

onBeforeMount(async () => {
    await listsStore.getCurrentList();
    const defaultView = listsStore.currentList?.defaultView;
    if (defaultView && (['list', 'table', 'board'] as string[]).includes(defaultView)) {
        currentView.value = defaultView as View;
    }
});

if (!listsStore.currentList) {
    navigateTo('/');
}

if (listsStore.currentList) {
    useHead({ title: `TickUp:${listsStore.currentList.name}` });
}

const openCount = computed(
    () => listsStore.currentList?.todos?.filter((t: Todo) => t.status !== 'Closed').length ?? 0,
);

async function addTodo() {
    const name = newTodoName.value.trim();
    if (!name) return;
    listsStore.newTodo.name = name;
    await listsStore.addTodo();
    newTodoName.value = '';
}

const views: { key: View; icon: string; label: string }[] = [
    { key: 'list', icon: 'mdi-format-list-bulleted', label: 'List' },
    { key: 'table', icon: 'mdi-table', label: 'Table' },
    { key: 'board', icon: 'mdi-view-column-outline', label: 'Board' },
];
</script>

<template>
    <div class="overflow-y-auto fill-height flex-grow-1">
        <div
            class="mx-auto px-7 pt-7 pb-12"
            style="width: 100%"
        >
            <div>
                <!-- Header -->
                <v-row
                    no-gutters
                    align="center"
                    class="mb-4 flex-nowrap ga-3"
                >
                    <v-col class="overflow-hidden">
                        <h1 class="list-title text-truncate ma-0">
                            {{ listsStore.currentList?.name }}
                        </h1>
                    </v-col>
                    <v-col
                        cols="auto"
                        class="d-flex align-center ga-3 flex-shrink-0"
                    >
                        <span class="text-medium-emphasis text-body-2 font-weight-medium text-no-wrap">
                            {{ openCount }} open
                        </span>
                        <div class="view-switcher pa-1 rounded-lg d-flex">
                            <button
                                v-for="v in views"
                                :key="v.key"
                                class="view-btn d-flex align-center ga-1 px-3"
                                :class="{ 'view-btn--active': currentView === v.key }"
                                @click="currentView = v.key"
                            >
                                <v-icon size="15">
                                    {{ v.icon }}
                                </v-icon>
                                {{ v.label }}
                            </button>
                        </div>
                    </v-col>
                </v-row>

                <!-- Add task bar -->
                <div class="add-task-bar d-flex align-center px-4 mb-5 ga-3">
                    <v-icon
                        color="primary"
                        size="18"
                    >
                        mdi-plus
                    </v-icon>
                    <input
                        v-model="newTodoName"
                        placeholder="Add a task…"
                        class="add-task-input flex-grow-1"
                        @keydown.enter="addTodo"
                    >
                </div>
            </div>

            <!-- List view with optional side panel -->
            <template v-if="currentView === 'list'">
                <div class="d-flex ga-4">
                    <div class="flex-grow-1 overflow-hidden">
                        <ListSimple />
                    </div>
                    <Transition name="panel">
                        <TodoPanel
                            v-if="listsStore.panelOpen"
                            @close="listsStore.panelOpen = false"
                        />
                    </Transition>
                </div>
            </template>

            <div v-else-if="currentView === 'table'">
                <ListTable />
            </div>
            <Board v-else-if="currentView === 'board'" />
        </div>
    </div>
</template>

<style scoped>
.list-title {
  font-family: Manrope, sans-serif;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.01em;
  color: #2a3439;
}

.view-switcher {
  background: #f0f4f7;
}

.view-btn {
  height: 30px;
  border: none;
  cursor: pointer;
  font-family: Inter, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 7px;
  background: transparent;
  color: rgba(42, 52, 57, 0.6);
  transition:
    background 0.1s,
    color 0.1s,
    box-shadow 0.1s;
}

.view-btn--active {
  background: white;
  color: #005ac2;
  box-shadow: 0 1px 2px rgba(42, 52, 57, 0.1);
}

.add-task-bar {
  height: 44px;
  background: white;
  border: 1.5px solid rgba(113, 124, 130, 0.18);
  border-radius: 11px;
  box-shadow: 0 1px 2px rgba(42, 52, 57, 0.04);
}

.add-task-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: Inter, sans-serif;
  font-size: 0.9375rem;
  color: #2a3439;
  min-width: 0;
}

.add-task-input::placeholder {
  color: rgba(42, 52, 57, 0.4);
}

.panel-enter-active,
.panel-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.22s;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
