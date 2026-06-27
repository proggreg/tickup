import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', () => {
    const darkMode = ref(false);
    const userStatuses = ref<Status[]>([]);
    const defaultStatuses: Status[] = [
        {
            name: 'Open',
            color: '#005ac2',
        },
        {
            name: 'In Progress',
            color: '#e07b1f',
        },
        {
            name: 'Closed',
            color: '#2f8a5c',
        },
    ];

    const statuses = computed((): Status[] => {
        if (userStatuses.value.length) {
            return userStatuses.value;
        }
        return defaultStatuses;
    });

    async function getUserSettings() {
        const settings = await $fetch<{ statuses: Status[] }>('/api/settings');
        userStatuses.value = settings.statuses?.length ? settings.statuses : [...defaultStatuses];
    }

    return { darkMode, statuses, getUserSettings, userStatuses };
});
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
