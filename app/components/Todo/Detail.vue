<script setup lang="ts">
import { Input } from '@vuetify/v0';

const listsStore = useListsStore();
const hasGithub = await useHasGithub();

function updateDueDate(newDate: Date) {
    listsStore.currentTodo.dueDate = newDate;
    listsStore.updateTodo(listsStore.currentTodo);
}
function updateName() {
    if (listsStore.currentTodo.name) {
        listsStore.updateTodo(listsStore.currentTodo);
    }
}
</script>

<template>
    <div class="todo-detail">
        <div class="todo-detail__title-section">
            <Input.Root
                v-model="listsStore.currentTodo.name"
                label="Title"
            >
                <Input.Control
                    class="title-input"
                    data-testid="todo-detail-title"
                    @blur="updateName"
                />
            </Input.Root>
        </div>

        <div class="todo-detail__meta">
            <div class="todo-detail__meta-row">
                <TodoStatus />
                <GithubButton
                    v-if="hasGithub"
                    :todo="listsStore.currentTodo"
                />
                <div class="spacer" />
                <div class="todo-detail__due-date">
                    <AppDueDate
                        :todo-due-date="listsStore.currentTodo.dueDate"
                        :todo="listsStore.currentTodo"
                        :show-detail="true"
                        @set-date="updateDueDate"
                    />
                </div>
            </div>
        </div>

        <div class="todo-detail__desc">
            <textarea
                v-model="listsStore.currentTodo.desc"
                class="desc-textarea"
                rows="6"
                @input="listsStore.debounceUpdateTodo(listsStore.currentTodo)"
                @blur="listsStore.updateTodo(listsStore.currentTodo)"
            />
        </div>

        <div class="todo-detail__subtasks">
            <Subtask />
        </div>

        <div class="todo-detail__links">
            <TodoLinks />
        </div>

        <div class="todo-detail__footer">
            <AppDeleteButton :todo="listsStore.currentTodo" />
        </div>
    </div>
</template>

<style scoped>
.todo-detail {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 360px;
    gap: 0;
}

.todo-detail__title-section {
    padding: 16px 16px 8px;
}

.title-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
    box-sizing: border-box;
}

.title-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.todo-detail__meta {
    padding: 8px 16px;
}

.todo-detail__meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.spacer {
    flex: 1;
}

.todo-detail__due-date {
    flex-shrink: 0;
}

.todo-detail__desc {
    padding: 8px 16px;
}

.desc-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    outline: none;
    resize: vertical;
    min-height: 120px;
    max-height: 480px;
    font-family: inherit;
    box-sizing: border-box;
    line-height: 1.5;
}

.desc-textarea:focus {
    border-color: rgb(var(--v-theme-primary));
}

.todo-detail__subtasks,
.todo-detail__links {
    padding: 8px 16px;
}

.todo-detail__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 24px;
    justify-content: space-between;
}
</style>
