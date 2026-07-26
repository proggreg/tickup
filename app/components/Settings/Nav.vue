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
];
</script>

<template>
    <v-list class="fill-height">
        <v-list-item
            v-for="item in navItems"
            :key="item.id"
            class="settings-nav__item"
            :to="`/settings/${item.id}`"
            :class="{ 'settings-nav__item--active': activeSection === item.id }"
            @click="emit('navigate', item.id)"
        >
            <v-icon
                :icon="item.icon"
                :size="16"
                :style="{ opacity: activeSection === item.id ? 1 : 0.7 }"
            />
            <span
                class="settings-nav__label"
                style="margin-left: 8px"
            >{{ item.label }}</span>
        </v-list-item>
    </v-list>
</template>
