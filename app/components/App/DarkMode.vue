<script setup lang="ts">
import { Button } from '@vuetify/v0';

const colorMode = useColorMode();
function toggleDarkMode() {
    colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light';
}
</script>

<template>
    <Button.Root
        class="icon-btn"
        :aria-label="colorMode.preference === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        data-testid="dark-mode-toggle"
        @click="toggleDarkMode"
    >
        <Button.Icon>
            <i :class="colorMode.preference === 'light' ? 'mdi mdi-weather-night' : 'mdi mdi-weather-sunny'" />
        </Button.Icon>
    </Button.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 20px;
}
</style>
