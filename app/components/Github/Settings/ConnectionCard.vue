<script setup lang="ts">
import { Button } from '@vuetify/v0';

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
    <div class="connection-card">
        <div class="connection-card__body">
            <div
                v-if="props.loading"
                class="connection-status"
            >
                <span class="spinner" />
                <span>Loading...</span>
            </div>

            <div
                v-else-if="props.connected"
                class="connection-status connection-status--connected"
            >
                <div class="connection-status__info">
                    <i
                        class="mdi mdi-check-circle"
                        style="color: rgb(var(--v-theme-success)); font-size: 20px;"
                    />
                    <span>GitHub connected</span>
                </div>
                <Button.Root
                    class="btn btn--danger-tonal"
                    @click="emit('disconnect')"
                >
                    <Button.Content>Disconnect</Button.Content>
                </Button.Root>
            </div>

            <div v-else>
                <p class="connection-desc">
                    Connect your GitHub account to create branches directly from todos.
                </p>
                <a
                    v-if="props.githubAppName"
                    class="btn btn--primary"
                    :href="`https://github.com/apps/${props.githubAppName}/installations/new`"
                >
                    <i class="mdi mdi-github" />
                    <span>Connect GitHub</span>
                </a>
                <div
                    v-else
                    class="alert alert--warning"
                    role="alert"
                >
                    <i class="mdi mdi-alert-outline" />
                    GitHub App is not configured.
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.connection-card {
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
}

.connection-card__body {
    padding: 16px;
}

.connection-status {
    display: flex;
    align-items: center;
    gap: 8px;
}

.connection-status--connected {
    justify-content: space-between;
}

.connection-status__info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.connection-desc {
    margin: 0 0 12px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
}

.btn--primary {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary, 255, 255, 255));
}

.btn--primary:hover {
    opacity: 0.9;
}

.btn--danger-tonal {
    background: rgba(var(--v-theme-error), 0.12);
    color: rgb(var(--v-theme-error));
}

.btn--danger-tonal:hover {
    background: rgba(var(--v-theme-error), 0.2);
}

.alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-top: 8px;
}

.alert--warning {
    background: rgba(var(--v-theme-warning), 0.12);
    color: rgb(var(--v-theme-warning));
}

.spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
