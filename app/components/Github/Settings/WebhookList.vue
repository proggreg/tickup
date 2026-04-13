<script setup lang="ts">
import { Button } from '@vuetify/v0';
import type { WebhookItem } from '~/composables/useGithubSettings';

const props = defineProps<{
    webhooks: WebhookItem[];
    loading: boolean;
    error: string;
    deletingIds: number[];
}>();

const emit = defineEmits<{
    delete: [hookId: number, repoFullName: string];
}>();
</script>

<template>
    <div>
        <div
            v-if="props.loading"
            class="loading-state"
        >
            <span class="spinner" />
            <span>Loading webhooks...</span>
        </div>

        <div
            v-else-if="props.error"
            class="alert alert--error"
            role="alert"
        >
            {{ props.error }}
        </div>

        <div
            v-else-if="props.webhooks.length === 0"
            class="empty-state"
        >
            No webhooks found.
        </div>

        <ul
            v-else
            class="webhook-list"
        >
            <li
                v-for="hook in props.webhooks"
                :key="hook.id"
                class="webhook-item"
            >
                <div class="webhook-item__info">
                    <span class="webhook-item__name">{{ hook.repoFullName }}</span>
                    <span class="webhook-item__url">{{ hook.config.url }}</span>
                </div>
                <div class="webhook-item__actions">
                    <span
                        class="badge"
                        :class="hook.active ? 'badge--success' : 'badge--default'"
                    >
                        {{ hook.active ? 'Active' : 'Inactive' }}
                    </span>
                    <Button.Root
                        class="icon-btn icon-btn--danger"
                        :aria-label="`Delete webhook for ${hook.repoFullName}`"
                        :disabled="props.deletingIds.includes(hook.id)"
                        :data-testid="`github-webhook-delete-${hook.id}`"
                        @click="emit('delete', hook.id, hook.repoFullName)"
                    >
                        <Button.Icon>
                            <span
                                v-if="props.deletingIds.includes(hook.id)"
                                class="spinner spinner--sm"
                            />
                            <i
                                v-else
                                class="mdi mdi-delete"
                            />
                        </Button.Icon>
                    </Button.Root>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.loading-state {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.alert {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8125rem;
    margin-bottom: 8px;
}

.alert--error {
    background: rgba(var(--v-theme-error), 0.1);
    color: rgb(var(--v-theme-error));
}

.empty-state {
    padding: 8px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.webhook-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.webhook-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
    gap: 12px;
}

.webhook-item:last-child {
    border-bottom: none;
}

.webhook-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.webhook-item__name {
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.webhook-item__url {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.55);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.webhook-item__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 500;
}

.badge--success {
    background: rgba(var(--v-theme-success), 0.12);
    color: rgb(var(--v-theme-success));
}

.badge--default {
    background: rgba(var(--v-border-color), 0.12);
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn--danger .mdi {
    color: rgb(var(--v-theme-error));
    font-size: 16px;
}

.icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.spinner { width: 16px; height: 16px; }
.spinner--sm { width: 14px; height: 14px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
