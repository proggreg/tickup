<script setup lang="ts">
const router = useRouter();

const githubConnected = ref(false);

const { enabled: pushEnabled, loading: pushLoading, checkStatus, enable, disable } = useNotificationSettings();

onMounted(async () => {
    try {
        const connected = await $fetch('/api/github/check');
        githubConnected.value = !!connected;
    }
    catch {
        githubConnected.value = false;
    }
    await checkStatus();
});

async function togglePush() {
    if (pushLoading.value) {
        return;
    }
    if (pushEnabled.value) {
        await disable();
    }
    else {
        await enable();
    }
}
</script>

<template>
    <v-card class="settings-card">
        <SettingsIntegrationRow
            icon="mdi-github"
            name="GitHub"
            description="Create branches and link pull requests directly from your todos"
            :connected="githubConnected"
            @click="router.push('/settings/github')"
        />
        <SettingsIntegrationRow
            icon="mdi-bell-outline"
            name="Push Notifications"
            description="Get reminders for your todos even when Tickup isn't open"
            short-description="Get reminders for your todos"
            :connected="pushEnabled"
            @click="togglePush"
        />
    </v-card>
</template>

<style scoped>
.settings-card {
    background: #ffffff;
    border-radius: 10px;
    box-shadow:
        0 1px 2px rgba(42, 52, 57, 0.04),
        0 0 0 1px rgba(113, 124, 130, 0.1);
    padding: 4px;
    overflow: hidden;
}
</style>
