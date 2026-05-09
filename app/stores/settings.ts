import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', () => {
    const darkMode = ref(false);
    const userStatuses = ref<Status[]>([]);
    const claudeRoutineUrl = ref('');
    const claudeRoutineApiKey = ref('');
    const defaultStatuses: Status[] = [
        {
            name: 'Open',
            color: '#87909e',
        },
        {
            name: 'In Progress',
            color: '#ee5e99',
        },
        {
            name: 'Closed',
            color: '#008844',
        },
    ];

    const statuses = computed((): Status[] => {
        if (userStatuses.value.length) {
            return userStatuses.value;
        }
        return defaultStatuses;
    });

    async function getUserSettings() {
        // TODO get the users settings
        // const session = await getSession()
        // const userId = session?.user?.sub
        // const settings = await $fetch<Settings>('/api/settings', { query: { userId } })
        // if (settings.statuses.length) {
        //   userStatuses.value = settings.statuses
        // }
    }

    function saveClaudeRoutineSettings(url: string, apiKey: string) {
        claudeRoutineUrl.value = url;
        claudeRoutineApiKey.value = apiKey;
        localStorage.setItem('claude_routine_url', url);
        localStorage.setItem('claude_routine_api_key', apiKey);
    }

    function loadClaudeRoutineSettings() {
        const url = localStorage.getItem('claude_routine_url') || '';
        const apiKey = localStorage.getItem('claude_routine_api_key') || '';
        claudeRoutineUrl.value = url;
        claudeRoutineApiKey.value = apiKey;
    }

    function clearClaudeRoutineSettings() {
        claudeRoutineUrl.value = '';
        claudeRoutineApiKey.value = '';
        localStorage.removeItem('claude_routine_url');
        localStorage.removeItem('claude_routine_api_key');
    }

    return {
        darkMode,
        statuses,
        getUserSettings,
        userStatuses,
        claudeRoutineUrl,
        claudeRoutineApiKey,
        saveClaudeRoutineSettings,
        loadClaudeRoutineSettings,
        clearClaudeRoutineSettings,
    };
});
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
