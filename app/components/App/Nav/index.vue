<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const dialog = useDialog();
const { smAndDown } = useDisplay();
const user = useSupabaseUser();
const loggedIn = computed(() => !!user.value);
const contextMenuOpen = ref(false);
const selectedList = ref<List>();
const listsStore = useListsStore();
const navOpen = useNav();

function openContextMenu(_event: MouseEvent, list: List) {
    contextMenuOpen.value = true;
    selectedList.value = list;
}

function deleteList() {
    contextMenuOpen.value = false;
    listsStore.deleteList(selectedList.value.id);
}
</script>

<template>
    <!-- Top app bar -->
    <header class="app-bar">
        <div class="app-bar__prepend">
            <img
                src="/android-chrome-512x512.png"
                class="app-bar__logo"
                alt="App logo"
            >
        </div>

        <div class="app-bar__content">
            <Search />
        </div>

        <div class="app-bar__append">
            <AppDarkMode />
        </div>

        <div class="app-bar__extension">
            <hr class="app-bar__divider">
        </div>
    </header>

    <!-- Side navigation drawer -->
    <nav
        v-if="loggedIn"
        class="nav-drawer"
        :class="smAndDown ? 'nav-drawer--rail' : 'nav-drawer--full'"
        data-testid="nav-bar"
    >
        <!-- Primary nav items -->
        <ul class="nav-primary">
            <li>
                <NuxtLink
                    to="/"
                    class="nav-item"
                    active-class="nav-item--active"
                >
                    <i class="mdi mdi-home nav-item__icon" />
                    <span
                        v-if="!smAndDown"
                        class="nav-item__title"
                    >Home</span>
                </NuxtLink>
            </li>
            <li>
                <NuxtLink
                    to="/settings"
                    class="nav-item"
                    active-class="nav-item--active"
                >
                    <i class="mdi mdi-cog nav-item__icon" />
                    <span
                        v-if="!smAndDown"
                        class="nav-item__title"
                    >Settings</span>
                </NuxtLink>
            </li>
            <li>
                <Button.Root
                    class="nav-item nav-item--btn"
                    data-testid="new-list-button"
                    @click="dialog.page = 'list'; dialog.open = true;"
                >
                    <Button.Icon>
                        <i class="mdi mdi-plus nav-item__icon" />
                    </Button.Icon>
                    <span
                        v-if="!smAndDown"
                        class="nav-item__title"
                    >New List</span>
                </Button.Root>
            </li>
            <li>
                <hr class="nav-divider">
            </li>
        </ul>

        <!-- Lists -->
        <div class="nav-lists">
            <ListNew
                :open="dialog"
                @close="dialog.open = false"
            />
            <AppNavItems @open="openContextMenu" />
        </div>

        <!-- Context menu for list right-click -->
        <Popover.Root v-model:open="contextMenuOpen">
            <Popover.Content>
                <ul class="menu-list">
                    <li class="menu-item menu-item--danger">
                        <Button.Root
                            class="menu-btn menu-btn--danger"
                            @click="deleteList"
                        >
                            <Button.Icon>
                                <i class="mdi mdi-trash-can" />
                            </Button.Icon>
                        </Button.Root>
                    </li>
                </ul>
            </Popover.Content>
        </Popover.Root>

        <!-- User menu at bottom (rail mode) -->
        <div
            v-if="smAndDown"
            class="nav-footer"
        >
            <AppMenu />
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
    padding: 0 8px;
    background: rgb(var(--v-theme-surface));
    z-index: 200;
    flex-wrap: wrap;
}

.app-bar__prepend {
    flex-shrink: 0;
    padding: 0 8px;
}

.app-bar__logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: block;
}

.app-bar__content {
    flex: 1;
    min-width: 0;
}

.app-bar__append {
    flex-shrink: 0;
}

.app-bar__extension {
    width: 100%;
    flex-basis: 100%;
    height: 0;
}

.app-bar__divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
    margin: 0;
    width: 100%;
}

/* Nav drawer */
.nav-drawer {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    background: rgb(var(--v-theme-surface));
    border-right: 1px solid rgba(var(--v-border-color), 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
    font-weight: bold;
}

.nav-drawer--full {
    width: 256px;
}

.nav-drawer--rail {
    width: 56px;
    overflow: visible;
}

.nav-drawer--rail:hover {
    width: 256px;
    transition: width 0.2s;
}

.nav-primary {
    list-style: none;
    margin: 0;
    padding: 8px;
    flex-shrink: 0;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    font-weight: 600;
    min-height: 40px;
    transition: background 0.1s;
    width: 100%;
}

.nav-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.nav-item--active {
    background: rgba(var(--v-theme-primary), 0.1);
    color: rgb(var(--v-theme-primary));
}

.nav-item--btn {
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    text-align: left;
    box-sizing: border-box;
}

.nav-item__icon {
    font-size: 22px;
    flex-shrink: 0;
}

.nav-item__title {
    font-size: 0.9375rem;
    text-transform: capitalize;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.1);
    margin: 4px 0;
}

.nav-lists {
    flex: 1;
    overflow: hidden;
    padding: 0 8px;
    display: flex;
    flex-direction: column;
}

.nav-footer {
    flex-shrink: 0;
    border-top: 1px solid rgba(var(--v-border-color), 0.1);
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
