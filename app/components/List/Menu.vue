<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const listsStore = useListsStore();
const { isMobile } = useDevice();
const { listId } = defineProps<{
    listId: string;
}>();

function deleteList() {
    console.log('Delete List');

    listsStore.deleteList(listId);

    let route = '/lists';
    if (!isMobile) {
        route = '/';
    }
    navigateTo(route);
}
</script>

<template>
    <Popover.Root>
        <Popover.Activator>
            <Button.Root
                class="icon-btn"
                :data-testid="`setting-button-${listId}`"
                aria-label="List settings"
                @click.stop.prevent
            >
                <Button.Icon>
                    <i class="mdi mdi-dots-vertical" style="font-size: 18px;" />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>
        <Popover.Content class="menu-content" @click.stop>
            <ul class="menu-list">
                <li class="menu-item">
                    <NuxtLink
                        class="menu-link"
                        :to="`/list/${listId}/settings`"
                    >
                        <i class="mdi mdi-cog menu-item__icon" />
                        <span>List Settings</span>
                    </NuxtLink>
                </li>
                <li
                    class="menu-item menu-item--danger"
                    @click.stop="deleteList"
                >
                    <i class="mdi mdi-delete menu-item__icon" />
                    <span data-test-id="delete-list">Delete List</span>
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

.menu-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 160px;
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
    font-size: 18px;
    width: 20px;
}

.menu-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: inherit;
    text-decoration: none;
    width: 100%;
}
</style>
