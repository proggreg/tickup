<script setup lang="ts">
import { Button } from '@vuetify/v0';

const dialog = useDialog();
const { smAndDown } = useDisplay();
const user = useSupabaseUser();
const loggedIn = computed(() => !!user.value);
</script>

<template>
    <!-- Top app bar -->
    <header class="app-bar">
        <div class="app-bar__start">
            <img
                src="/android-chrome-512x512.png"
                class="app-bar__logo"
                alt="App logo"
            >

            <nav
                v-if="loggedIn"
                class="app-bar__nav"
            >
                <NuxtLink
                    to="/"
                    class="bar-nav-item"
                    active-class="bar-nav-item--active"
                >
                    <i class="mdi mdi-home" />
                    <span v-if="!smAndDown">Home</span>
                </NuxtLink>
                <NuxtLink
                    to="/settings"
                    class="bar-nav-item"
                    active-class="bar-nav-item--active"
                >
                    <i class="mdi mdi-cog" />
                    <span v-if="!smAndDown">Settings</span>
                </NuxtLink>
                <button
                    class="bar-nav-item bar-nav-item--btn"
                    data-testid="new-list-button"
                    @click="dialog.page = 'list'; dialog.open = true;"
                >
                    <i class="mdi mdi-plus" />
                    <span v-if="!smAndDown">New List</span>
                </button>
            </nav>
        </div>

        <div class="app-bar__content">
            <Search />
        </div>

        <div class="app-bar__end">
            <AppDarkMode />
        </div>
    </header>

    <!-- Side navigation drawer (lists only) -->
    <nav
        v-if="loggedIn"
        class="nav-drawer"
        data-testid="nav-bar"
    >
        <!-- Lists -->
        <div class="nav-lists">
            <ListNew
                :open="dialog"
                @close="dialog.open = false"
            />
            <AppNavItems />
        </div>

    </nav>
</template>

<style scoped>
/* App bar */
.app-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    background: rgb(var(--v-theme-surface-container-lowest));
    box-shadow: 0 4px 24px rgba(42, 52, 57, 0.05);
    z-index: 200;
}

.app-bar__start {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.app-bar__logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: block;
    margin-right: 4px;
}

.app-bar__nav {
    display: flex;
    align-items: center;
    gap: 2px;
}

.bar-nav-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    text-decoration: none;
    color: rgba(var(--v-theme-on-surface), 0.7);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
    white-space: nowrap;
}

.bar-nav-item .mdi {
    font-size: 18px;
}

.bar-nav-item:hover {
    background: rgb(var(--v-theme-surface-container));
    color: rgb(var(--v-theme-on-surface));
}

.bar-nav-item--active {
    background: rgb(var(--v-theme-primary-container));
    color: rgb(var(--v-theme-on-primary-container));
}

.bar-nav-item--btn {
    border: none;
    background: transparent;
    font-family: inherit;
    cursor: pointer;
}

.app-bar__content {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
}

.app-bar__end {
    flex-shrink: 0;
}

/* Side nav (lists only) */
.nav-drawer {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    width: 220px;
    background: rgb(var(--v-theme-surface-container-low));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
}

.nav-lists {
    flex: 1;
    overflow: hidden;
    padding: 8px;
    display: flex;
    flex-direction: column;
}

/* Context menu */
.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    transition: background 0.1s;
}

.menu-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-btn--danger {
    color: rgb(var(--v-theme-error));
}

.menu-btn--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}
</style>
