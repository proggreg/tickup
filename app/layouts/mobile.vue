<script setup lang="ts">
const colorMode = useColorMode();
const route = useRoute();
const dialog = useDialog();

function addEventHandler() {
    if (route.name === 'lists') {
        dialog.value.page = 'list';
    }
    else if (route.name === 'index' || route.name === 'list-id') {
        dialog.value.page = 'todo';
    }

    dialog.value.open = true;
}

const showFab = computed(() => {
    return route.name === 'lists' || route.name === 'list-id' || route.name === 'index';
});
</script>

<template>
    <ColorScheme>
        <v-theme-provider
            with-background
            :theme="colorMode.preference"
        >
            <v-app>
                <v-main>
                    <v-container
                        class="pa-0"
                        fluid
                    >
                        <NuxtPage />
                    </v-container>
                </v-main>
                <v-btn
                    v-if="showFab"
                    class="new-todo-fab"
                    rounded="pill"
                    prepend-icon="mdi-plus"
                    text="New"
                    @click="addEventHandler"
                />
                <AppNavMobile />
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>

<style scoped>
.new-todo-fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgba(255, 255, 255, 0.15) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    letter-spacing: 0 !important;
    text-transform: none !important;
    padding: 0 24px !important;
    height: 48px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
    z-index: 10;
}
</style>
