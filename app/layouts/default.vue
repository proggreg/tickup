<script setup lang="ts">
const colorMode = useColorMode();
const vuetifyThemeClass = computed(() => `v-theme--${colorMode.value === 'dark' ? 'dark' : 'light'}`);
</script>

<template>
    <ColorScheme>
        <div
            class="app-root"
            :class="vuetifyThemeClass"
            :data-theme="colorMode.preference"
        >
            <AppToolbar />
            <AppNav />
            <main class="app-main">
                <NuxtPage />
            </main>
        </div>
    </ColorScheme>
</template>

<style scoped>
.app-root {
    min-height: 100dvh;
    background: rgb(var(--v-theme-background));
    color: rgb(var(--v-theme-on-background));
}

.app-main {
    padding-top: 64px;
    padding-left: 220px;
    min-height: 100dvh;
    box-sizing: border-box;
}

@media (max-width: 959px) {
    .app-main {
        padding-left: 0;
    }
}
</style>
