<script setup lang="ts">
import { Checkbox } from '@vuetify/v0';
import AppDeleteButton from '../App/DeleteButton.vue';
import type { Column, GroupItem, TableItem } from '../../types/table-item.types';
import ListStatus from './Status.vue';

const store = useListsStore();
const { xs } = useDisplay();
const props = defineProps<{
    groupItem: GroupItem;
    columns: Column[];
}>();

function showModal(item: TableItem) {
    store.setCurrentTodo(item.raw);
    navigateTo(`/todo/${item.raw.id}`);
}

function formatDate(date: Date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
}
</script>

<template>
    <tr
        v-for="item in props.groupItem.items"
        :key="item.key"
        class="table-row"
        tabindex="0"
        @click="showModal(item)"
    >
        <td class="status-cell">
            <ListStatus :todo="item.raw" />
        </td>
        <template
            v-for="column in props.columns"
            :key="column.key"
        >
            <template v-if="column.key !== 'data-table-group'">
                <td
                    v-if="column.key === 'name'"
                    colspan="6"
                    class="name-cell"
                >
                    <span
                        class="cell-text"
                        data-testid="todo-title"
                    >
                        {{ item.columns[column.key] }}
                    </span>
                </td>
                <td
                    v-else-if="column.key === 'dueDate' && !xs"
                    colspan="2"
                    class="date-cell"
                >
                    <span class="cell-text">{{ formatDate(item.columns[column.key]) }}</span>
                </td>
                <td
                    v-else-if="column.key === 'actions' && !xs"
                    colspan="4"
                    class="actions-cell"
                >
                    <div class="actions-cell__inner">
                        <Checkbox.Root
                            v-model="item.raw.selected"
                            class="row-checkbox"
                            @click.stop
                        >
                            <Checkbox.Indicator class="row-checkbox__indicator">
                                <i class="mdi mdi-check" />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <AppDeleteButton :todo="item.raw" />
                    </div>
                </td>
            </template>
        </template>
    </tr>
</template>

<style scoped>
.table-row {
    cursor: pointer;
}

.table-row:hover {
    background: rgba(var(--v-border-color), 0.06);
}

.status-cell {
    width: 10px;
}

.name-cell {
    font-size: 1rem;
}

.date-cell {
    font-size: 1rem;
}

.cell-text {
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 250px;
}

.date-cell .cell-text {
    max-width: 120px;
}

.actions-cell {
    font-size: 1rem;
}

.actions-cell__inner {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
}

.row-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(var(--v-border-color), 0.4);
    border-radius: 3px;
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
    transition: border-color 0.15s;
}

.row-checkbox:hover {
    border-color: rgb(var(--v-theme-primary));
}

.row-checkbox__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--v-theme-primary));
    font-size: 11px;
}
</style>
