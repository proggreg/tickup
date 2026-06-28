<script setup lang="ts">
const listsStore = useListsStore();
const dialog = useDialog();
const saveTodo = ref(false);
const { isTodoClosed } = useTodoStatus();
const { user } = useCurrentUser();

const todayCount = computed(
    () => listsStore.todaysTodos.filter(todo => !isTodoClosed(todo.status)).length,
);
const doneCount = computed(
    () => listsStore.todaysTodos.filter(todo => isTodoClosed(todo.status)).length,
);

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

const dateSubtitle = computed(() => {
    const d = new Date();
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return d.toLocaleDateString('en-GB', opts) + ' · here\'s where things stand.';
});

onBeforeMount(() => {
    listsStore.getTodaysTodos();
});
</script>

<template>
    <div class="dash-page">
        <div class="dash-inner">
            <!-- Greeting -->
            <div>
                <h1 class="dash-h1">
                    {{ greetingWord }}, {{ displayName }}
                </h1>
                <p class="dash-sub">
                    {{ dateSubtitle }}
                </p>
            </div>

            <!-- Stat row -->
            <div class="stat-row">
                <div class="stat-card">
                    <div
                        class="stat-bar"
                        style="background: #ba1b24"
                    />
                    <div
                        class="icon-tile"
                        style="
                            background: color-mix(in srgb, #ba1b24 9%, #ffffff);
                            border: 1px solid color-mix(in srgb, #ba1b24 22%, #ffffff);
                        "
                    >
                        <v-icon
                            color="#ba1b24"
                            :size="22"
                        >
                            mdi-clock-alert-outline
                        </v-icon>
                    </div>
                    <div>
                        <div class="stat-value">
                            {{ listsStore.overdueTodos.length }}
                        </div>
                        <div class="stat-label">
                            Overdue
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <div
                        class="stat-bar"
                        style="background: color-mix(in srgb, #005ac2 78%, #1a2230)"
                    />
                    <div
                        class="icon-tile"
                        style="
                            background: color-mix(in srgb, #005ac2 11%, #ffffff);
                            border: 1px solid color-mix(in srgb, #005ac2 26%, #ffffff);
                        "
                    >
                        <v-icon
                            style="color: color-mix(in srgb, #005ac2 78%, #1a2230)"
                            :size="22"
                        >
                            mdi-calendar-today
                        </v-icon>
                    </div>
                    <div>
                        <div class="stat-value">
                            {{ todayCount }}
                        </div>
                        <div class="stat-label">
                            Due today
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <div
                        class="stat-bar"
                        style="background: #2f8a5e"
                    />
                    <div
                        class="icon-tile"
                        style="
                            background: color-mix(in srgb, #2f8a5e 11%, #ffffff);
                            border: 1px solid color-mix(in srgb, #2f8a5e 11%, #ffffff);
                        "
                    >
                        <v-icon
                            color="#2f8a5e"
                            :size="22"
                        >
                            mdi-check-circle-outline
                        </v-icon>
                    </div>
                    <div>
                        <div class="stat-value">
                            {{ doneCount }}
                        </div>
                        <div class="stat-label">
                            Done today
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <div
                        class="stat-bar"
                        style="background: #506076"
                    />
                    <div
                        class="icon-tile"
                        style="
                            background: color-mix(in srgb, #506076 10%, #ffffff);
                            border: 1px solid color-mix(in srgb, #506076 10%, #ffffff);
                        "
                    >
                        <v-icon
                            color="#506076"
                            :size="22"
                        >
                            mdi-format-list-bulleted
                        </v-icon>
                    </div>
                    <div>
                        <div class="stat-value">
                            {{ listsStore.lists.length }}
                        </div>
                        <div class="stat-label">
                            Lists
                        </div>
                    </div>
                </div>
            </div>

            <!-- Board row -->
            <div class="board-row">
                <!-- Overdue column -->
                <div class="col-card">
                    <div class="col-header">
                        <div
                            class="icon-tile-sm"
                            style="background: color-mix(in srgb, #ba1b24 9%, #ffffff)"
                        >
                            <v-icon
                                color="#ba1b24"
                                :size="16"
                            >
                                mdi-clock-alert-outline
                            </v-icon>
                        </div>
                        <span class="col-title">Overdue</span>
                        <span
                            v-if="listsStore.overdueTodos.length"
                            class="count-pill"
                            style="
                                color: #ba1b24;
                                background: color-mix(in srgb, #ba1b24 9%, #ffffff);
                            "
                        >
                            {{ listsStore.overdueTodos.length }}
                        </span>
                    </div>
                    <v-divider />
                    <div class="col-body">
                        <HomePageOverDue />
                    </div>
                </div>

                <!-- Today column -->
                <div class="col-card">
                    <div class="col-header">
                        <div
                            class="icon-tile-sm"
                            style="background: color-mix(in srgb, #005ac2 11%, #ffffff)"
                        >
                            <v-icon
                                style="color: color-mix(in srgb, #005ac2 78%, #1a2230)"
                                :size="16"
                            >
                                mdi-calendar-today
                            </v-icon>
                        </div>
                        <span class="col-title">Today</span>
                        <span
                            v-if="todayCount"
                            class="count-pill"
                            style="
                                color: color-mix(in srgb, #005ac2 78%, #1a2230);
                                background: color-mix(in srgb, #005ac2 11%, #ffffff);
                            "
                        >
                            {{ todayCount }}
                        </span>
                    </div>
                    <v-divider />
                    <div class="today-new-todo">
                        <TodoNew
                            :save-todo="saveTodo"
                            @add-todo="
                                dialog.open = false;
                                saveTodo = false;
                            "
                        />
                    </div>
                    <div class="col-body">
                        <HomePageToday />
                    </div>
                </div>

                <!-- Done today column -->
                <div class="col-card">
                    <div class="col-header">
                        <div
                            class="icon-tile-sm"
                            style="background: color-mix(in srgb, #2f8a5e 11%, #ffffff)"
                        >
                            <v-icon
                                color="#2f8a5e"
                                :size="16"
                            >
                                mdi-check-circle-outline
                            </v-icon>
                        </div>
                        <span class="col-title">Done Today</span>
                        <span
                            v-if="doneCount"
                            class="count-pill"
                            style="
                                color: #2f8a5e;
                                background: color-mix(in srgb, #2f8a5e 11%, #ffffff);
                            "
                        >
                            {{ doneCount }}
                        </span>
                    </div>
                    <v-divider />
                    <div class="col-body">
                        <div
                            v-if="doneCount === 0"
                            class="done-empty"
                        >
                            <div class="done-empty-icon">
                                <v-icon
                                    color="#2f8a5e"
                                    :size="26"
                                >
                                    mdi-check
                                </v-icon>
                            </div>
                            <div class="done-empty-title">
                                All caught up
                            </div>
                            <div class="done-empty-body">
                                Nothing closed yet today. Finished tasks will show up here.
                            </div>
                        </div>
                        <HomePageTodayClosed v-else />
                    </div>
                </div>
            </div>

            <!-- Recent section (replaces My Lists) -->
            <HomePageRecent />
        </div>
    </div>
</template>

<style scoped>
.dash-page {
    padding: 26px 30px 40px;
    background: #eef2f6;
    min-height: 100%;
}

.dash-inner {
    max-width: 1340px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.dash-h1 {
    font-family: 'Manrope', sans-serif;
    font-weight: 800;
    font-size: 26px;
    color: #2a3439;
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1.2;
}

.dash-sub {
    font-size: 14px;
    color: rgba(42, 52, 57, 0.62);
    margin: 5px 0 0;
}

.stat-row {
    display: flex;
    gap: 16px;
}

.stat-card {
    flex: 1;
    background: #ffffff;
    border: 1px solid rgba(80, 96, 118, 0.16);
    border-radius: 16px;
    box-shadow:
        0 1px 2px rgba(42, 52, 57, 0.04),
        0 8px 28px rgba(42, 52, 57, 0.06);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    overflow: hidden;
}

.stat-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.icon-tile {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-tile-sm {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-value {
    font-family: 'Manrope', sans-serif;
    font-weight: 800;
    font-size: 32px;
    line-height: 1;
    color: #2a3439;
    letter-spacing: -0.02em;
}

.stat-label {
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(42, 52, 57, 0.62);
    margin-top: 2px;
}

.board-row {
    display: flex;
    gap: 16px;
    align-items: stretch;
}

.col-card {
    flex: 1;
    min-width: 0;
    background: #ffffff;
    border: 1px solid rgba(80, 96, 118, 0.16);
    border-radius: 18px;
    box-shadow:
        0 1px 2px rgba(42, 52, 57, 0.04),
        0 8px 28px rgba(42, 52, 57, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.col-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 18px 13px;
}

.col-title {
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 15.5px;
    color: #2a3439;
}

.count-pill {
    margin-left: auto;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 10px;
}

.today-new-todo {
    padding: 12px 14px 4px;
}

.col-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    max-height: 430px;
}

.done-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 240px;
    padding: 0 28px;
}

.done-empty-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: color-mix(in srgb, #2f8a5e 11%, #ffffff);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
}

.done-empty-title {
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: #2a3439;
    margin-bottom: 5px;
}

.done-empty-body {
    font-size: 13px;
    color: rgba(42, 52, 57, 0.62);
    line-height: 1.5;
    max-width: 240px;
}
</style>
