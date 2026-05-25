<script setup lang="ts">
interface Props {
    activeSection: string;
}

defineProps<Props>();
const emit = defineEmits<{ navigate: [section: string] }>();

const navItems = [
    { id: 'workflow', icon: 'mdi-circle-slice-4', label: 'Workflow' },
    { id: 'integrations', icon: 'mdi-puzzle-outline', label: 'Integrations' },
    { id: 'account', icon: 'mdi-account-outline', label: 'Account' },
    { id: 'appearance', icon: 'mdi-palette-outline', label: 'Appearance' },
    { id: 'notifications', icon: 'mdi-bell-outline', label: 'Notifications' },
];
</script>

<template>
    <nav class="settings-nav">
        <div class="settings-nav__title">
            Settings
        </div>
        <button
            v-for="item in navItems"
            :key="item.id"
            class="settings-nav__item"
            :class="{ 'settings-nav__item--active': activeSection === item.id }"
            @click="emit('navigate', item.id)"
        >
            <v-icon
                :icon="item.icon"
                :size="16"
                :style="{ opacity: activeSection === item.id ? 1 : 0.7 }"
            />
            <span class="settings-nav__label">{{ item.label }}</span>
        </button>
    </nav>
</template>

<style scoped>
.settings-nav {
    width: 220px;
    flex-shrink: 0;
    background: white;
    border-right: 1px solid rgba(113, 124, 130, 0.16);
    padding: 28px 12px;
    display: flex;
    flex-direction: column;
    align-self: stretch;
}
.settings-nav__title {
    font-family: 'Manrope', sans-serif;
    font-size: 17px;
    font-weight: 800;
    color: #2a3439;
    letter-spacing: -0.01em;
    padding: 0 12px;
    margin-bottom: 16px;
}
.settings-nav__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 7px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #2a3439;
    text-align: left;
    transition: background 0.12s;
}
.settings-nav__item:hover {
    background: rgba(113, 124, 130, 0.07);
}
.settings-nav__item--active {
    background: var(--color-primary-container, #dce8ff);
    color: var(--color-on-primary-container, #004eaa);
    font-weight: 600;
}
.settings-nav__label {
    font-size: 13px;
}
</style>
