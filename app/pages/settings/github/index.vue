<script setup lang="ts">
import { Button } from '@vuetify/v0';

definePageMeta({
    layout: 'settings',
});

const config = useRuntimeConfig();
const githubAppName = config.public.githubAppName;

const {
    githubConnected,
    githubLoading,
    repos,
    reposLoading,
    reposError,
    deletingWebhookIds,
    webhooksError,
    subscribedRepos,
    subscriptionMenuOpen,
    subscriptionsLoading,
    subscriptionsSaving,
    subscriptionsError,
    subscriptionsSaved,
    isRepoSubscribed,
    isDirectSaveLoading,
    loadRepos,
    toggleRepoSubscription,
    saveWebhookSubscriptions,
    toggleRepoSubscriptionDirect,
    deleteWebhook,
    disconnectGithub,
} = useGithubSettings();
</script>

<template>
    <div class="github-settings-page">
        <div class="page-header">
            <Button.Root
                class="back-btn"
                to="/settings"
            >
                <Button.Icon>
                    <i class="mdi mdi-arrow-left" />
                </Button.Icon>
            </Button.Root>
            <h2 class="page-title">GitHub Integration</h2>
        </div>

        <GithubSettingsConnectionCard
            :loading="githubLoading"
            :connected="githubConnected"
            :github-app-name="githubAppName"
            @disconnect="disconnectGithub"
        />

        <template v-if="githubConnected">
            <div class="settings-section">
                <h3 class="settings-section__title">Webhooks</h3>
                <GithubSettingsWebhookList
                    :webhooks="subscribedRepos"
                    :loading="subscriptionsLoading"
                    :error="webhooksError"
                    :deleting-ids="deletingWebhookIds"
                    @delete="deleteWebhook"
                />
            </div>

            <div class="settings-section">
                <div class="settings-section__header">
                    <div class="settings-section__title-row">
                        <h3 class="settings-section__title">Repositories</h3>
                        <span
                            v-if="repos.length"
                            class="repos-badge"
                        >{{ repos.length }}</span>
                    </div>

                    <GithubSettingsWebhookMenu
                        v-model:menu-open="subscriptionMenuOpen"
                        :repos="repos"
                        :subscriptions-loading="subscriptionsLoading"
                        :subscriptions-saving="subscriptionsSaving"
                        :subscriptions-error="subscriptionsError"
                        :subscriptions-saved="subscriptionsSaved"
                        :is-repo-subscribed="isRepoSubscribed"
                        @toggle="toggleRepoSubscription"
                        @save="saveWebhookSubscriptions"
                    />
                </div>

                <GithubSettingsRepoList
                    :repos="repos"
                    :repos-loading="reposLoading"
                    :repos-error="reposError"
                    :subscriptions-error="subscriptionsError"
                    :is-repo-subscribed="isRepoSubscribed"
                    :is-direct-save-loading="isDirectSaveLoading"
                    @retry-load="loadRepos"
                    @toggle-direct="toggleRepoSubscriptionDirect"
                />
            </div>
        </template>
    </div>
</template>

<style scoped>
.github-settings-page {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    transition: background 0.1s;
    text-decoration: none;
}

.back-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.back-btn .mdi {
    font-size: 22px;
}

.page-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

.settings-section {
    padding: 16px;
    background: rgb(var(--v-theme-surface));
    border-radius: 8px;
}

.settings-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.settings-section__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.settings-section__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 12px;
}

.settings-section__header .settings-section__title {
    margin-bottom: 0;
}

.repos-badge {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    background: rgba(var(--v-border-color), 0.1);
    color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
