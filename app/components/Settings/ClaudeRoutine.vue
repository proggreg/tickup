<script setup lang="ts">
const settingsStore = useSettingsStore();
const notif = useNotification();
const form = ref({
    url: '',
    apiKey: '',
});
const isSaving = ref(false);

onMounted(() => {
    settingsStore.loadClaudeRoutineSettings();
    form.value.url = settingsStore.claudeRoutineUrl;
    form.value.apiKey = settingsStore.claudeRoutineApiKey;
});

async function saveSettings() {
    if (!form.value.url || !form.value.apiKey) {
        notif('Please fill in both URL and API key');
        return;
    }

    isSaving.value = true;
    try {
        settingsStore.saveClaudeRoutineSettings(form.value.url, form.value.apiKey);
        notif('Claude routine settings saved');
    } catch (error: any) {
        notif(error?.message || 'Failed to save settings');
    } finally {
        isSaving.value = false;
    }
}

function clearSettings() {
    settingsStore.clearClaudeRoutineSettings();
    form.value.url = '';
    form.value.apiKey = '';
    notif('Settings cleared');
}
</script>

<template>
    <v-card class="pa-6 rounded-lg">
        <v-card-title class="mb-4">Claude Routine Integration</v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="form.url"
                        label="Claude Routine Trigger URL"
                        hint="e.g., https://claude.ai/api/v1/code/triggers/[trigger-id]/run"
                        persistent-hint
                        type="url"
                        data-testid="claude-routine-url"
                    />
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        v-model="form.apiKey"
                        label="Claude API Key"
                        hint="Your personal Claude API key for authentication"
                        persistent-hint
                        type="password"
                        data-testid="claude-routine-api-key"
                    />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions class="d-flex gap-2">
            <v-btn
                variant="flat"
                color="primary"
                @click="saveSettings"
                :loading="isSaving"
                data-testid="save-claude-settings"
            >
                Save Settings
            </v-btn>
            <v-btn variant="outlined" @click="clearSettings" data-testid="clear-claude-settings">
                Clear
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
