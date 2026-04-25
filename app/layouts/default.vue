<script setup lang="ts">
import { useTheme } from 'vuetify';

const colorMode = useColorMode();
const theme = useTheme();

const vuetifyThemeClass = computed(() => `v-theme--${theme.global.name.value}`);

// Keep <html> in sync so all elements (including fixed/teleported) inherit CSS vars
if (import.meta.client) {
    watch(vuetifyThemeClass, (cls) => {
        document.documentElement.classList.remove('v-theme--light', 'v-theme--dark');
        document.documentElement.classList.add(cls);
    }, { immediate: true });
}
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
