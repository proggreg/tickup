<script setup lang="ts">
const listsStore = useListsStore();
const dialog = useDialog();
const saveTodo = ref(false);
const { isTodoClosed } = useTodoStatus();

const todayCount = computed(() =>
    listsStore.todaysTodos.filter(todo => !isTodoClosed(todo.status)).length,
);
const doneCount = computed(() =>
    listsStore.todaysTodos.filter(todo => isTodoClosed(todo.status)).length,
);

onBeforeMount(() => {
    listsStore.getTodaysTodos();
});
</script>

<template>
    <v-container
        fluid
        class="pa-6"
    >
        <!-- Stats summary row -->
        <v-row
            class="mb-6"
            dense
        >
            <v-col cols="3">
                <v-card
                    rounded="lg"
                    color="error"
                    variant="tonal"
                    class="pa-4 text-center"
                >
                    <div class="text-h3 font-weight-bold">
                        {{ listsStore.overdueTodos.length }}
                    </div>
                    <div class="text-body-2 mt-1 text-medium-emphasis">
                        Overdue
                    </div>
                </v-card>
            </v-col>
            <v-col cols="3">
                <v-card
                    rounded="lg"
                    color="primary"
                    variant="tonal"
                    class="pa-4 text-center"
                >
                    <div class="text-h3 font-weight-bold">
                        {{ todayCount }}
                    </div>
                    <div class="text-body-2 mt-1 text-medium-emphasis">
                        Due Today
                    </div>
                </v-card>
            </v-col>
            <v-col cols="3">
                <v-card
                    rounded="lg"
                    color="success"
                    variant="tonal"
                    class="pa-4 text-center"
                >
                    <div class="text-h3 font-weight-bold">
                        {{ doneCount }}
                    </div>
                    <div class="text-body-2 mt-1 text-medium-emphasis">
                        Done Today
                    </div>
                </v-card>
            </v-col>
            <v-col cols="3">
                <v-card
                    rounded="lg"
                    variant="tonal"
                    class="pa-4 text-center"
                >
                    <div class="text-h3 font-weight-bold">
                        {{ listsStore.lists.length }}
                    </div>
                    <div class="text-body-2 mt-1 text-medium-emphasis">
                        Lists
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Main 3-column content -->
        <v-row
            class="mb-6"
            align="stretch"
        >
            <!-- Overdue column -->
            <v-col cols="4">
                <v-card
                    rounded="lg"
                    variant="outlined"
                    class="dashboard-col"
                >
                    <v-card-title class="d-flex align-center ga-2 pa-4 pb-3">
                        <v-icon
                            color="error"
                            size="small"
                        >
                            mdi-clock-alert-outline
                        </v-icon>
                        <span>Overdue</span>
                        <v-chip
                            v-if="listsStore.overdueTodos.length"
                            color="error"
                            size="small"
                            class="ml-auto"
                        >
                            {{ listsStore.overdueTodos.length }}
                        </v-chip>
                    </v-card-title>
                    <v-divider />
                    <div class="dashboard-col-content pa-2">
                        <HomePageOverDue />
                    </div>
                </v-card>
            </v-col>

            <!-- Today column -->
            <v-col cols="4">
                <v-card
                    rounded="lg"
                    variant="outlined"
                    class="dashboard-col"
                >
                    <v-card-title class="d-flex align-center ga-2 pa-4 pb-3">
                        <v-icon
                            color="primary"
                            size="small"
                        >
                            mdi-calendar-today
                        </v-icon>
                        <span>Today</span>
                        <v-chip
                            v-if="todayCount"
                            color="primary"
                            size="small"
                            class="ml-auto"
                        >
                            {{ todayCount }}
                        </v-chip>
                    </v-card-title>
                    <v-divider />
                    <div class="dashboard-col-content pa-4">
                        <TodoNew
                            :save-todo="saveTodo"
                            class="mb-4"
                            @add-todo="dialog.open = false; saveTodo = false"
                        />
                        <HomePageToday />
                    </div>
                </v-card>
            </v-col>

            <!-- Done column -->
            <v-col cols="4">
                <v-card
                    rounded="lg"
                    variant="outlined"
                    class="dashboard-col"
                >
                    <v-card-title class="d-flex align-center ga-2 pa-4 pb-3">
                        <v-icon
                            color="success"
                            size="small"
                        >
                            mdi-check-circle-outline
                        </v-icon>
                        <span>Done Today</span>
                        <v-chip
                            v-if="doneCount"
                            color="success"
                            size="small"
                            class="ml-auto"
                        >
                            {{ doneCount }}
                        </v-chip>
                    </v-card-title>
                    <v-divider />
                    <div class="dashboard-col-content pa-2">
                        <HomePageTodayClosed />
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- My Lists section -->
        <v-row>
            <v-col cols="12">
                <v-card
                    rounded="lg"
                    variant="outlined"
                >
                    <v-card-title class="d-flex align-center ga-2 pa-4 pb-3">
                        <v-icon size="small">
                            mdi-format-list-bulleted
                        </v-icon>
                        <span>My Lists</span>
                        <v-btn
                            variant="text"
                            size="small"
                            to="/lists"
                            class="ml-auto text-caption"
                        >
                            View all
                        </v-btn>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pa-4">
                        <v-row
                            v-if="listsStore.lists.length"
                            dense
                        >
                            <v-col
                                v-for="list in listsStore.lists"
                                :key="list.id"
                                cols="6"
                                sm="4"
                                md="3"
                                lg="2"
                            >
                                <v-card
                                    rounded="lg"
                                    variant="tonal"
                                    :to="`/list/${list.id}`"
                                    class="pa-3"
                                >
                                    <div class="d-flex align-center ga-2">
                                        <v-icon
                                            :icon="list.icon || 'mdi-format-list-bulleted'"
                                            size="small"
                                        />
                                        <span class="text-body-2 font-weight-medium text-truncate">
                                            {{ list.name }}
                                        </span>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                        <AppEmptyState
                            v-else
                            height="80px"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.dashboard-col {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.dashboard-col-content {
    flex: 1;
    overflow-y: auto;
    max-height: 480px;
}
</style>
