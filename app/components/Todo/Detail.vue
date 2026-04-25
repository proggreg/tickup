<script setup lang="ts">
import { Input, Popover } from '@vuetify/v0';

const listsStore = useListsStore();
const { statuses } = useSettingsStore();
const hasGithub = await useHasGithub();

function updateName() {
    if (listsStore.currentTodo.name) {
        listsStore.updateTodo(listsStore.currentTodo);
    }
}

const currentStatus = computed(() =>
    statuses.find(s => s.name === listsStore.currentTodo.status) ?? statuses[0],
);

function setStatus(status: Status) {
    listsStore.currentTodo.status = status.name;
    listsStore.updateTodo(listsStore.currentTodo);
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const isOverdue = computed(() => {
    if (!listsStore.currentTodo.dueDate) return false;
    const d = new Date(listsStore.currentTodo.dueDate);
    d.setHours(0, 0, 0, 0);
    return d < today && listsStore.currentTodo.status !== 'Closed';
});

function updateDueDate(newDate: Date) {
    listsStore.currentTodo.dueDate = newDate;
    listsStore.updateTodo(listsStore.currentTodo);
}

const subtaskTotal = computed(() => listsStore.currentTodo.subtasks?.length ?? 0);
const subtaskDone = computed(() => listsStore.currentTodo.subtasks?.filter(s => s.status === 'Closed').length ?? 0);
const subtaskPct = computed(() => subtaskTotal.value ? Math.round(subtaskDone.value / subtaskTotal.value * 100) : 0);
const allDone = computed(() => subtaskTotal.value > 0 && subtaskPct.value === 100);
</script>

<template>
    <div class="todo-detail">
        <!-- Title -->
        <div class="detail-section detail-section--title">
            <Input.Root v-model="listsStore.currentTodo.name">
                <Input.Control
                    class="title-input"
                    data-testid="todo-detail-title"
                    @blur="updateName"
                />
            </Input.Root>
        </div>

        <!-- Properties -->
        <div class="detail-section detail-section--props">
            <!-- Status -->
            <div class="prop-row">
                <div class="prop-row__label">
                    <i class="mdi mdi-circle-slice-4 prop-row__icon" />
                    <span>Status</span>
                </div>
                <div class="prop-row__value">
                    <Popover.Root>
                        <Popover.Activator>
                            <button
                                class="status-pill"
                                :style="{
                                    background: `${currentStatus.color}18`,
                                    color: currentStatus.color,
                                    borderColor: `${currentStatus.color}33`,
                                }"
                            >
                                <span
                                    class="status-pill__dot"
                                    :style="{ background: currentStatus.color }"
                                />
                                {{ listsStore.currentTodo.status }}
                                <i class="mdi mdi-chevron-down status-pill__chevron" />
                            </button>
                        </Popover.Activator>
                        <Popover.Content>
                            <ul class="pop-menu">
                                <li
                                    v-for="s in statuses"
                                    :key="s.name"
                                    class="pop-menu__item"
                                    @click="setStatus(s)"
                                >
                                    <span
                                        class="pop-menu__dot"
                                        :style="{ background: s.color }"
                                    />
                                    {{ s.name }}
                                </li>
                            </ul>
                        </Popover.Content>
                    </Popover.Root>
                </div>
            </div>

            <!-- Due date -->
            <div class="prop-row">
                <div class="prop-row__label">
                    <i class="mdi mdi-calendar prop-row__icon" />
                    <span>Due date</span>
                </div>
                <div class="prop-row__value">
                    <AppDueDate
                        :todo="listsStore.currentTodo"
                        :todo-due-date="listsStore.currentTodo.dueDate"
                        :show-detail="true"
                        :class="{ 'due-date--overdue': isOverdue }"
                        @set-date="updateDueDate"
                    />
                </div>
            </div>

            <!-- List -->
            <div class="prop-row">
                <div class="prop-row__label">
                    <i class="mdi mdi-format-list-bulleted prop-row__icon" />
                    <span>List</span>
                </div>
                <div class="prop-row__value prop-row__value--plain">
                    {{ listsStore.currentList?.name }}
                </div>
            </div>

            <!-- GitHub (conditional) -->
            <div
                v-if="hasGithub"
                class="prop-row"
            >
                <div class="prop-row__label">
                    <i class="mdi mdi-github prop-row__icon" />
                    <span>GitHub</span>
                </div>
                <div class="prop-row__value">
                    <GithubButton :todo="listsStore.currentTodo" />
                </div>
            </div>
        </div>

        <!-- Description -->
        <div class="detail-section">
            <div class="section-label">
                Description
            </div>
            <textarea
                v-model="listsStore.currentTodo.desc"
                class="desc-textarea"
                placeholder="Add a description…"
                @input="listsStore.debounceUpdateTodo(listsStore.currentTodo)"
                @blur="listsStore.updateTodo(listsStore.currentTodo)"
            />
        </div>

        <div class="divider" />

        <!-- Subtasks -->
        <div class="detail-section">
            <div class="subtasks-header">
                <div class="subtasks-header__left">
                    <span class="section-label">Subtasks</span>
                    <span
                        v-if="subtaskTotal"
                        class="subtasks-badge"
                        :class="{ 'subtasks-badge--done': allDone }"
                    >
                        {{ subtaskDone }}/{{ subtaskTotal }}
                    </span>
                </div>
                <div
                    v-if="subtaskTotal"
                    class="subtasks-progress"
                >
                    <div
                        class="subtasks-progress__bar"
                        :class="{ 'subtasks-progress__bar--done': allDone }"
                        :style="{ width: subtaskPct + '%' }"
                    />
                </div>
            </div>
            <Subtask />
        </div>

        <div class="divider" />

        <!-- Links -->
        <div class="detail-section">
            <div class="section-label">
                Links
            </div>
            <TodoLinks />
        </div>
    </div>
</template>

<style scoped>
.todo-detail {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-bottom: 40px;
}

.detail-section {
    padding: 12px 20px;
}

.detail-section--title {
    padding: 18px 20px 10px;
}

.detail-section--props {
    padding: 8px 20px 12px;
    background: rgb(var(--v-theme-surface-container-low));
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0 12px;
}

.divider {
    height: 1px;
    background: rgba(var(--v-border-color), 0.14);
    margin: 0 20px;
}

.title-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 1.1875rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.3;
    padding: 2px 0;
    box-sizing: border-box;
}

.title-input:focus {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
}

.prop-row {
    display: flex;
    align-items: center;
    min-height: 32px;
}

.prop-row__label {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 108px;
    flex-shrink: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.5);
    user-select: none;
}

.prop-row__icon {
    font-size: 14px;
    width: 16px;
    text-align: center;
    opacity: 0.6;
}

.prop-row__value {
    flex: 1;
    font-size: 0.875rem;
}

.prop-row__value--plain {
    color: rgb(var(--v-theme-on-surface));
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px 3px 7px;
    border-radius: 20px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    font-family: inherit;
    transition: opacity 0.15s;
}

.status-pill:hover {
    opacity: 0.8;
}

.status-pill__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-pill__chevron {
    font-size: 12px;
    opacity: 0.7;
}

.pop-menu {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 140px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.pop-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.1s;
}

.pop-menu__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.pop-menu__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

:deep(.due-date--overdue .date-field__input) {
    color: rgb(var(--v-theme-tertiary));
    font-weight: 500;
}

.section-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.45);
    margin-bottom: 8px;
}

.desc-textarea {
    width: 100%;
    min-height: 80px;
    padding: 0;
    border: none;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-size: 0.9rem;
    font-family: inherit;
    line-height: 1.6;
    resize: none;
    outline: none;
    box-sizing: border-box;
}

.desc-textarea::placeholder {
    color: rgba(var(--v-theme-on-surface), 0.35);
}

.subtasks-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.subtasks-header__left {
    display: flex;
    align-items: center;
    gap: 7px;
}

.subtasks-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    background: rgb(var(--v-theme-primary-container));
    color: rgb(var(--v-theme-on-primary-container));
    padding: 1px 7px;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
}

.subtasks-badge--done {
    background: rgba(26, 122, 74, 0.12);
    color: #1a7a4a;
}

.subtasks-progress {
    width: 64px;
    height: 3px;
    border-radius: 2px;
    background: rgba(var(--v-border-color), 0.2);
    overflow: hidden;
}

.subtasks-progress__bar {
    height: 100%;
    border-radius: 2px;
    background: rgb(var(--v-theme-primary));
    transition: width 0.3s ease, background 0.3s;
}

.subtasks-progress__bar--done {
    background: #1a7a4a;
}
</style>
