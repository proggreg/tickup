<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const supabase = useSupabaseClient();
const user = await supabase.auth.getUser();
</script>

<template>
    <Popover.Root>
        <Popover.Activator>
            <Button.Root
                class="user-btn"
                aria-label="User menu"
            >
                <span class="user-avatar">
                    <i class="mdi mdi-account" />
                </span>
                <span
                    v-if="user.data?.user?.email"
                    class="user-email"
                >
                    {{ user.data.user.email }}
                </span>
                <i class="mdi mdi-chevron-down" />
            </Button.Root>
        </Popover.Activator>
        <Popover.Content class="menu-content">
            <ul class="menu-list">
                <li
                    class="menu-item"
                    @click="navigateTo('/settings')"
                >
                    <i class="mdi mdi-cog-outline menu-item__icon" />
                    <span>Settings</span>
                </li>
                <li
                    class="menu-item"
                    @click="signOut()"
                >
                    <i class="mdi mdi-logout menu-item__icon" />
                    <span>Sign Out</span>
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
.user-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: inherit;
    font-size: 0.875rem;
}

.user-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.user-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(var(--v-border-color), 0.12);
}

.user-avatar .mdi {
    font-size: 18px;
}

.user-email {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-size: 0.8125rem;
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

.menu-item__icon {
    font-size: 18px;
    width: 20px;
}
</style>
