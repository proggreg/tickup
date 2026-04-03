<script setup lang="ts">
const listsStore = useListsStore();
const { isTodoClosed } = useTodoStatus();
const { selectTodo, setClosed, setOpen, formatDate } = useTodoActions();

const todayOpen = computed(() =>
    listsStore.todaysTodos.filter(t => !isTodoClosed(t.status)),
);
const todayDone = computed(() =>
    listsStore.todaysTodos.filter(t => isTodoClosed(t.status)),
);

const quickAddName = ref('');
async function quickAdd() {
    if (!quickAddName.value.trim()) return;
    listsStore.newTodo.name = quickAddName.value.trim();
    await listsStore.addTodo();
    quickAddName.value = '';
}

onBeforeMount(() => {
    listsStore.getTodaysTodos();
    listsStore.getOverdueTodos();
});
</script>

<template>
    <!-- Main scrollable content, padded for bottom nav -->
    <div class="mobile-dashboard pb-24">
        <!-- KPI Bento 2x2 grid -->
        <section class="px-4 pt-2 pb-6">
            <v-row dense>
                <v-col cols="6">
                    <v-card class="bento-card bento-overdue pa-4" rounded="xl" elevation="0">
                        <div class="text-caption font-weight-bold text-uppercase text-error mb-3">
                            Overdue
                        </div>
                        <div class="d-flex align-end justify-space-between">
                            <span class="text-h3 font-weight-black">
                                {{ listsStore.overdueTodos.length }}
                            </span>
                            <div class="bento-icon-badge bento-icon-error">
                                <v-icon size="18" color="error">mdi-priority-high</v-icon>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card class="bento-card bento-today pa-4" rounded="xl" elevation="0">
                        <div class="text-caption font-weight-bold text-uppercase text-primary mb-3">
                            Due Today
                        </div>
                        <div class="d-flex align-end justify-space-between">
                            <span class="text-h3 font-weight-black">
                                {{ todayOpen.length }}
                            </span>
                            <div class="bento-icon-badge bento-icon-primary">
                                <v-icon size="18" color="primary">mdi-calendar-today</v-icon>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card class="bento-card bento-done pa-4" rounded="xl" elevation="0">
                        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3">
                            Done Today
                        </div>
                        <div class="d-flex align-end justify-space-between">
                            <span class="text-h3 font-weight-black text-medium-emphasis">
                                {{ todayDone.length }}
                            </span>
                            <div class="bento-icon-badge bento-icon-muted">
                                <v-icon size="18" color="medium-emphasis">mdi-check-circle</v-icon>
                            </div>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card class="bento-card bento-lists pa-4" rounded="xl" elevation="0">
                        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3">
                            Total Lists
                        </div>
                        <div class="d-flex align-end justify-space-between">
                            <span class="text-h3 font-weight-black">
                                {{ listsStore.lists.length }}
                            </span>
                            <div class="bento-icon-badge bento-icon-muted">
                                <v-icon size="18" color="medium-emphasis">mdi-format-list-bulleted</v-icon>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </section>

        <!-- Overdue Focus -->
        <section class="px-4 mb-8">
            <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-1 font-weight-bold">Overdue Focus</span>
                <v-chip color="error" size="x-small" variant="tonal" class="font-weight-bold text-uppercase">
                    Action Required
                </v-chip>
            </div>

            <div v-if="listsStore.overdueTodos.length" class="d-flex flex-column ga-2">
                <div
                    v-for="todo in listsStore.overdueTodos"
                    :key="todo.id"
                    class="mobile-task-card d-flex align-center ga-3 pa-4 rounded-xl"
                    @click="selectTodo(todo)"
                >
                    <div class="task-accent-bar bg-error rounded-pill flex-shrink-0" />
                    <div class="flex-grow-1 min-w-0">
                        <div class="text-body-2 font-weight-medium text-truncate">{{ todo.name }}</div>
                        <div class="text-caption text-medium-emphasis mt-0.5">
                            {{ todo.list?.name || 'No list' }} •
                            {{ todo.dueDate ? formatDate(todo.dueDate) : '' }}
                        </div>
                    </div>
                    <v-btn icon="mdi-dots-vertical" variant="text" size="x-small" color="medium-emphasis" @click.stop />
                </div>
            </div>
            <v-card v-else variant="flat" class="pa-4 text-center text-medium-emphasis rounded-xl" color="surface-variant">
                <v-icon size="20" class="mb-1">mdi-check-all</v-icon>
                <div class="text-caption">Nothing overdue!</div>
            </v-card>
        </section>

        <!-- Today -->
        <section class="px-4 mb-8">
            <div class="mb-3">
                <span class="text-body-1 font-weight-bold">Today</span>
            </div>

            <!-- Quick add -->
            <v-card class="mb-3 pa-2" rounded="xl" elevation="0" color="surface-variant">
                <div class="d-flex align-center ga-3 px-2 py-1">
                    <v-icon color="primary" size="20">mdi-plus</v-icon>
                    <input
                        v-model="quickAddName"
                        class="quick-add-input text-body-2 font-weight-medium flex-grow-1"
                        placeholder="Add a new task..."
                        @keyup.enter="quickAdd"
                    />
                </div>
            </v-card>

            <div v-if="todayOpen.length" class="d-flex flex-column ga-2">
                <div
                    v-for="todo in todayOpen"
                    :key="todo.id"
                    class="mobile-task-card d-flex align-center ga-3 pa-4 rounded-xl"
                    @click="selectTodo(todo)"
                >
                    <div
                        class="mobile-checkbox rounded flex-shrink-0"
                        @click.stop="setClosed(todo, 200)"
                    />
                    <div class="flex-grow-1 min-w-0">
                        <div class="text-body-2 font-weight-medium text-truncate">{{ todo.name }}</div>
                        <div v-if="todo.list?.name" class="text-caption text-medium-emphasis mt-0.5">
                            {{ todo.list.name }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis text-center pa-3">
                No tasks for today yet.
            </div>
        </section>

        <!-- Done Today -->
        <section class="px-4 mb-8">
            <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-1 font-weight-bold">Done Today</span>
            </div>

            <div v-if="todayDone.length" class="d-flex flex-column ga-2">
                <div
                    v-for="todo in todayDone"
                    :key="todo.id"
                    class="mobile-task-card d-flex align-center ga-3 pa-4 rounded-xl opacity-70"
                    @click="selectTodo(todo)"
                >
                    <v-icon color="success" size="20" class="flex-shrink-0" @click.stop="setOpen(todo, 200)">
                        mdi-check-circle
                    </v-icon>
                    <div class="flex-grow-1 min-w-0">
                        <div class="text-body-2 text-decoration-line-through text-medium-emphasis text-truncate">
                            {{ todo.name }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <v-card
                variant="outlined"
                class="pa-8 d-flex flex-column align-center text-center rounded-2xl"
                style="border-style: dashed; border-color: rgba(var(--v-border-color), 0.3);"
                elevation="0"
            >
                <v-avatar size="56" color="surface-variant" class="mb-3">
                    <v-icon size="28" color="medium-emphasis">mdi-celebration</v-icon>
                </v-avatar>
                <div class="text-body-2 font-weight-bold mb-1">Momentum is building</div>
                <div class="text-caption text-medium-emphasis" style="line-height: 1.5;">
                    No tasks completed yet. Take the first step.
                </div>
            </v-card>
        </section>
    </div>

    <!-- Bottom Navigation Bar -->
    <v-bottom-navigation
        class="bottom-nav"
        :elevation="0"
        height="72"
    >
        <v-btn to="/" value="home">
            <v-icon>mdi-home</v-icon>
            <span>Home</span>
        </v-btn>
        <v-btn to="/lists" value="lists">
            <v-icon>mdi-format-list-bulleted</v-icon>
            <span>Tasks</span>
        </v-btn>
        <v-btn to="/search" value="search">
            <v-icon>mdi-magnify</v-icon>
            <span>Search</span>
        </v-btn>
        <v-btn to="/settings" value="settings">
            <v-icon>mdi-cog-outline</v-icon>
            <span>Settings</span>
        </v-btn>
    </v-bottom-navigation>
</template>

<style scoped>
.mobile-dashboard {
    min-height: 100dvh;
}

/* Bento KPI cards */
.bento-card {
    border: 1px solid rgba(var(--v-border-color), 0.1);
    height: 128px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.bento-overdue {
    background: rgb(var(--v-theme-surface)) !important;
}
.bento-today {
    background: rgb(var(--v-theme-surface)) !important;
}
.bento-done, .bento-lists {
    background: rgba(var(--v-theme-surface-variant), 0.5) !important;
}

.bento-icon-badge {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.bento-icon-error { background: rgba(var(--v-theme-error), 0.1); }
.bento-icon-primary { background: rgba(var(--v-theme-primary), 0.1); }
.bento-icon-muted { background: rgba(var(--v-border-color), 0.15); }

/* Task cards */
.mobile-task-card {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.1);
    cursor: pointer;
    transition: background 0.15s;
}
.mobile-task-card:active {
    transform: scale(0.98);
}

.task-accent-bar {
    width: 4px;
    height: 40px;
}

/* Mobile checkbox */
.mobile-checkbox {
    width: 22px;
    height: 22px;
    border: 2px solid rgba(var(--v-border-color), 0.5);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}
.mobile-checkbox:hover {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.05);
}

/* Quick add input */
.quick-add-input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    color: inherit;
    font-family: inherit;
}
.quick-add-input::placeholder {
    color: rgba(var(--v-theme-on-surface), 0.4);
}

/* Bottom nav */
.bottom-nav {
    border-top: 1px solid rgba(var(--v-border-color), 0.15);
    backdrop-filter: blur(20px);
    background: rgba(var(--v-theme-surface), 0.9) !important;
    border-radius: 24px 24px 0 0;
}
</style>
