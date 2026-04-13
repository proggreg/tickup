<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const store = useListsStore();
const emit = defineEmits(['rename', 'settings']);
const { listId } = defineProps<{
    listId?: string;
}>();

async function deleteList() {
    if (listId) {
        await store.deleteList(listId);
        await navigateTo('/');
    }
}

function renameList() {
    emit('rename');
}
const options = reactive([{
    name: 'Rename',
    handler: renameList,
    icon: 'mdi-pencil',
},
{
    name: 'Delete',
    handler: deleteList,
    icon: 'mdi-delete',
    destructive: true,
}]);
</script>

<template>
    <Popover.Root>
        <Popover.Activator>
            <Button.Root
                class="icon-btn"
                aria-label="List options"
            >
                <Button.Icon>
                    <i class="mdi mdi-dots-vertical" />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>
        <Popover.Content class="menu-content">
            <ul class="menu-list">
                <li
                    v-for="(option, index) in options"
                    :key="index"
                    class="menu-item"
                    :class="option.destructive ? 'menu-item--danger' : ''"
                    @click.passive="option.handler"
                >
                    <i :class="`mdi ${option.icon} menu-item__icon`" />
                    <span class="menu-item__label">{{ option.name }}</span>
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
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
    gap: 8px;
    padding: 8px 12px;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item--danger {
    color: rgb(var(--v-theme-error));
}

.menu-item--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}

.menu-item__icon {
    font-size: 16px;
    width: 20px;
}

.menu-item__label {
    font-size: 0.875rem;
}
</style>
