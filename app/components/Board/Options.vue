<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const store = useListsStore();
const on = useToolbar();
const { status } = defineProps<{ status: Status }>();
const selectAll = () => {
    for (const todo of store.currentList.todos) {
        if (todo.status === status.name) {
            todo.selected = true;
        }
    }
    on.value = true;
};

const unselectAll = () => {
    for (const todo of store.currentList.todos) {
        if (todo.status === status.name) {
            todo.selected = false;
        }
    }
    on.value = true;
};
</script>

<template>
    <div>
        <Popover.Root>
            <Popover.Activator>
                <Button.Root
                    class="icon-btn"
                    aria-label="Column options"
                >
                    <Button.Icon>
                        <i class="mdi mdi-dots-horizontal" />
                    </Button.Icon>
                </Button.Root>
            </Popover.Activator>
            <Popover.Content class="menu-content">
                <ul class="menu-list">
                    <li class="menu-item" @click="selectAll">
                        Select All
                    </li>
                    <li class="menu-item" @click="unselectAll">
                        Unselect All
                    </li>
                </ul>
            </Popover.Content>
        </Popover.Root>
    </div>
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

.menu-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 140px;
    z-index: 100;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
