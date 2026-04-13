<script setup lang="ts">
import { Button, Dialog } from '@vuetify/v0';

const emit = defineEmits(['setDate']);
const dueDateProps = defineProps<{ todoDueDate?: Date | string; todo: Todo; showDetail?: boolean }>();
const formattedDate = computed(() => {
    if (dueDateProps.todoDueDate) {
        return new Date(dueDateProps.todoDueDate).toLocaleDateString('en-GB');
    }
    return '';
});

const dateInputValue = computed(() => {
    if (dueDateProps.todoDueDate) {
        const d = new Date(dueDateProps.todoDueDate);
        return d.toISOString().split('T')[0];
    }
    return '';
});

function updateDueDate(newDate: Date | string | null) {
    const newTodo = Object.assign({}, dueDateProps.todo, { dueDate: newDate });
    emit('setDate', newDate, newTodo);
}

function onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    updateDueDate(input.value ? new Date(input.value) : null);
}
</script>

<template>
    <Dialog.Root>
        <Dialog.Activator>
            <div
                v-if="dueDateProps.showDetail"
                class="date-field"
            >
                <input
                    class="date-field__input"
                    :value="formattedDate"
                    placeholder="date"
                    readonly
                    autocomplete="off"
                />
                <button
                    class="date-field__action"
                    type="button"
                    :aria-label="dueDateProps.todoDueDate ? 'Clear date' : 'Pick date'"
                    @click.stop="dueDateProps.todoDueDate ? updateDueDate(null) : undefined"
                >
                    <i :class="dueDateProps.todoDueDate ? 'mdi mdi-close' : 'mdi mdi-calendar'" />
                </button>
            </div>
            <Button.Root
                v-else
                class="icon-btn"
                aria-label="Set due date"
            >
                <Button.Icon>
                    <i class="mdi mdi-calendar" />
                </Button.Icon>
            </Button.Root>
        </Dialog.Activator>

        <Dialog.Content class="date-dialog">
            <div class="date-dialog__header">
                <Dialog.Title class="date-dialog__title">
                    Set Due Date
                </Dialog.Title>
                <Dialog.Close>
                    <button class="close-btn" aria-label="Close">
                        <i class="mdi mdi-close" />
                    </button>
                </Dialog.Close>
            </div>
            <div class="date-dialog__body">
                <input
                    class="native-date-input"
                    type="date"
                    :value="dateInputValue"
                    @change="onDateInput"
                />
            </div>
            <div class="date-dialog__actions">
                <Dialog.Close>
                    <button
                        class="btn btn--clear"
                        type="button"
                        @click="updateDueDate(null)"
                    >
                        Clear
                    </button>
                </Dialog.Close>
            </div>
        </Dialog.Content>
    </Dialog.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 18px;
}

.date-field {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    width: 100%;
}

.date-field__input {
    flex: 1;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    outline: none;
}

.date-field__action {
    padding: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: inherit;
    display: flex;
    align-items: center;
}

.date-dialog {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border: none;
    border-radius: 12px;
    padding: 20px;
    width: 320px;
    max-width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

.date-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.date-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.date-dialog__title {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
}

.close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.close-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.close-btn .mdi {
    font-size: 16px;
}

.date-dialog__body {
    margin-bottom: 16px;
}

.native-date-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
    box-sizing: border-box;
}

.native-date-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.date-dialog__actions {
    display: flex;
    justify-content: flex-end;
}

.btn--clear {
    padding: 6px 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.btn--clear:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
