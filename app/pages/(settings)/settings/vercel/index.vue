<script setup lang="ts">
const config = useRuntimeConfig();
const route = useRoute();

const connected = ref(false);
const loading = ref(true);
const disconnecting = ref(false);

const checkConnection = async () => {
    try {
        connected.value = !!(await $fetch('/api/vercel/check'));
    } catch {
        connected.value = false;
    } finally {
        loading.value = false;
    }
};

const handlePendingCode = async (code: string) => {
    try {
        await $fetch('/api/vercel/connect', { method: 'POST', body: { code } });
        connected.value = true;
    } catch {
        // ignore — user can retry
    }
};

onMounted(async () => {
    if (route.query.vercel === 'pending' && route.query.code) {
        await handlePendingCode(route.query.code as string);
    }
    await checkConnection();
});

const disconnect = async () => {
    disconnecting.value = true;
    try {
        await $fetch('/api/vercel/disconnect', { method: 'POST' });
        connected.value = false;
    } finally {
        disconnecting.value = false;
    }
};

const connectUrl = computed(() => {
    const clientId = config.public.vercelClientId;
    if (!clientId) return null;
    const redirectUri = `${window.location.origin}/api/vercel/callback`;
    return `https://vercel.com/integrations/${clientId}/new?redirect_url=${encodeURIComponent(redirectUri)}`;
});
</script>

<template>
    <v-row class="fill-height">
        <v-col cols="12">
            <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-arrow-left" variant="text" to="/settings" />
                <h2 class="ml-2">Vercel Integration</h2>
            </div>

            <v-card variant="flat" class="pa-4 mb-4">
                <v-card-text>
                    <div v-if="loading" class="d-flex align-center">
                        <v-progress-circular indeterminate size="20" class="mr-2" />
                        Loading...
                    </div>
                    <div v-else-if="connected" class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center ga-2">
                            <v-icon color="success">mdi-check-circle</v-icon>
                            <span>Vercel connected</span>
                        </div>
                        <v-btn
                            variant="tonal"
                            color="error"
                            size="small"
                            :loading="disconnecting"
                            @click="disconnect"
                        >
                            Disconnect
                        </v-btn>
                    </div>
                    <div v-else>
                        <p class="mb-3">
                            Connect your Vercel account to link deployments directly to your todos.
                        </p>
                        <v-btn
                            v-if="connectUrl"
                            color="primary"
                            prepend-icon="mdi-triangle"
                            :href="connectUrl"
                        >
                            Connect Vercel
                        </v-btn>
                        <v-alert v-else type="warning" variant="tonal" class="mt-2">
                            Vercel integration is not configured.
                        </v-alert>
                    </div>
                </v-card-text>
            </v-card>

            <v-alert
                v-if="route.query.vercel === 'connected'"
                type="success"
                variant="tonal"
                class="mb-4"
            >
                Vercel connected successfully.
            </v-alert>
            <v-alert
                v-if="route.query.vercel === 'error'"
                type="error"
                variant="tonal"
                class="mb-4"
            >
                Failed to connect Vercel. Please try again.
            </v-alert>
        </v-col>
    </v-row>
</template>
