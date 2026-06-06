<script setup lang="ts">
const listsStore = useListsStore();
const { selectTodo, setClosed, setOpen } = useTodoActions();
const { isTodoClosed } = useTodoStatus();

const searchQuery = ref('');
const searchFocused = ref(false);
const listFilter = ref<string>('all');
const filterOpen = ref(false);
const filterRef = ref<HTMLElement | null>(null);

onBeforeMount(() => {
    listsStore.getRecentTodos();
});

const filterLabel = computed(() => {
    if (listFilter.value === 'all') return 'All lists';
    return listsStore.lists.find(l => l.id === listFilter.value)?.name ?? 'All lists';
});

const filterActive = computed(() => listFilter.value !== 'all');

const sortedLists = computed(() =>
    [...listsStore.lists].sort((a, b) => a.name.localeCompare(b.name)),
);

function relLabel(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 6) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-GB');
}

interface RecentRow {
    todo: Todo;
    when: { kind: 'Updated' | 'Created'; date: string };
}

const rows = computed<RecentRow[]>(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!listsStore?.recentTodos) return [];
    return listsStore?.recentTodos
        .map((todo): RecentRow => {
            const updAt = todo.updatedAt || '';
            const creAt = todo.createdAt || '';
            const updNewer = updAt >= creAt;
            const when = updNewer
                ? { kind: 'Updated' as const, date: updAt }
                : { kind: 'Created' as const, date: creAt };
            return { todo, when };
        })
        .filter(({ todo }) => {
            if (listFilter.value !== 'all' && todo.listId !== listFilter.value) return false;
            if (!q) return true;
            const listName = todo.list?.name || '';
            const haystack = [
                todo.name,
                listName,
                todo.githubBranchName || '',
                relLabel(todo.createdAt),
                relLabel(todo.updatedAt),
                todo.createdAt ? new Date(todo.createdAt).toLocaleDateString('en-GB') : '',
                todo.updatedAt ? new Date(todo.updatedAt).toLocaleDateString('en-GB') : '',
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
});

function selectFilter(id: string) {
    listFilter.value = id;
    filterOpen.value = false;
}

function onOutsideClick(e: MouseEvent) {
    if (filterRef.value && !filterRef.value.contains(e.target as Node)) {
        filterOpen.value = false;
    }
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick));
onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick));

function toggleStatus(todo: Todo) {
    if (isTodoClosed(todo.status)) {
        setOpen(todo);
    }
    else {
        setClosed(todo);
    }
}
</script>

<template>
    <div class="recent-card">
        <!-- Header -->
        <div class="recent-header">
            <div class="recent-header-left">
                <div class="icon-tile-sm accent-tile">
                    <v-icon
                        size="17"
                        class="accent-deep-icon"
                    >
                        mdi-history
                    </v-icon>
                </div>
                <span class="recent-title">Recent</span>
                <span class="recent-count">{{ rows.length }} {{ rows.length === 1 ? 'todo' : 'todos' }}</span>
            </div>
            <div class="flex-1" />
            <!-- Search box -->
            <div
                class="search-box"
                :class="{ 'search-box--focused': searchFocused }"
            >
                <v-icon
                    size="17"
                    :class="searchFocused ? 'search-icon--active' : 'search-icon'"
                >
                    mdi-magnify
                </v-icon>
                <input
                    v-model="searchQuery"
                    class="search-input"
                    placeholder="Search name, list, branch or date…"
                    @focus="searchFocused = true"
                    @blur="searchFocused = false"
                >
                <v-icon
                    v-if="searchQuery"
                    size="15"
                    class="search-clear"
                    @click="searchQuery = ''"
                >
                    mdi-close-circle
                </v-icon>
            </div>
            <!-- List filter -->
            <div
                ref="filterRef"
                class="list-filter"
            >
                <button
                    class="lf-btn"
                    :class="{
                        'lf-btn--active': filterActive,
                        'lf-btn--open': filterOpen,
                    }"
                    @click="filterOpen = !filterOpen"
                >
                    <v-icon
                        size="16"
                        class="lf-icon"
                    >
                        mdi-filter-variant
                    </v-icon>
                    <span class="lf-label">{{ filterLabel }}</span>
                    <v-icon
                        size="17"
                        class="lf-icon"
                    >
                        {{ filterOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                </button>
                <div
                    v-if="filterOpen"
                    class="lf-menu"
                >
                    <div
                        class="lf-option"
                        :class="{ 'lf-option--selected': listFilter === 'all' }"
                        @click="selectFilter('all')"
                    >
                        <span class="lf-option-label">All lists</span>
                        <v-icon
                            v-if="listFilter === 'all'"
                            size="15"
                            class="lf-check"
                        >
                            mdi-check
                        </v-icon>
                    </div>
                    <div
                        v-for="list in sortedLists"
                        :key="list.id"
                        class="lf-option"
                        :class="{ 'lf-option--selected': listFilter === list.id }"
                        @click="selectFilter(list.id!)"
                    >
                        <span class="lf-dot" />
                        <span class="lf-option-label">{{ list.name }}</span>
                        <v-icon
                            v-if="listFilter === list.id"
                            size="15"
                            class="lf-check"
                        >
                            mdi-check
                        </v-icon>
                    </div>
                </div>
            </div>
        </div>

        <v-divider />

        <!-- No results -->
        <div
            v-if="rows.length === 0 && (searchQuery || filterActive)"
            class="no-results"
        >
            <v-icon
                size="40"
                class="no-results-icon"
            >
                mdi-magnify-remove-outline
            </v-icon>
            <div class="no-results-title">
                No matches
            </div>
            <div
                v-if="searchQuery"
                class="no-results-body"
            >
                Nothing recent matches "{{ searchQuery }}".
            </div>
            <div
                v-else
                class="no-results-body"
            >
                No recent todos in {{ filterLabel }}.
            </div>
        </div>

        <!-- Table -->
        <div v-else>
            <!-- Table header -->
            <div class="table-head">
                <span>Todo</span>
                <span>List</span>
                <span>Branch</span>
                <span class="text-right">Last activity</span>
            </div>

            <!-- Table rows -->
            <div
                v-for="(row, i) in rows"
                :key="row.todo.id"
                class="table-row"
                :class="{ 'table-row--last': i === rows.length - 1 }"
                @click="selectTodo(row.todo)"
            >
                <!-- Todo cell -->
                <div class="todo-cell">
                    <div
                        class="row-check"
                        :class="isTodoClosed(row.todo.status) ? 'row-check--done' : 'row-check--open'
                        "
                        @click.stop="toggleStatus(row.todo)"
                    >
                        <v-icon
                            v-if="isTodoClosed(row.todo.status)"
                            size="12"
                            color="white"
                        >
                            mdi-check
                        </v-icon>
                    </div>
                    <div class="todo-cell-text">
                        <div
                            class="todo-name"
                            :class="{ 'todo-name--done': isTodoClosed(row.todo.status) }"
                        >
                            {{ row.todo.name }}
                        </div>
                        <div class="status-dot-row">
                            <span
                                class="status-dot"
                                :class="`status-dot--${row.todo.status?.toLowerCase()}`"
                            />
                            <span
                                class="status-label"
                                :class="`status-label--${row.todo.status?.toLowerCase()}`"
                            >
                                {{
                                    row.todo.status === 'Closed'
                                        ? 'Done'
                                        : row.todo.status === 'in_progress'
                                            ? 'In progress'
                                            : 'Open'
                                }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- List cell -->
                <div>
                    <span
                        v-if="row.todo.list?.name"
                        class="list-chip"
                    >
                        <span class="list-chip-dot" />{{ row.todo.list.name }}
                    </span>
                    <span
                        v-else
                        class="fglow-text"
                    >—</span>
                </div>

                <!-- Branch cell -->
                <div>
                    <span
                        v-if="row.todo.githubBranchName"
                        class="branch-tag"
                    >
                        <v-icon size="13">mdi-source-branch</v-icon>
                        <span class="branch-name">{{ row.todo.githubBranchName }}</span>
                    </span>
                    <span
                        v-else
                        class="fglow-text"
                    >—</span>
                </div>

                <!-- Last activity cell -->
                <div class="activity-cell">
                    <div class="activity-label">
                        {{ relLabel(row.when.date) }}
                    </div>
                    <div class="activity-kind">
                        {{ row.when.kind }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.recent-card {
  background: #ffffff;
  border: 1px solid rgba(80, 96, 118, 0.16);
  border-radius: 18px;
  box-shadow:
    0 1px 2px rgba(42, 52, 57, 0.04),
    0 8px 28px rgba(42, 52, 57, 0.06);
  overflow: hidden;
}

.recent-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  flex-wrap: wrap;
}

.recent-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flex-1 {
  flex: 1;
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

.accent-tile {
  background: color-mix(in srgb, #005ac2 11%, #ffffff);
}

.accent-deep-icon {
  color: color-mix(in srgb, #005ac2 78%, #1a2230) !important;
}

.recent-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #2a3439;
}

.recent-count {
  font-size: 12.5px;
  color: rgba(42, 52, 57, 0.62);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
  max-width: 100%;
  height: 36px;
  border-radius: 10px;
  background: #ffffff;
  border: 1.5px solid rgba(80, 96, 118, 0.16);
  padding: 0 12px;
  transition: border-color 0.15s;
}

.search-box--focused {
  border-color: #005ac2;
}

.search-icon {
  color: rgba(42, 52, 57, 0.4) !important;
  flex-shrink: 0;
}

.search-icon--active {
  color: #005ac2 !important;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #2a3439;
  min-width: 0;
}

.search-input::placeholder {
  color: rgba(42, 52, 57, 0.4);
}

.search-clear {
  color: rgba(42, 52, 57, 0.4) !important;
  cursor: pointer;
  flex-shrink: 0;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}

.no-results-icon {
  color: rgba(42, 52, 57, 0.4) !important;
  margin-bottom: 10px;
}

.no-results-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(42, 52, 57, 0.62);
  margin-bottom: 3px;
}

.no-results-body {
  font-size: 12.5px;
  color: rgba(42, 52, 57, 0.4);
}

.list-filter {
  position: relative;
  flex-shrink: 0;
}

.lf-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px 0 12px;
  border-radius: 10px;
  border: 1.5px solid rgba(80, 96, 118, 0.16);
  background: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #2a3439;
  cursor: pointer;
  white-space: nowrap;
}

.lf-btn .lf-icon {
  color: rgba(42, 52, 57, 0.4) !important;
}

.lf-btn--active {
  background: color-mix(in srgb, #005ac2 11%, #fff);
  border-color: color-mix(in srgb, #005ac2 26%, #fff);
  color: color-mix(in srgb, #005ac2 78%, #1a2230);
  font-weight: 600;
}

.lf-btn--active .lf-icon {
  color: color-mix(in srgb, #005ac2 78%, #1a2230) !important;
}

.lf-btn--open {
  border-color: #005ac2;
}

.lf-label {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lf-menu {
  position: absolute;
  top: 42px;
  right: 0;
  min-width: 200px;
  z-index: 30;
  background: #ffffff;
  border: 1px solid rgba(80, 96, 118, 0.16);
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(42, 52, 57, 0.16);
  padding: 6px;
  max-height: 280px;
  overflow-y: auto;
}

.lf-option {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  cursor: pointer;
}

.lf-option:not(.lf-option--selected):hover {
  background: rgba(80, 96, 118, 0.06);
}

.lf-option--selected {
  background: color-mix(in srgb, #005ac2 11%, #fff);
  color: color-mix(in srgb, #005ac2 78%, #1a2230);
  font-weight: 600;
}

.lf-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lf-dot {
  width: 7px;
  height: 7px;
  background: #506076;
  border-radius: 2px;
  flex-shrink: 0;
}

.lf-check {
  color: color-mix(in srgb, #005ac2 78%, #1a2230) !important;
  flex-shrink: 0;
}

.table-head {
  display: grid;
  grid-template-columns: 1.7fr 1fr 1.3fr 0.9fr;
  gap: 16px;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(80, 96, 118, 0.16);
}

.table-head span {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgba(42, 52, 57, 0.4);
}

.text-right {
  text-align: right;
}

.table-row {
  display: grid;
  grid-template-columns: 1.7fr 1fr 1.3fr 0.9fr;
  gap: 16px;
  align-items: center;
  padding: 13px 20px;
  border-bottom: 1px solid rgba(80, 96, 118, 0.16);
  background: transparent;
  cursor: pointer;
  transition: background 0.1s;
}

.table-row:hover {
  background: rgba(80, 96, 118, 0.06);
}

.table-row--last {
  border-bottom: none;
}

.todo-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.row-check {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.row-check--open {
  border: 1.8px solid rgba(80, 96, 118, 0.45);
  background: transparent;
}

.row-check--done {
  background: #2f8a5e;
  border: none;
}

.todo-cell-text {
  min-width: 0;
}

.todo-name {
  font-size: 14px;
  font-weight: 600;
  color: #2a3439;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-name--done {
  color: rgba(42, 52, 57, 0.62);
  text-decoration: line-through;
}

.status-dot-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--open {
  background: #005ac2;
}

.status-dot--in_progress {
  background: #b07515;
}

.status-dot--closed {
  background: #2f8a5e;
}

.status-label {
  font-size: 12.5px;
  font-weight: 600;
}

.status-label--open {
  color: #005ac2;
}

.status-label--in_progress {
  color: #b07515;
}

.status-label--closed {
  color: #2f8a5e;
}

.list-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: #2a3439;
  background: #f0f4f7;
  border: 1px solid rgba(80, 96, 118, 0.16);
  padding: 2px 9px;
  border-radius: 8px;
}

.list-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: #506076;
  flex-shrink: 0;
}

.branch-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
  color: #506076;
  background: color-mix(in srgb, #506076 10%, #ffffff);
  padding: 2px 8px;
  border-radius: 7px;
  max-width: 100%;
  overflow: hidden;
}

.branch-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fglow-text {
  font-size: 12.5px;
  color: rgba(42, 52, 57, 0.4);
}

.activity-cell {
  text-align: right;
  white-space: nowrap;
}

.activity-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(42, 52, 57, 0.62);
}

.activity-kind {
  font-size: 11px;
  color: rgba(42, 52, 57, 0.4);
  margin-top: 1px;
}
</style>
