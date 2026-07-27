<script setup lang="ts">
const dialog = useDialog();
const { smAndDown } = useDisplay();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const loggedIn = computed(() => !!user.value);
const searchRef = ref<{ open: boolean } | null>(null);

const acctOpen = ref(false);

async function signOut() {
    acctOpen.value = false;
    await supabase.auth.signOut();
    await navigateTo('/login');
}
</script>

<template>
    <v-navigation-drawer
        v-if="loggedIn"
        height="100vh"
        :rail="smAndDown"
        :expand-on-hover="smAndDown"
        permanent
        class="font-weight-bold"
        data-testid="nav-bar"
    >
        <Search ref="searchRef" />

        <v-list nav class="flex-shrink-0">
            <v-list-item prepend-icon="mdi-view-dashboard-outline" title="My Work" to="/" />
            <v-list-item
                prepend-icon="mdi-magnify"
                title="Search"
                @click="searchRef && (searchRef.open = true)"
            />
            <v-divider class="mt-1 mb-0" />
        </v-list>

        <v-list nav class="overflow-y-auto flex-grow-1">
            <ListNew :open="dialog" @close="dialog.open = false" />
            <AppNavItems />
        </v-list>

        <template #append>
            <div class="nav-account-footer">
                <v-menu
                    v-model="acctOpen"
                    location="top"
                    :offset="6"
                    :close-on-content-click="true"
                >
                    <template #activator="{ props: menuProps }">
                        <button
                            class="nav-account-row"
                            :class="{ 'nav-account-row--open': acctOpen }"
                            v-bind="menuProps"
                        >
                            <div class="nav-account-avatar">
                                <i class="mdi mdi-account" style="font-size: 16px" />
                            </div>
                            <span class="nav-account-email">{{ user?.email }}</span>
                            <i
                                class="mdi nav-account-chevron"
                                :class="acctOpen ? 'mdi-chevron-down' : 'mdi-chevron-up'"
                            />
                        </button>
                    </template>
                    <div class="nav-account-popover">
                        <button
                            class="nav-account-popover-item"
                            @click="
                                navigateTo('/settings');
                                acctOpen = false;
                            "
                        >
                            <i class="mdi mdi-cog-outline nav-account-popover-item__icon" />
                            Settings
                        </button>
                        <button class="nav-account-popover-item" @click="signOut">
                            <i class="mdi mdi-logout nav-account-popover-item__icon" />
                            Sign out
                        </button>
                    </div>
                </v-menu>
            </div>
        </template>
    </v-navigation-drawer>
</template>

<style scoped>
:deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: hidden;
}

:deep(.v-virtual-scroll) {
    scrollbar-width: none;
}

:deep(.v-virtual-scroll::-webkit-scrollbar) {
    display: none;
}

:deep(.v-list-item-title) {
    text-transform: capitalize !important;
    font-weight: bold;
}

/* ── Account footer ───────────────────────────────────────────────────────── */
.nav-account-footer {
    border-top: 1px solid rgba(113, 124, 130, 0.16);
    padding: 8px;
}

.nav-account-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: background 0.1s;
}

.nav-account-row:hover,
.nav-account-row--open {
    background: rgba(113, 124, 130, 0.1);
}

.nav-account-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #dce8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #004eaa;
}

.nav-account-email {
    flex: 1;
    min-width: 0;
    font-family: Inter, sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #2a3439;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}

.nav-account-chevron {
    font-size: 16px;
    color: rgba(42, 52, 57, 0.38);
    flex-shrink: 0;
}
</style>

<style>
.nav-account-popover {
    background: #ffffff;
    border: 1px solid rgba(113, 124, 130, 0.16);
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 12px 32px rgba(42, 52, 57, 0.18);
}

.nav-account-popover-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: #2a3439;
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: background 0.08s;
}

.nav-account-popover-item:hover {
    background: rgba(113, 124, 130, 0.1);
}

.nav-account-popover-item__icon {
    font-size: 18px;
    opacity: 0.6;
}
</style>
