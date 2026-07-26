<script setup lang="ts">
const router = useRouter();

const githubConnected = ref(false);

onMounted(async () => {
    try {
        const connected = await $fetch('/api/github/check');
        githubConnected.value = !!connected;
    } catch {
        githubConnected.value = false;
    }
});
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
