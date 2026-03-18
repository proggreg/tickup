<script setup lang="ts">
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
    <v-row class="fill-height">
        <v-col cols="12">
            <div class="d-flex align-center mb-4">
                <v-btn
                    icon="mdi-arrow-left"
                    variant="text"
                    to="/settings"
                />
                <h2 class="ml-2">
                    GitHub Integration
                </h2>
            </div>

            <GithubSettingsConnectionCard
                :loading="githubLoading"
                :connected="githubConnected"
                :github-app-name="githubAppName"
                @disconnect="disconnectGithub"
            />

            <v-card
                v-if="githubConnected"
                variant="flat"
                class="pa-4 mb-4"
            >
                <v-card-title>Webhooks</v-card-title>
                <v-card-text>
                    <GithubSettingsWebhookList
                        :webhooks="subscribedRepos"
                        :loading="subscriptionsLoading"
                        :error="webhooksError"
                        :deleting-ids="deletingWebhookIds"
                        @delete="deleteWebhook"
                    />
                </v-card-text>
            </v-card>

            <v-card
                v-if="githubConnected"
                variant="flat"
                class="pa-4"
            >
                <v-card-title class="d-flex align-center justify-space-between ga-2">
                    <div class="d-flex align-center ga-2">
                        <span>Repositories</span>
                        <v-chip
                            v-if="repos.length"
                            size="small"
                            variant="tonal"
                        >
                            {{ repos.length }}
                        </v-chip>
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
                </v-card-title>
                <v-card-text>
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
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
