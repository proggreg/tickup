<script setup lang="ts">
import { Button } from '@vuetify/v0';

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
    <div class="dashboard">
        <!-- Stats summary row -->
        <div class="stats-row">
            <div class="stat-card stat-card--error">
                <div class="stat-card__number">{{ listsStore.overdueTodos.length }}</div>
                <div class="stat-card__label">Overdue</div>
            </div>
            <div class="stat-card stat-card--primary">
                <div class="stat-card__number">{{ todayCount }}</div>
                <div class="stat-card__label">Due Today</div>
            </div>
            <div class="stat-card stat-card--success">
                <div class="stat-card__number">{{ doneCount }}</div>
                <div class="stat-card__label">Done Today</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__number">{{ listsStore.lists.length }}</div>
                <div class="stat-card__label">Lists</div>
            </div>
        </div>

        <!-- Main 3-column content -->
        <div class="content-row">
            <!-- Overdue column -->
            <div class="content-col">
                <div class="content-card">
                    <div class="content-card__header">
                        <i class="mdi mdi-clock-alert-outline content-card__icon content-card__icon--error" />
                        <span class="content-card__title">Overdue</span>
                        <span
                            v-if="listsStore.overdueTodos.length"
                            class="content-badge content-badge--error"
                        >
                            {{ listsStore.overdueTodos.length }}
                        </span>
                    </div>
                    <div class="content-card__body">
                        <HomePageOverDue />
                    </div>
                </div>
            </div>

            <!-- Today column -->
            <div class="content-col">
                <div class="content-card">
                    <div class="content-card__header">
                        <i class="mdi mdi-calendar-today content-card__icon content-card__icon--primary" />
                        <span class="content-card__title">Today</span>
                        <span
                            v-if="todayCount"
                            class="content-badge content-badge--primary"
                        >
                            {{ todayCount }}
                        </span>
                    </div>
                    <div class="content-card__body content-card__body--padded">
                        <TodoNew
                            :save-todo="saveTodo"
                            class="mb-field"
                            @add-todo="dialog.open = false; saveTodo = false"
                        />
                        <HomePageToday />
                    </div>
                </div>
            </div>

            <!-- Done column -->
            <div class="content-col">
                <div class="content-card">
                    <div class="content-card__header">
                        <i class="mdi mdi-check-circle-outline content-card__icon content-card__icon--success" />
                        <span class="content-card__title">Done Today</span>
                        <span
                            v-if="doneCount"
                            class="content-badge content-badge--success"
                        >
                            {{ doneCount }}
                        </span>
                    </div>
                    <div class="content-card__body">
                        <HomePageTodayClosed />
                    </div>
                </div>
            </div>
        </div>

        <!-- My Lists section -->
        <div class="lists-section">
            <div class="content-card">
                <div class="content-card__header">
                    <i class="mdi mdi-format-list-bulleted content-card__icon" />
                    <span class="content-card__title">My Lists</span>
                    <Button.Root
                        class="view-all-btn"
                        :to="'/lists'"
                    >
                        View all
                    </Button.Root>
                </div>
                <div class="content-card__body content-card__body--padded">
                    <div
                        v-if="listsStore.lists.length"
                        class="lists-grid"
                    >
                        <NuxtLink
                            v-for="list in listsStore.lists"
                            :key="list.id"
                            :to="`/list/${list.id}`"
                            class="list-card"
                        >
                            <i
                                :class="`mdi ${list.icon || 'mdi-format-list-bulleted'} list-card__icon`"
                            />
                            <span class="list-card__name">{{ list.name }}</span>
                        </NuxtLink>
                    </div>
                    <AppEmptyState
                        v-else
                        height="80px"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Stats row */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.stat-card {
    padding: 20px 16px;
    border-radius: 8px;
    text-align: center;
    background: rgb(var(--v-theme-surface-container-lowest));
    box-shadow: 0 8px 32px rgba(42, 52, 57, 0.06);
}

.stat-card__number {
    font-family: 'Manrope', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    color: rgb(var(--v-theme-on-surface));
}

.stat-card--error .stat-card__number {
    color: rgb(var(--v-theme-tertiary));
}

.stat-card--primary .stat-card__number {
    color: rgb(var(--v-theme-primary));
}

.stat-card--success .stat-card__number {
    color: rgb(var(--v-theme-secondary));
}

.stat-card__label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-top: 6px;
    color: rgb(var(--v-theme-on-surface-variant));
}

/* Content columns */
.content-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    align-items: stretch;
}

.content-col {
    display: flex;
}

.content-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: rgb(var(--v-theme-surface-container-lowest));
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(42, 52, 57, 0.06);
}

.content-card__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 16px 14px;
}

.content-card__icon {
    font-size: 18px;
    opacity: 0.7;
}

.content-card__icon--error { color: rgb(var(--v-theme-error)); }
.content-card__icon--primary { color: rgb(var(--v-theme-primary)); }
.content-card__icon--success { color: rgb(var(--v-theme-success)); }

.content-card__title {
    font-family: 'Manrope', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    flex: 1;
}

.content-badge {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: auto;
}

.content-badge--error {
    background: rgba(var(--v-theme-tertiary), 0.1);
    color: rgb(var(--v-theme-tertiary));
}

.content-badge--primary {
    background: rgb(var(--v-theme-primary-container));
    color: rgb(var(--v-theme-on-primary-container));
}

.content-badge--success {
    background: rgb(var(--v-theme-secondary-container));
    color: rgb(var(--v-theme-on-secondary-container));
}

.content-card__body {
    flex: 1;
    overflow-y: auto;
    max-height: 480px;
}

.content-card__body--padded {
    padding: 16px;
}

.mb-field {
    margin-bottom: 16px;
}

/* View all button */
.view-all-btn {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 0.75rem;
    font-family: inherit;
    margin-left: auto;
    text-decoration: none;
    transition: color 0.15s;
}

.view-all-btn:hover {
    color: rgb(var(--v-theme-primary));
}

/* Lists section */
.lists-section {
    width: 100%;
}

.lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
}

.list-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    background: rgb(var(--v-theme-surface-container-low));
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s;
}

.list-card:hover {
    background: rgb(var(--v-theme-surface-container));
}

.list-card__icon {
    font-size: 16px;
    flex-shrink: 0;
    opacity: 0.7;
}

.list-card__name {
    font-size: 0.8125rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
