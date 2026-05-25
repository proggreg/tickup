<script setup lang="ts">
const props = defineProps<{
    loading: boolean;
    connected: boolean;
    githubAppName: string;
}>();

const emit = defineEmits<{
    disconnect: [];
}>();
</script>

<template>
    <v-card
        variant="flat"
        class="pa-4 mb-4"
    >
        <v-card-text>
            <div
                v-if="props.loading"
                class="d-flex align-center"
            >
                <v-progress-circular
                    indeterminate
                    size="20"
                    class="mr-2"
                />
                Loading...
            </div>
            <div
                v-else-if="props.connected"
                class="d-flex align-center justify-space-between"
            >
                <div class="d-flex align-center ga-2">
                    <v-icon color="success">
                        mdi-check-circle
                    </v-icon>
                    <span>GitHub connected</span>
                </div>
                <v-btn
                    variant="tonal"
                    color="error"
                    size="small"
                    @click="emit('disconnect')"
                >
                    Disconnect
                </v-btn>
            </div>
            <div v-else>
                <p class="mb-3">
                    Connect your GitHub account to create branches directly from todos.
                </p>
                <v-btn
                    v-if="props.githubAppName"
                    color="primary"
                    prepend-icon="mdi-github"
                    :href="`https://github.com/apps/${props.githubAppName}/installations/new`"
                >
                    Connect GitHub
                </v-btn>
                <v-alert
                    v-else
                    type="warning"
                    variant="tonal"
                    class="mt-2"
                >
                    GitHub App is not configured.
                </v-alert>
            </div>
        </v-card-text>
    </v-card>
</template>
