<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
    <ColorScheme>
        <div
            class="app-root"
            :data-theme="colorMode.preference"
        >
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
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}
</style>
