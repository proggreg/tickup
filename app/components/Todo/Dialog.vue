<script setup lang="ts">
const dialog = useDialog();
const listsStore = useListsStore();
const { notify } = useNotification();
const { mobile } = useDisplay();

const isOpen = computed(() => dialog.value.open && dialog.value.page === 'todo');

const name = ref('');
const dueDate = ref<Date | undefined>(undefined);
const selectedListId = ref<string | null>(null);

const todo = computed<Todo>(() => ({
    name: name.value,
    dueDate: dueDate.value,
    listId: selectedListId.value ?? undefined,
    status: 'Open',
    desc: '',
    edit: false,
    color: '#87909e',
    links: [],
    attachments: [],
    priorityLev: '',
}));

function close() {
    dialog.value.open = false;
}

function resetState() {
    dialog.value.page = '';
    name.value = '';
    dueDate.value = undefined;
    selectedListId.value = null;
}

async function addTodo() {
    const created = await listsStore.addTodo(todo.value);
    if (created.id) {
        close();
        notify('Todo Created', { link: `/todo/${created.id}` });
    }
}
</script>

<template>
    <v-dialog
        :model-value="isOpen"
        max-width="576"
        :transition="mobile ? 'dialog-top-transition' : 'dialog-bottom-transition'"
        :style="mobile ? 'align-items: flex-start;' : ''"
        @update:model-value="close"
        @after-leave="resetState"
    >
        <v-card
            rounded="lg"
            elevation="0"
            style="border: 1px solid rgba(var(--v-theme-outline-variant), 0.3); box-shadow: 0 24px 40px -10px rgba(0, 90, 194, 0.08); overflow: hidden; position: relative;"
        >
            <v-card-item class="px-6 pt-5 pb-2">
                <template #title>
                    <span
                        class="text-caption font-weight-bold text-uppercase"
                        style="letter-spacing: 0.1em;"
                        data-testid="dialog-title"
                    >
                    New Task
                    </span>
                </template>
                <template #append>
                    <v-btn
                        icon="mdi-close"
                        variant="text"
                        size="small"
                        density="compact"
                        data-testid="dialog-close"
                        @click="close"
                    />
                </template>
            </v-card-item>

            <v-card-text class="px-6 pb-6 pt-2">
                <v-text-field
                    v-model="name"
                    variant="underlined"
                    placeholder="What needs to be done?"
                    data-testid="new-todo-input"
                    class="mb-4"
                    autofocus
                    hide-details
                    @keyup.enter="addTodo"
                />

                <v-row>
                    <v-col>
                        <ListSelect
                            v-model="selectedListId"
                            label="List"
                            variant="plain"
                            density="compact"
                        >
                            <template #prepend-inner>
                                <v-icon
                                    size="16"
                                    color="on-surface"
                                    class="mr-1"
                                >
                                    mdi-format-list-bulleted
                                </v-icon>
                            </template>
                        </ListSelect>
                    </v-col>
                    <v-col cols="auto">
                        <AppDueDate
                            :todo="todo"
                            :todo-due-date="dueDate"
                            @set-date="(newDate: Date) => dueDate = newDate"
                        />
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions
                class="px-6 py-3"
                style="background: rgba(var(--v-theme-surface-variant), 0.15);"
            >
                <v-spacer />
                <v-btn
                    variant="text"
                    size="small"
                    class="text-medium-emphasis"
                    @click="close"
                >
                    Cancel
                </v-btn>
                <v-btn
                    color="primary"
                    size="small"
                    :disabled="name === ''"
                    data-testid="create-todo-button"
                    @click="addTodo"
                >
                    Save Task
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
:deep(.v-text-field:not(.v-select) .v-field__input) {
    font-size: 1.4rem;
    font-weight: 500;
    padding-top: 4px;
    padding-bottom: 8px;
}

:deep(.v-text-field:not(.v-select) input::placeholder) {
    color: rgb(var(--v-theme-outline));
    opacity: 1;
}

:deep(.v-select .v-field__clearable) {
    align-self: center;
}

:deep(.v-select .v-field__clearable .v-icon) {
    --v-icon-size-multiplier: 0.75;
}
</style>
