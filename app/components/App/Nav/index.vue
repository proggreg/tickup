<script setup lang="ts">
const dialog = useDialog();
const { smAndDown } = useDisplay();
const user = useSupabaseUser();
const loggedIn = computed(() => !!user.value);
const contextMenuOpen = ref(false);
const selectedList = ref<List>();
const listsStore = useListsStore();

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
    <v-app-bar extension-height="0">
        <template #prepend>
            <img
                class="pa-6"
                src="/android-chrome-512x512.png"
                width="40"
                style="border-radius: 50%"
                alt="Tickup"
            />
        </template>

        <Search />

        <template #append>
            <AppDarkMode />
        </template>
        <template #extension>
            <v-divider />
        </template>
    </v-app-bar>

    <v-navigation-drawer
        v-if="loggedIn"
        :rail="smAndDown"
        :expand-on-hover="smAndDown"
        permanent
        class="font-weight-bold"
        data-testid="nav-bar"
    >
        <v-list nav class="flex-shrink-0">
            <v-list-item
                prepend-icon="mdi-home"
                title="Home"
                to="/"
            />
            <v-list-item
                prepend-icon="mdi-cog"
                title="Settings"
                to="/settings"
            />
            <v-list-item
                prepend-icon="mdi-plus"
                title="New List"
                data-testid="new-list-button"
                @click="dialog.page = 'list'; dialog.open = true;"
            />
            <v-divider class="my-2" />
        </v-list>

        <v-list nav class="overflow-y-auto flex-grow-1">
            <ListNew
                :open="dialog"
                @close="dialog.open = false"
            />
            <AppNavItems @open="openContextMenu" />
        </v-list>

        <v-menu
            v-model="contextMenuOpen"
            location-strategy="connected"
        >
            <v-list nav>
                <v-list-item>
                    <v-btn
                        variant="text"
                        color="red"
                        icon="mdi-trash-can"
                        @click="deleteList"
                    />
                </v-list-item>
            </v-list>
        </v-menu>

        <template #append>
            <AppMenu v-if="smAndDown" />
        </template>
    </v-navigation-drawer>
</template>

<style scoped>
:deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
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
</style>
