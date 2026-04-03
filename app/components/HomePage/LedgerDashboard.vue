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

// Quick-add for today
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
    <v-container fluid class="ledger-dashboard pa-6">
        <!-- KPI Cards -->
        <v-row class="mb-8" dense>
            <v-col cols="3">
                <v-card class="kpi-card kpi-overdue pa-5" rounded="lg" elevation="0">
                    <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis tracking-wide mb-2">
                        Overdue
                    </div>
                    <div class="d-flex align-end justify-space-between">
                        <span class="text-h3 font-weight-black text-error">
                            {{ listsStore.overdueTodos.length }}
                        </span>
                        <div class="text-caption text-error font-weight-bold mb-1 d-flex align-center ga-1">
                            <v-icon size="12">mdi-trending-up</v-icon>
                            needs attention
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="3">
                <v-card class="kpi-card kpi-today pa-5" rounded="lg" elevation="0">
                    <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis tracking-wide mb-2">
                        Due Today
                    </div>
                    <div class="d-flex align-end justify-space-between">
                        <span class="text-h3 font-weight-black">
                            {{ todayOpen.length }}
                        </span>
                        <div class="text-caption text-medium-emphasis mb-1">
                            open items
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="3">
                <v-card class="kpi-card kpi-done pa-5" rounded="lg" elevation="0">
                    <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis tracking-wide mb-2">
                        Done Today
                    </div>
                    <div class="d-flex align-end justify-space-between">
                        <span class="text-h3 font-weight-black">
                            {{ todayDone.length }}
                        </span>
                        <div class="text-caption text-success font-weight-bold mb-1 d-flex align-center ga-1">
                            <v-icon size="12">mdi-check-circle</v-icon>
                            completed
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="3">
                <v-card class="kpi-card kpi-lists pa-5" rounded="lg" elevation="0">
                    <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis tracking-wide mb-2">
                        Total Lists
                    </div>
                    <div class="d-flex align-end justify-space-between">
                        <span class="text-h3 font-weight-black">
                            {{ listsStore.lists.length }}
                        </span>
                        <div class="text-caption text-medium-emphasis mb-1">
                            active
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Main content + right sidebar -->
        <v-row align="start">
            <!-- Left: main content (8/12) -->
            <v-col cols="8">
                <!-- Overdue Focus -->
                <div class="mb-10">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div class="d-flex align-center ga-3">
                            <div class="section-accent bg-error rounded-pill" />
                            <span class="text-h6 font-weight-bold">Overdue Focus</span>
                        </div>
                        <v-btn variant="text" size="small" color="primary" to="/search">
                            View All Critical
                        </v-btn>
                    </div>

                    <div v-if="listsStore.overdueTodos.length" class="d-flex flex-column ga-2">
                        <div
                            v-for="todo in listsStore.overdueTodos.slice(0, 5)"
                            :key="todo.id"
                            class="overdue-card d-flex align-center ga-4 pa-4 rounded-lg cursor-pointer"
                            @click="selectTodo(todo)"
                        >
                            <div class="overdue-bar bg-error rounded-pill flex-shrink-0" />
                            <div class="flex-grow-1">
                                <div class="font-weight-medium text-body-1">{{ todo.name }}</div>
                                <div class="d-flex align-center ga-4 mt-1">
                                    <span class="text-caption text-error font-weight-bold d-flex align-center ga-1">
                                        <v-icon size="12">mdi-clock-alert-outline</v-icon>
                                        {{ todo.dueDate ? formatDate(todo.dueDate) : 'No date' }}
                                    </span>
                                    <span v-if="todo.list?.name" class="text-caption text-medium-emphasis d-flex align-center ga-1">
                                        <v-icon size="12">mdi-pound</v-icon>
                                        {{ todo.list.name }}
                                    </span>
                                </div>
                            </div>
                            <v-btn
                                icon="mdi-arrow-right"
                                variant="text"
                                size="small"
                                color="primary"
                                class="overdue-arrow"
                                @click.stop="selectTodo(todo)"
                            />
                        </div>
                    </div>
                    <v-card v-else variant="flat" class="pa-6 text-center text-medium-emphasis rounded-lg" color="surface-variant">
                        <v-icon class="mb-2">mdi-check-circle-outline</v-icon>
                        <div class="text-body-2">No overdue items — great work!</div>
                    </v-card>
                </div>

                <!-- Today's Ledger -->
                <div class="mb-10">
                    <div class="d-flex align-center mb-4">
                        <div class="section-accent bg-primary rounded-pill mr-3" />
                        <span class="text-h6 font-weight-bold">Today's Ledger</span>
                    </div>

                    <!-- Quick add -->
                    <v-text-field
                        v-model="quickAddName"
                        class="mb-4 quick-add-field"
                        placeholder="Add a new commitment to your ledger..."
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        hide-details
                        @keyup.enter="quickAdd"
                    >
                        <template #prepend-inner>
                            <v-icon color="primary" class="mr-1">mdi-plus-circle</v-icon>
                        </template>
                        <template #append-inner>
                            <span class="text-caption text-medium-emphasis">Enter to save</span>
                        </template>
                    </v-text-field>

                    <div v-if="todayOpen.length" class="d-flex flex-column ga-2">
                        <div
                            v-for="todo in todayOpen.slice(0, 5)"
                            :key="todo.id"
                            class="today-card d-flex align-center ga-4 pa-4 rounded-lg cursor-pointer"
                            @click="selectTodo(todo)"
                        >
                            <v-checkbox
                                density="compact"
                                hide-details
                                class="flex-shrink-0"
                                @click.stop="setClosed(todo, 200)"
                            />
                            <div class="flex-grow-1">
                                <div class="font-weight-medium text-body-1">{{ todo.name }}</div>
                                <div v-if="todo.list?.name" class="text-caption text-medium-emphasis mt-1">
                                    {{ todo.list.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <v-card v-else variant="flat" class="pa-6 text-center text-medium-emphasis rounded-lg" color="surface-variant">
                        <div class="text-body-2">No open tasks for today — add one above.</div>
                    </v-card>
                </div>

                <!-- Done Today -->
                <div>
                    <div class="d-flex align-center mb-4">
                        <div class="section-accent bg-medium-emphasis rounded-pill mr-3" style="background: rgba(0,0,0,0.2)" />
                        <span class="text-h6 font-weight-bold text-medium-emphasis">Done Today</span>
                    </div>

                    <div v-if="todayDone.length" class="d-flex flex-column ga-2">
                        <div
                            v-for="todo in todayDone"
                            :key="todo.id"
                            class="done-card d-flex align-center ga-4 pa-4 rounded-lg cursor-pointer opacity-70"
                            @click="selectTodo(todo)"
                        >
                            <v-checkbox
                                density="compact"
                                hide-details
                                :model-value="true"
                                class="flex-shrink-0"
                                @click.stop="setOpen(todo, 200)"
                            />
                            <div class="flex-grow-1">
                                <div class="text-body-1 text-decoration-line-through text-medium-emphasis">{{ todo.name }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <v-card
                        v-else
                        variant="outlined"
                        class="done-empty-state pa-10 d-flex flex-column align-center text-center rounded-xl"
                        style="border-style: dashed;"
                    >
                        <v-avatar size="56" color="surface-variant" class="mb-4">
                            <v-icon size="28" color="medium-emphasis">mdi-auto-fix</v-icon>
                        </v-avatar>
                        <div class="font-weight-bold text-body-1 mb-1">Momentum is building</div>
                        <div class="text-body-2 text-medium-emphasis max-w-xs">
                            Your completed tasks will appear here. Keep carving the path.
                        </div>
                    </v-card>
                </div>
            </v-col>

            <!-- Right: contextual sidebar (4/12) -->
            <v-col cols="4">
                <div class="ledger-sidebar">
                    <!-- Deep Work card -->
                    <v-card
                        class="deep-work-card pa-6 mb-6 rounded-xl overflow-hidden"
                        color="primary-lighten-4"
                        elevation="0"
                    >
                        <div class="deep-work-icon-bg">
                            <v-icon size="96" color="primary" style="opacity: 0.12;">mdi-timer-outline</v-icon>
                        </div>
                        <div class="text-h5 font-weight-black mb-2" style="position: relative;">Deep Work</div>
                        <div class="text-body-2 mb-6 text-medium-emphasis" style="position: relative; line-height: 1.6;">
                            No notifications, no noise. Just focus for the next 90 minutes.
                        </div>
                        <v-btn
                            color="white"
                            variant="elevated"
                            rounded="lg"
                            class="text-primary font-weight-bold"
                            style="position: relative;"
                            elevation="2"
                        >
                            Enter The Zone
                        </v-btn>
                    </v-card>

                    <!-- Productivity Pulse -->
                    <v-card class="pa-5 mb-6 rounded-xl" elevation="0" variant="outlined">
                        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis tracking-wide mb-4">
                            Productivity Pulse
                        </div>
                        <div class="d-flex flex-column ga-3">
                            <div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-caption font-weight-medium">Focus tasks</span>
                                    <span class="text-caption font-weight-bold text-primary">
                                        {{ todayOpen.length + todayDone.length > 0
                                            ? Math.round((todayDone.length / (todayOpen.length + todayDone.length)) * 100)
                                            : 0 }}%
                                    </span>
                                </div>
                                <v-progress-linear
                                    :model-value="todayOpen.length + todayDone.length > 0
                                        ? (todayDone.length / (todayOpen.length + todayDone.length)) * 100
                                        : 0"
                                    color="primary"
                                    rounded
                                    height="6"
                                    bg-color="surface-variant"
                                />
                            </div>
                            <div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-caption font-weight-medium">Overdue cleared</span>
                                    <span class="text-caption font-weight-bold text-error">
                                        {{ listsStore.overdueTodos.length }} remaining
                                    </span>
                                </div>
                                <v-progress-linear
                                    :model-value="listsStore.overdueTodos.length > 0 ? 20 : 100"
                                    color="error"
                                    rounded
                                    height="6"
                                    bg-color="surface-variant"
                                />
                            </div>
                        </div>
                        <v-divider class="my-4" />
                        <div class="text-caption text-medium-emphasis font-italic" style="line-height: 1.6;">
                            "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."
                        </div>
                    </v-card>

                    <!-- My Lists quick access -->
                    <v-card class="pa-5 rounded-xl" elevation="0" variant="outlined">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis tracking-wide">
                                My Lists
                            </div>
                            <v-btn variant="text" size="x-small" color="primary" to="/lists">
                                View all
                            </v-btn>
                        </div>
                        <div class="d-flex flex-column ga-2">
                            <v-btn
                                v-for="list in listsStore.lists.slice(0, 5)"
                                :key="list.id"
                                :to="`/list/${list.id}`"
                                variant="tonal"
                                size="small"
                                rounded="lg"
                                :prepend-icon="list.icon || 'mdi-format-list-bulleted'"
                                class="justify-start text-truncate"
                                style="max-width: 100%;"
                            >
                                {{ list.name }}
                            </v-btn>
                        </div>
                    </v-card>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.ledger-dashboard {
    max-width: 1400px;
}

/* KPI cards with colored left border */
.kpi-card {
    border-left: 4px solid transparent;
    background: rgb(var(--v-theme-surface)) !important;
    border: 1px solid rgba(var(--v-border-color), 0.12);
}
.kpi-overdue { border-left-color: rgb(var(--v-theme-error)) !important; }
.kpi-today   { border-left-color: rgb(var(--v-theme-primary)) !important; }
.kpi-done    { border-left-color: #10b981 !important; }
.kpi-lists   { border-left-color: rgba(var(--v-border-color), 0.4) !important; }

/* Section accent bar */
.section-accent {
    width: 6px;
    height: 24px;
    border-radius: 4px;
    flex-shrink: 0;
}

/* Overdue task cards */
.overdue-card {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.08);
    transition: background 0.15s, border-color 0.15s;
}
.overdue-card:hover {
    background: rgba(var(--v-theme-surface-variant), 0.5);
    border-color: rgba(var(--v-theme-error), 0.15);
}
.overdue-bar {
    width: 6px;
    height: 40px;
}
.overdue-arrow {
    opacity: 0;
    transition: opacity 0.15s;
}
.overdue-card:hover .overdue-arrow {
    opacity: 1;
}

/* Today task cards */
.today-card {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.08);
    transition: background 0.15s, border-color 0.15s;
}
.today-card:hover {
    background: rgba(var(--v-theme-surface-variant), 0.5);
    border-color: rgba(var(--v-theme-primary), 0.12);
}

/* Done task cards */
.done-card {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.06);
    transition: background 0.15s;
}
.done-card:hover {
    background: rgba(var(--v-theme-surface-variant), 0.3);
}

/* Quick add field */
.quick-add-field :deep(.v-field) {
    border-style: dashed;
    border-width: 2px;
    border-color: rgba(var(--v-border-color), 0.3);
}
.quick-add-field :deep(.v-field--focused) {
    border-color: rgb(var(--v-theme-primary));
}

/* Deep Work card */
.deep-work-card {
    position: relative;
}
.deep-work-icon-bg {
    position: absolute;
    top: -8px;
    right: -8px;
    pointer-events: none;
}

/* Sticky sidebar */
.ledger-sidebar {
    position: sticky;
    top: 80px;
}
</style>
