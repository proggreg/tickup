<script setup lang="ts">
import { Button } from '@vuetify/v0';

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

const { smAndDown } = useDisplay();

const showFab = computed(() => {
    return smAndDown.value && (route.name === 'lists' || route.name === 'list-id' || route.name === 'index');
});
</script>

<template>
    <ColorScheme>
        <div
            class="app-root"
            :data-theme="colorMode.preference"
        >
            <div class="app-content">
                <NuxtPage />
                <AppNavMobile />
            </div>
            <Button.Root
                v-if="showFab"
                class="fab"
                @click="addEventHandler"
            >
                <i class="mdi mdi-plus fab__icon" />
                <span class="fab__label">New</span>
            </Button.Root>
        </div>
    </ColorScheme>
</template>

<style scoped>
.app-root {
    min-height: 100dvh;
    background: rgb(var(--v-theme-background));
    color: rgb(var(--v-theme-on-background));
    position: relative;
}

.app-content {
    min-height: 100dvh;
    box-sizing: border-box;
}

.fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 24px;
    height: 48px;
    border: none;
    border-radius: 24px;
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    z-index: 10;
    transition: background 0.15s;
}

.fab:hover {
    background: rgba(var(--v-theme-primary), 0.9);
}

.fab__icon {
    font-size: 20px;
}

.fab__label {
    letter-spacing: 0;
    text-transform: none;
}
</style>
