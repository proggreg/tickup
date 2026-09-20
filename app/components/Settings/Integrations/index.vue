<script setup lang="ts">
const router = useRouter();

const githubConnected = ref(false);
const vercelConnected = ref(false);

onMounted(async () => {
    const [github, vercel] = await Promise.allSettled([
        $fetch('/api/github/check'),
        $fetch('/api/vercel/check'),
    ]);
    githubConnected.value = github.status === 'fulfilled' && !!github.value;
    vercelConnected.value = vercel.status === 'fulfilled' && !!vercel.value;
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
        <v-divider />
        <SettingsIntegrationRow
            icon="mdi-triangle"
            name="Vercel"
            description="Link deployments to todos and auto-update status on new deploys"
            :connected="vercelConnected"
            @click="router.push('/settings/vercel')"
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
