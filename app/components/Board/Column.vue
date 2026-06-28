<script setup lang="ts">
const listsStore = useListsStore();
const router = useRouter();

const { status } = defineProps<{ status: Status }>();

const isComposing = ref(false);
const newTodoName = ref('');

const today = new Date();
today.setHours(0, 0, 0, 0);

const todos = computed(() => {
    if (!listsStore.currentList?.todos?.length || !status?.name) return [];
    return listsStore.currentList.todos.filter((todo: Todo) => todo.status === status.name);
});

function isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.status === 'Closed') return false;
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    return d < today;
}

function formatDue(todo: Todo): string {
    if (!todo.dueDate) return '';
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === -1) return 'Yesterday';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const PRIORITY_COLORS: Record<string, string> = {
    high: '#ba1b24',
    medium: '#e07b1f',
    low: '#506076',
};

function priorityColor(level: string): string | null {
    return PRIORITY_COLORS[level?.toLowerCase()] ?? null;
}

function priorityIcon(level: string): string {
    return ['high', 'medium'].includes(level?.toLowerCase()) ? 'mdi-flag' : 'mdi-flag-outline';
}

function toggleStatus(todo: Todo) {
    todo.status = todo.status === 'Closed' ? 'Open' : 'Closed';
    listsStore.updateTodo(todo);
}

function handleDragChange(evt: any) {
    if (evt?.added?.element) {
        const todo = evt.added.element as Todo;
        if (todo.status !== status.name) {
            todo.status = status.name;
            listsStore.updateTodo(todo);
        }
    }
}

async function submitCard() {
    const name = newTodoName.value.trim();
    if (!name) return;
    listsStore.newTodo.name = name;
    listsStore.newTodo.status = status.name;
    await listsStore.addTodo();
    newTodoName.value = '';
    isComposing.value = false;
}

function onComposerKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitCard();
    }
    if (e.key === 'Escape') {
        isComposing.value = false;
        newTodoName.value = '';
    }
}
</script>

<template>
    <div class="d-flex flex-column">
        <!-- Column header -->
        <v-row
            no-gutters
            align="center"
            class="pb-3 px-1"
        >
            <v-col class="d-flex align-center ga-2">
                <span
                    :style="{
                        background: status.color,
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        flexShrink: 0,
                    }"
                />
                <span class="text-subtitle-2 font-weight-bold text-truncate">{{ status.name }}</span>
                <v-chip
                    density="compact"
                    size="x-small"
                    class="font-weight-medium"
                >
                    {{
                        todos.length
                    }}
                </v-chip>
            </v-col>
            <v-col />
            <v-col
                cols="auto"
                class="d-flex align-center"
            >
                <v-btn
                    icon
                    density="compact"
                    variant="text"
                    size="small"
                    title="Add card"
                    @click="isComposing = true"
                >
                    <v-icon size="18">
                        mdi-plus
                    </v-icon>
                </v-btn>
                <BoardOptions :status="status" />
            </v-col>
        </v-row>

        <!-- Column body -->
        <div class="overflow-y-auto overflow-x-hidden d-flex flex-column ga-2 flex-grow-1 pa-1">
            <!-- Composer -->
            <v-card
                v-if="isComposing"
                variant="flat"
                :style="{
                    border: '1px solid rgba(var(--v-border-color), 0.18)',
                    borderLeft: `3px solid ${status.color}`,
                }"
            >
                <v-card-item class="pa-3">
                    <v-textarea
                        v-model="newTodoName"
                        placeholder="What needs doing?"
                        :rows="2"
                        auto-grow
                        hide-details
                        variant="plain"
                        density="compact"
                        autofocus
                        @keydown="onComposerKey"
                    />
                    <div class="d-flex ga-2 mt-2">
                        <v-btn
                            size="small"
                            color="primary"
                            variant="flat"
                            density="compact"
                            @mousedown.prevent="submitCard"
                        >
                            Add card
                        </v-btn>
                        <v-btn
                            size="small"
                            variant="text"
                            density="compact"
                            @mousedown.prevent="
                                isComposing = false;
                                newTodoName = '';
                            "
                        >
                            Cancel
                        </v-btn>
                    </div>
                </v-card-item>
            </v-card>

            <!-- Draggable cards -->
            <draggable
                :list="todos"
                item-key="id"
                group="status"
                class="d-flex flex-column ga-2"
                style="min-height: 4px"
                @change="handleDragChange"
            >
                <template #item="{ element: todo }">
                    <v-card
                        class="todo-card"
                        variant="flat"
                        :style="{
                            border: '1px solid rgba(var(--v-border-color), 0.18)',
                            borderLeft: `4px solid ${status.color}`,
                            cursor: 'pointer',
                            opacity: todo.status === 'Closed' ? 0.7 : 1,
                        }"
                        @click="router.push(`/todo/${todo.id}`)"
                    >
                        <v-card-item class="pa-3">
                            <v-row
                                no-gutters
                                align="start"
                            >
                                <!-- Checkbox -->
                                <v-col
                                    cols="auto"
                                    class="pt-1 pr-2"
                                >
                                    <button
                                        class="card-check"
                                        :class="{ 'card-check--done': todo.status === 'Closed' }"
                                        :style="todo.status === 'Closed'
                                            ? { background: status.color }
                                            : {}
                                        "
                                        @click.stop="toggleStatus(todo)"
                                    >
                                        <v-icon
                                            v-if="todo.status === 'Closed'"
                                            size="11"
                                            color="white"
                                        >
                                            mdi-check
                                        </v-icon>
                                    </button>
                                </v-col>

                                <!-- Body -->
                                <v-col class="overflow-hidden d-flex flex-column ga-2">
                                    <div
                                        class="font-weight-bold text-body-2"
                                        :class="todo.status === 'Closed' ? 'text-disabled' : ''"
                                        :style="{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.32',
                                            textDecoration:
                                                todo.status === 'Closed' ? 'line-through' : 'none',
                                        }"
                                    >
                                        {{ todo.name }}
                                    </div>

                                    <!-- Meta row -->
                                    <v-row
                                        v-if="
                                            todo.priorityLev
                                                || todo.dueDate
                                                || todo.subtasks?.length
                                        "
                                        no-gutters
                                        align="center"
                                        class="flex-wrap ga-2"
                                    >
                                        <v-col
                                            v-if="
                                                todo.priorityLev && priorityColor(todo.priorityLev)
                                            "
                                            cols="auto"
                                            :title="todo.priorityLev + ' priority'"
                                        >
                                            <v-icon
                                                size="13"
                                                :color="priorityColor(todo.priorityLev)!"
                                            >
                                                {{ priorityIcon(todo.priorityLev) }}
                                            </v-icon>
                                        </v-col>

                                        <v-col
                                            v-if="todo.dueDate"
                                            cols="auto"
                                            class="d-flex align-center ga-1 text-caption font-weight-medium"
                                            :class="isOverdue(todo)
                                                ? 'text-error'
                                                : 'text-medium-emphasis'
                                            "
                                        >
                                            <v-icon size="13">
                                                {{
                                                    isOverdue(todo)
                                                        ? 'mdi-calendar-alert'
                                                        : 'mdi-calendar-blank-outline'
                                                }}
                                            </v-icon>
                                            {{ formatDue(todo) }}
                                        </v-col>

                                        <v-col
                                            v-if="todo.subtasks?.length"
                                            cols="auto"
                                        >
                                            <span
                                                class="d-inline-flex align-center ga-1 text-caption font-weight-medium"
                                                :class="todo.subtasks.filter(
                                                    (s) => s.status === 'Closed',
                                                ).length === todo.subtasks.length
                                                    ? 'text-success'
                                                    : 'text-medium-emphasis'
                                                "
                                            >
                                                <v-icon size="13">
                                                    {{
                                                        todo.subtasks.filter(
                                                            (s) => s.status === 'Closed',
                                                        ).length === todo.subtasks.length
                                                            ? 'mdi-checkbox-multiple-marked-outline'
                                                            : 'mdi-checkbox-multiple-blank-outline'
                                                    }}
                                                </v-icon>
                                                {{
                                                    todo.subtasks.filter(
                                                        (s) => s.status === 'Closed',
                                                    ).length
                                                }}/{{ todo.subtasks.length }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card-item>
                    </v-card>
                </template>
            </draggable>

            <!-- Empty state -->
            <v-btn
                v-if="todos.length === 0 && !isComposing"
                variant="outlined"
                block
                class="text-medium-emphasis"
                style="border-style: dashed"
                @click="isComposing = true"
            >
                <v-icon>mdi-plus</v-icon>
                Add a card
            </v-btn>
        </div>
    </div>
</template>

<style scoped>
.card-check {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 2px;
  padding: 0;
  cursor: pointer;
  border: 1.5px solid rgba(var(--v-border-color), 0.38);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.12s,
    border-color 0.12s;
}

.card-check--done {
  border-width: 0;
}

.todo-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
