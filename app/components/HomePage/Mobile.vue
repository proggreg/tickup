<script setup lang="ts">
const listsStore = useListsStore();
const { user } = useCurrentUser();
const { isTodoClosed } = useTodoStatus();

onBeforeMount(() => {
    listsStore.getTodaysTodos();
    listsStore.getOverdueTodos();
    listsStore.getRecentTodos();
});

const greetingWord = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
});

const displayName = computed(() => {
    const meta = user.value?.user_metadata as Record<string, string> | undefined;
    const name = meta?.full_name || meta?.name;
    if (name) return name.split(' ')[0];
    return user.value?.email?.split('@')[0] || 'there';
});

const dateStr = computed(() => {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-GB', opts);
});

const openTodayTodos = computed(() =>
    listsStore.todaysTodos.filter(todo => !isTodoClosed(todo.status)),
);
const doneTodos = computed(() =>
    listsStore.todaysTodos.filter(todo => isTodoClosed(todo.status)),
);

const stats = computed(() => [
    { key: 'overdue', label: 'Overdue', color: '#ba1b24', count: listsStore.overdueTodos.length },
    { key: 'recent', label: 'Recent', color: '#506076', count: listsStore.recentTodos.length },
    { key: 'done', label: 'Done', color: '#2f8a5e', count: doneTodos.value.length },
]);

const sections = computed(() => [
    {
        key: 'today',
        title: 'Today',
        icon: 'mdi-calendar-today',
        color: '#005ac2',
        count: openTodayTodos.value.length,
    },
    {
        key: 'overdue',
        title: 'Overdue',
        icon: 'mdi-clock-alert-outline',
        color: '#ba1b24',
        count: listsStore.overdueTodos.length,
    },
    {
        key: 'recent',
        title: 'Recent',
        icon: 'mdi-history',
        color: '#506076',
        count: listsStore.recentTodos.length,
    },
    {
        key: 'done',
        title: 'Done today',
        icon: 'mdi-check-circle-outline',
        color: '#2f8a5e',
        count: doneTodos.value.length,
    },
]);

const openPanels = ref(['today', 'overdue', 'recent', 'done']);
</script>

<template>
    <div class="px-3 pt-3 pb-4">
        <div class="d-flex align-center justify-space-between mb-3">
            <div>
                <div
                    class="text-h6 font-weight-bold"
                    style="font-family: 'Manrope', sans-serif"
                >
                    {{ greetingWord }}, {{ displayName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                    {{ dateStr }}
                </div>
            </div>
            <v-avatar
                color="#1e2d47"
                size="34"
            >
                <span
                    class="font-weight-bold"
                    style="color: #f58c30; font-family: 'Manrope', sans-serif"
                >
                    {{ displayName.charAt(0).toUpperCase() }}
                </span>
            </v-avatar>
        </div>

        <div class="d-flex ga-2 mb-3">
            <v-card
                v-for="stat in stats"
                :key="stat.key"
                class="text-center py-2 flex-grow-1"
                variant="flat"
            >
                <div
                    class="text-h6 font-weight-bold"
                    :style="{ color: stat.color, fontFamily: 'Manrope, sans-serif' }"
                >
                    {{ stat.count }}
                </div>
                <div class="text-caption font-weight-medium text-medium-emphasis">
                    {{ stat.label }}
                </div>
            </v-card>
        </div>

        <v-expansion-panels
            v-model="openPanels"
            multiple
            gap="8"
            class="mobile-home-panels"
        >
            <v-expansion-panel
                v-for="section in sections"
                :key="section.key"
                :value="section.key"
                rounded="lg"
                elevation="1"
            >
                <v-expansion-panel-title>
                    <div class="d-flex align-center ga-2">
                        <v-avatar
                            :color="section.color"
                            variant="tonal"
                            size="26"
                            rounded="lg"
                        >
                            <v-icon
                                :icon="section.icon"
                                :color="section.color"
                                size="15"
                            />
                        </v-avatar>
                        <span
                            class="font-weight-bold"
                            style="font-family: 'Manrope', sans-serif"
                        >{{
                            section.title
                        }}</span>
                        <v-chip
                            v-if="section.count"
                            :color="section.color"
                            variant="tonal"
                            size="x-small"
                        >
                            {{ section.count }}
                        </v-chip>
                    </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <template v-if="section.key === 'today'">
                        <TodoNew class="mb-2" />
                        <HomePageToday />
                    </template>
                    <HomePageOverDue v-else-if="section.key === 'overdue'" />
                    <HomePageTodoList
                        v-else-if="section.key === 'recent'"
                        :todos="listsStore.recentTodos"
                        group-by-status
                        show-due-dates
                    />
                    <HomePageTodayClosed v-else />
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<style scoped>
.mobile-home-panels :deep(.v-expansion-panel-title) {
    padding: 10px 14px;
    min-height: unset;
}

.mobile-home-panels :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 14px 10px;
}
</style>
