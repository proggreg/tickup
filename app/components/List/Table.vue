<script setup lang="ts">
const settingsStore = useSettingsStore();
const listsStore = useListsStore();

const columns = reactive([
    { title: 'Title', key: 'name', sortable: true },
    { title: 'Description', key: 'desc', sortable: true },
    { title: 'Date', key: 'dueDate', sortable: true },
    { title: '', key: 'actions', sortable: false },
    {
        title: 'Status',
        key: 'status',
        sortable: true,
        sort: (a: string, b: string) => {
            return settingsStore.statuses.findIndex(status => status.name === a)
                - settingsStore.statuses.findIndex(status => status.name === b);
        },
    },
]);

// Groups open/closed state
const openGroups = ref(new Set<string>(['Open']));

function isGroupOpen(groupItem: { key: string; value: string }) {
    return openGroups.value.has(groupItem.value as string);
}

function toggleGroup(groupItem: { key: string; value: string }) {
    const val = groupItem.value as string;
    if (openGroups.value.has(val)) {
        openGroups.value.delete(val);
    }
    else {
        openGroups.value.add(val);
    }
    // trigger reactivity
    openGroups.value = new Set(openGroups.value);
}

// Sort state
const sortBy = ref<{ key: string; order: string }[]>([]);

function toggleSort(column: { key: string; sortable?: boolean }) {
    if (!column.sortable) return;
    const existing = sortBy.value.findIndex(s => s.key === column.key);
    if (existing === -1) {
        sortBy.value = [...sortBy.value, { key: column.key, order: 'asc' }];
    }
    else if (sortBy.value[existing].order === 'asc') {
        sortBy.value = sortBy.value.map((s, i) => i === existing ? { ...s, order: 'desc' } : s);
    }
    else {
        sortBy.value = sortBy.value.filter((_, i) => i !== existing);
    }
}

// Build grouped items in the same format that ListTableGroupHeader/ListTableItem expect
const groupedItems = computed(() => {
    const todos = listsStore.currentList.todos || [];

    // Group by status, preserving settings store status order
    const statusOrder = settingsStore.statuses.map(s => s.name);
    const groupMap = new Map<string, typeof todos>();

    for (const todo of todos) {
        const status = todo.status || 'Unknown';
        if (!groupMap.has(status)) groupMap.set(status, []);
        groupMap.get(status)!.push(todo);
    }

    // Sort statuses by settings order
    const sortedKeys = [...groupMap.keys()].sort((a, b) => {
        const ai = statusOrder.indexOf(a);
        const bi = statusOrder.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    return sortedKeys.map(statusName => {
        let items = groupMap.get(statusName)!;

        // Apply sort
        if (sortBy.value.length) {
            items = [...items].sort((a, b) => {
                for (const { key, order } of sortBy.value) {
                    const colDef = columns.find(c => c.key === key);
                    let av = (a as any)[key];
                    let bv = (b as any)[key];

                    let cmp = 0;
                    if (colDef?.sort) {
                        cmp = colDef.sort(av, bv);
                    }
                    else {
                        if (av == null) av = '';
                        if (bv == null) bv = '';
                        cmp = String(av).localeCompare(String(bv));
                    }

                    if (cmp !== 0) return order === 'desc' ? -cmp : cmp;
                }
                return 0;
            });
        }

        return {
            key: 'status',
            value: statusName,
            items: items.map(todo => ({
                key: todo.id,
                raw: todo,
                columns: {
                    name: todo.name,
                    desc: todo.desc,
                    dueDate: todo.dueDate,
                    status: todo.status,
                    actions: '',
                },
            })),
        };
    });
});

const expanded = ref<string[]>(['Open']);
</script>

<template>
    <div class="table-wrapper">
        <table
            v-if="groupedItems.length"
            class="data-table"
        >
            <tbody>
                <template
                    v-for="groupItem in groupedItems"
                    :key="groupItem.value"
                >
                    <ListTableGroupHeader
                        :columns="columns"
                        :group-item="groupItem"
                        :is-group-open="isGroupOpen"
                        :toggle-group="toggleGroup"
                        :sort-by="sortBy"
                        :toggle-sort="toggleSort"
                        :expanded="expanded"
                    />
                </template>
            </tbody>
        </table>
        <AppEmptyState v-else />
    </div>
</template>

<style scoped>
.table-wrapper {
    width: 100%;
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9375rem;
}

.data-table :deep(th),
.data-table :deep(td) {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}
</style>
