<script setup lang="ts">
const settingsStore = useSettingsStore();
const { notify } = useNotification();
const form = ref({
    id: '',
    apiKey: '',
});
const isSaving = ref(false);

onMounted(() => {
    settingsStore.loadClaudeRoutineSettings();
    form.value.id = settingsStore.claudeRoutineId;
    form.value.apiKey = settingsStore.claudeRoutineApiKey;
});

async function saveSettings() {
    if (!form.value.id || !form.value.apiKey) {
        notify('Please fill in both Routine ID and API key');
        return;
    }

    isSaving.value = true;
    try {
        settingsStore.saveClaudeRoutineSettings(form.value.id, form.value.apiKey);
        notify('Claude routine settings saved');
    } catch (error: any) {
        notify(error?.message || 'Failed to save settings');
    } finally {
        isSaving.value = false;
    }
}

function clearSettings() {
    settingsStore.clearClaudeRoutineSettings();
    form.value.id = '';
    form.value.apiKey = '';
    notify('Settings cleared');
}
</script>

<template>
    <v-card class="pa-6 rounded-lg">
        <v-card-title class="mb-4">Claude Routine Integration</v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="form.id"
                        label="Claude Routine ID"
                        hint="e.g., trig_018HgzNV2aetSU4MzciLGUtn (starts with 'trig_')"
                        persistent-hint
                        data-testid="claude-routine-id"
                    />
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        v-model="form.apiKey"
                        label="Claude API Key"
                        hint="Your personal Claude API key (starts with 'sk-ant-')"
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
