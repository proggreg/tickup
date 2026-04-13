<script setup lang="ts">
import { Button } from '@vuetify/v0';

const { groupItem, isGroupOpen, columns, toggleGroup, sortBy, toggleSort, expanded: _expanded } = defineProps<{
    groupItem: Record<string, unknown>; // Using Record<string, unknown> for Vuetify's internal types
    isGroupOpen: (item: Record<string, unknown>) => boolean;
    columns: Record<string, unknown>[]; // Using Record<string, unknown>[] since Vuetify's internal header type is complex
    toggleGroup: (item: Record<string, unknown>) => void;
    sortBy: Record<string, unknown>[]; // Using Record<string, unknown>[] since Vuetify's internal sort type is complex
    toggleSort: (column: Record<string, unknown>) => void;
    expanded: string[];
}>();
const { statuses } = useSettingsStore();
const headerColumns = ref(columns);
const { mdAndUp } = useDisplay();

onMounted(() => {
    if (!isGroupOpen(groupItem) && groupItem.key === 'status' && groupItem.value === 'Open') {
        toggleGroup(groupItem);
    }
});

// TODO fix exapanded keep state
function getStatusColor(todoStatus: string) {
    const status = statuses.filter((status: Status) => status.name === todoStatus);
    if (status.length > 0) {
        return status[0].color;
    }
}

function isSorted(sortBy: { key: string }[], column: { key: string }) {
    return sortBy.some(item => item.key === column.key);
}

function isSortedIndex(sortBy: { key: string; order: string }[], column: { key: string }) {
    let index = sortBy.findIndex(item => item.key === column.key);
    index++;
    if (index > 0) {
        return index;
    }
    return false;
}
</script>

<template>
    <tr v-if="groupItem.key === 'status'">
        <th :colspan="2">
            <Button.Root
                class="group-toggle-btn"
                @click="toggleGroup(groupItem)"
            >
                <Button.Icon>
                    <i :class="`mdi ${isGroupOpen(groupItem) ? 'mdi-chevron-down' : 'mdi-chevron-right'}`" />
                </Button.Icon>
            </Button.Root>
            <button
                class="status-chip"
                :style="{ background: `${getStatusColor(groupItem.value)}22`, color: getStatusColor(groupItem.value) }"
                @click="toggleGroup(groupItem)"
            >
                {{ groupItem.value }}
            </button>
        </th>
        <th colspan="8" />
    </tr>
    <template v-if="isGroupOpen(groupItem)">
        <tr v-if="mdAndUp">
            <th
                colspan="1"
                class="col-header"
            >
                Status
            </th>

            <template
                v-for="column in headerColumns"
                :key="column.key"
            >
                <th
                    v-if="column.key !== 'data-table-group'
                        && column.key !== 'data-table-expand'
                        && column.key !== 'status'
                        && column.key !== 'desc'
                        && column.key !== 'dueDate'
                        && column.key !== 'actions'
                    "
                    colspan="1"
                    class="col-header col-header--sortable"
                    @click="toggleSort(column)"
                >
                    <div class="col-header__inner">
                        {{ column.title }} {{ column.key }}
                        <div class="col-header__sort">
                            <i
                                v-if="!isSorted(sortBy, column)"
                                class="mdi mdi-arrow-up sort-hint"
                            />

                            <template
                                v-for="sort in sortBy"
                                :key="sort.key"
                            >
                                <i
                                    v-if="sort.key === column.key && sort.order === 'asc'"
                                    class="mdi mdi-arrow-up"
                                />
                                <i
                                    v-if="sort.key === column.key && sort.order === 'desc'"
                                    class="mdi mdi-arrow-down"
                                />
                            </template>

                            <span
                                v-if="isSortedIndex(sortBy, column)"
                                class="sort-badge"
                            >
                                {{ isSortedIndex(sortBy, column) }}
                            </span>
                        </div>
                    </div>
                </th>
            </template>

            <th colspan="8" />
        </tr>
        <ListTableItem
            :columns="columns"
            :group-item="groupItem"
        />
        <ListTableNewItem :group-item="groupItem" />
    </template>
</template>

<style scoped>
.group-toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    padding: 0;
    margin-right: 8px;
    color: inherit;
    font-size: 1.4rem;
}

.group-toggle-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.group-toggle-btn .mdi {
    font-size: 18px;
}

.status-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    font-family: inherit;
    transition: opacity 0.15s;
}

.status-chip:hover {
    opacity: 0.8;
}

.col-header {
    font-size: 1rem;
    font-weight: 600;
    padding: 8px;
}

.col-header--sortable {
    cursor: pointer;
}

.col-header--sortable:hover {
    background: rgba(var(--v-border-color), 0.06);
}

.col-header__inner {
    display: flex;
    align-items: center;
    gap: 4px;
}

.col-header__sort {
    width: 42px;
    display: flex;
    align-items: center;
}

.col-header__sort .mdi {
    font-size: 16px;
}

.sort-hint {
    opacity: 0;
}

.col-header--sortable:hover .sort-hint {
    opacity: 0.4;
}

.sort-badge {
    font-size: 0.7rem;
    background: rgba(var(--v-border-color), 0.15);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>
