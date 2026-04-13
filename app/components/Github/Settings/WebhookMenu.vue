<script setup lang="ts">
import { Button, Popover, Switch } from '@vuetify/v0';
import type { RepoItem } from '~/composables/useGithubSettings';

const props = defineProps<{
    repos: RepoItem[];
    subscriptionsLoading: boolean;
    subscriptionsSaving: boolean;
    subscriptionsError: string;
    subscriptionsSaved: boolean;
    isRepoSubscribed: (fullName: string) => boolean;
}>();

const emit = defineEmits<{
    toggle: [fullName: string, subscribed: boolean];
    save: [];
}>();

const menuOpen = defineModel<boolean>('menuOpen', { default: false });

function toRepoTestId(fullName: string): string {
    return fullName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}
</script>

<template>
    <Popover.Root v-model="menuOpen">
        <Popover.Activator>
            <Button.Root
                class="icon-btn icon-btn--primary-tonal"
                aria-label="Webhook settings"
                data-testid="github-webhook-settings-menu-button"
            >
                <Button.Icon>
                    <i class="mdi mdi-github" />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>

        <Popover.Content class="webhook-menu">
            <div class="webhook-menu__header">
                <h3 class="webhook-menu__title">
                    Webhook subscriptions
                </h3>
                <p class="webhook-menu__subtitle">
                    Choose which repos trigger todo status updates.
                </p>
            </div>

            <div class="webhook-menu__body">
                <div
                    v-if="props.subscriptionsLoading"
                    class="webhook-loading"
                >
                    <span class="spinner" />
                    <span>Loading subscriptions...</span>
                </div>

                <div
                    v-else-if="props.subscriptionsError"
                    class="alert alert--error"
                    role="alert"
                    data-testid="github-webhook-subscriptions-error"
                >
                    <i class="mdi mdi-alert-circle" />
                    {{ props.subscriptionsError }}
                </div>

                <ul
                    v-else
                    class="repo-list"
                >
                    <li
                        v-for="repo in props.repos"
                        :key="repo.id"
                        class="repo-item"
                    >
                        <span class="repo-item__name">{{ repo.full_name }}</span>
                        <label class="switch-label">
                            <Switch.Root
                                :model-value="props.isRepoSubscribed(repo.full_name)"
                                :disabled="props.subscriptionsSaving"
                                class="switch-root"
                                :aria-label="repo.full_name"
                                :data-testid="`github-webhook-switch-${toRepoTestId(repo.full_name)}`"
                                :data-subscribed="props.isRepoSubscribed(repo.full_name) ? 'true' : 'false'"
                                @update:model-value="value => emit('toggle', repo.full_name, !!value)"
                            >
                                <Switch.Track class="switch-track">
                                    <Switch.Thumb class="switch-thumb" />
                                </Switch.Track>
                            </Switch.Root>
                        </label>
                    </li>
                </ul>

                <div
                    v-if="props.subscriptionsSaved"
                    class="alert alert--success"
                    role="status"
                    data-testid="github-webhook-subscriptions-saved"
                >
                    <i class="mdi mdi-check-circle" />
                    Webhook subscriptions saved.
                </div>
            </div>

            <div class="webhook-menu__actions">
                <Button.Root
                    class="btn"
                    @click="menuOpen = false"
                >
                    <Button.Content>Close</Button.Content>
                </Button.Root>
                <Button.Root
                    class="btn btn--primary"
                    :disabled="props.subscriptionsSaving"
                    data-testid="github-webhook-save-button"
                    @click="emit('save')"
                >
                    <span
                        v-if="props.subscriptionsSaving"
                        class="spinner spinner--sm"
                    />
                    <Button.Content>Save</Button.Content>
                </Button.Root>
            </div>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn--primary-tonal {
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}

.icon-btn--primary-tonal:hover {
    background: rgba(var(--v-theme-primary), 0.2);
}

.icon-btn .mdi {
    font-size: 20px;
}

.webhook-menu {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    min-width: 320px;
    max-width: 420px;
    z-index: 100;
}

.webhook-menu__header {
    padding: 16px 16px 8px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.webhook-menu__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 4px;
    color: rgb(var(--v-theme-on-surface));
}

.webhook-menu__subtitle {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 0;
}

.webhook-menu__body {
    padding: 12px 16px;
    max-height: 300px;
    overflow-y: auto;
}

.webhook-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8125rem;
}

.alert--error {
    background: rgba(var(--v-theme-error), 0.1);
    color: rgb(var(--v-theme-error));
    margin-bottom: 8px;
}

.alert--success {
    background: rgba(var(--v-theme-success), 0.1);
    color: rgb(var(--v-theme-success));
    margin-top: 8px;
}

.repo-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.repo-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    gap: 12px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.repo-item:last-child {
    border-bottom: none;
}

.repo-item__name {
    font-size: 0.8125rem;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.switch-label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    flex-shrink: 0;
}

.switch-root {
    display: inline-flex;
    align-items: center;
}

.switch-track {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 18px;
    background: rgba(var(--v-border-color), 0.3);
    border-radius: 9px;
    transition: background 0.2s;
    cursor: pointer;
    border: none;
}

.switch-root[aria-checked="true"] .switch-track {
    background: rgb(var(--v-theme-primary));
}

.switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    visibility: visible !important;
}

.switch-root[aria-checked="true"] .switch-thumb {
    transform: translateX(14px);
}

.webhook-menu__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
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
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.btn--primary {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary, 255, 255, 255));
}

.btn--primary:hover {
    opacity: 0.9;
}

.btn--primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

.spinner--sm {
    width: 14px;
    height: 14px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
