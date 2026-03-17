<script setup lang="ts">
definePageMeta({
    layout: 'settings',
});

type RepoItem = {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    language: string | null;
    default_branch: string;
    updated_at: string;
};

const config = useRuntimeConfig();
const route = useRoute();

const githubConnected = ref(false);
const githubLoading = ref(true);
const githubAppName = config.public.githubAppName;

const repos = ref<RepoItem[]>([]);
const reposLoading = ref(false);
const reposError = ref('');

const subscriptionMenuOpen = ref(false);
const subscriptionsLoading = ref(false);
const subscriptionsSaving = ref(false);
const subscriptionsError = ref('');
const subscriptionsSaved = ref(false);
const subscribedRepos = ref<string[]>([]);
const directSaveLoadingRepos = ref<string[]>([]);

async function checkGithubStatus() {
    githubLoading.value = true;
    try {
        const connected = await $fetch('/api/github/check');
        githubConnected.value = !!connected;
    }
    catch {
        githubConnected.value = false;
    }
    githubLoading.value = false;
}

async function loadRepos() {
    reposLoading.value = true;
    reposError.value = '';
    try {
        const data = await $fetch<{ repositories: RepoItem[] }>('/api/github/repos');
        repos.value = data.repositories;
    }
    catch (e: any) {
        reposError.value = e?.data?.message || 'Failed to load repositories';
    }
    reposLoading.value = false;
}

async function loadWebhookSubscriptions() {
    subscriptionsLoading.value = true;
    subscriptionsError.value = '';

    try {
        const data = await $fetch<{ subscriptions: string[] }>('/api/github/webhook/subscriptions');
        subscribedRepos.value = data.subscriptions || [];
    }
    catch (e: any) {
        subscriptionsError.value = e?.data?.message || 'Failed to load webhook subscriptions';
    }

    subscriptionsLoading.value = false;
}

function isRepoSubscribed(fullName: string) {
    return subscribedRepos.value.includes(fullName);
}

function toggleRepoSubscription(fullName: string, subscribed: boolean) {
    if (subscribed) {
        if (!subscribedRepos.value.includes(fullName)) {
            subscribedRepos.value = [...subscribedRepos.value, fullName];
        }
        return;
    }

    subscribedRepos.value = subscribedRepos.value.filter(repo => repo !== fullName);
}

function isDirectSaveLoading(fullName: string) {
    return directSaveLoadingRepos.value.includes(fullName);
}

async function persistWebhookSubscriptions() {
    await $fetch('/api/github/webhook/subscribe', {
        method: 'POST',
        body: {
            subscriptions: subscribedRepos.value,
        },
    });
}

async function saveWebhookSubscriptions() {
    subscriptionsSaving.value = true;
    subscriptionsError.value = '';
    subscriptionsSaved.value = false;

    try {
        await persistWebhookSubscriptions();
        subscriptionsSaved.value = true;
    }
    catch (e: any) {
        subscriptionsError.value = e?.data?.message || 'Failed to save webhook subscriptions';
    }

    subscriptionsSaving.value = false;
}

async function toggleRepoSubscriptionDirect(fullName: string) {
    if (isDirectSaveLoading(fullName)) {
        return;
    }

    subscriptionsError.value = '';
    const previousSubscriptions = [...subscribedRepos.value];
    const nextSubscribedState = !isRepoSubscribed(fullName);
    toggleRepoSubscription(fullName, nextSubscribedState);
    directSaveLoadingRepos.value = [...directSaveLoadingRepos.value, fullName];

    try {
        await persistWebhookSubscriptions();
    }
    catch (e: any) {
        subscribedRepos.value = previousSubscriptions;
        subscriptionsError.value = e?.data?.message || 'Failed to save webhook subscriptions';
    }
    finally {
        directSaveLoadingRepos.value = directSaveLoadingRepos.value.filter(repo => repo !== fullName);
    }
}

async function disconnectGithub() {
    githubLoading.value = true;
    try {
        await $fetch('/api/github/disconnect', { method: 'POST' });
        githubConnected.value = false;
        repos.value = [];
        subscribedRepos.value = [];
    }
    catch (e) {
        console.error('Failed to disconnect GitHub:', e);
    }
    githubLoading.value = false;
}

function languageColor(language: string | null): string {
    const colors: Record<string, string> = {
        TypeScript: '#3178c6',
        JavaScript: '#f1e05a',
        Vue: '#41b883',
        Python: '#3572A5',
        Go: '#00ADD8',
        Rust: '#dea584',
        Java: '#b07219',
        Ruby: '#701516',
        CSS: '#563d7c',
        HTML: '#e34c26',
    };
    return language ? colors[language] || '#8b949e' : '#8b949e';
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

function toRepoTestId(fullName: string): string {
    return fullName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

async function initializeGithubData() {
    if (!githubConnected.value) {
        return;
    }

    await loadRepos();
    await loadWebhookSubscriptions();
}

onMounted(async () => {
    // Handle pending GitHub connection
    if (route.query.github === 'pending' && route.query.installation_id) {
        githubLoading.value = true;
        try {
            await $fetch('/api/github/connect', {
                method: 'POST',
                body: {
                    installation_id: route.query.installation_id,
                    code: route.query.code || undefined,
                },
            });
            githubConnected.value = true;
        }
        catch (e) {
            console.error('Failed to complete GitHub connection:', e);
        }
        githubLoading.value = false;
    }
    else {
        await checkGithubStatus();
        if (route.query.github === 'connected') {
            githubConnected.value = true;
        }
    }

    await initializeGithubData();
});
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

            <!-- Connection Status Card -->
            <v-card
                variant="flat"
                class="pa-4 mb-4"
            >
                <v-card-text>
                    <div
                        v-if="githubLoading"
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
                        v-else-if="githubConnected"
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
                            @click="disconnectGithub"
                        >
                            Disconnect
                        </v-btn>
                    </div>
                    <div v-else>
                        <p class="mb-3">
                            Connect your GitHub account to create branches directly from todos.
                        </p>
                        <v-btn
                            v-if="githubAppName"
                            color="primary"
                            prepend-icon="mdi-github"
                            :href="`https://github.com/apps/${githubAppName}/installations/new`"
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

            <!-- Repositories Card -->
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

                    <v-menu
                        v-model="subscriptionMenuOpen"
                        :close-on-content-click="false"
                        location="bottom end"
                    >
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                icon="mdi-github"
                                variant="tonal"
                                color="primary"
                                data-testid="github-webhook-settings-menu-button"
                            />
                        </template>

                        <v-card
                            min-width="320"
                            max-width="420"
                        >
                            <v-card-title class="text-subtitle-1">
                                Webhook subscriptions
                            </v-card-title>
                            <v-card-subtitle>
                                Choose which repos trigger todo status updates.
                            </v-card-subtitle>
                            <v-card-text>
                                <div
                                    v-if="subscriptionsLoading"
                                    class="d-flex align-center ga-2"
                                >
                                    <v-progress-circular
                                        indeterminate
                                        size="18"
                                    />
                                    Loading subscriptions...
                                </div>

                                <v-alert
                                    v-else-if="subscriptionsError"
                                    type="error"
                                    variant="tonal"
                                    density="compact"
                                    class="mb-3"
                                    data-testid="github-webhook-subscriptions-error"
                                >
                                    {{ subscriptionsError }}
                                </v-alert>

                                <v-list
                                    v-else
                                    density="compact"
                                >
                                    <v-list-item
                                        v-for="repo in repos"
                                        :key="repo.id"
                                        class="px-0"
                                    >
                                        <div class="d-flex align-center justify-space-between ga-3 w-100">
                                            <span class="text-body-2">
                                                {{ repo.full_name }}
                                            </span>
                                            <v-switch
                                                :model-value="isRepoSubscribed(repo.full_name)"
                                                color="primary"
                                                density="compact"
                                                hide-details
                                                :disabled="subscriptionsSaving"
                                                :data-testid="`github-webhook-switch-${toRepoTestId(repo.full_name)}`"
                                                :data-subscribed="isRepoSubscribed(repo.full_name) ? 'true' : 'false'"
                                                @update:model-value="value => toggleRepoSubscription(repo.full_name, !!value)"
                                            />
                                        </div>
                                    </v-list-item>
                                </v-list>

                                <v-alert
                                    v-if="subscriptionsSaved"
                                    type="success"
                                    variant="tonal"
                                    density="compact"
                                    class="mt-3"
                                    data-testid="github-webhook-subscriptions-saved"
                                >
                                    Webhook subscriptions saved.
                                </v-alert>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer />
                                <v-btn
                                    variant="text"
                                    @click="subscriptionMenuOpen = false"
                                >
                                    Close
                                </v-btn>
                                <v-btn
                                    color="primary"
                                    :loading="subscriptionsSaving"
                                    data-testid="github-webhook-save-button"
                                    @click="saveWebhookSubscriptions"
                                >
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                </v-card-title>
                <v-card-text>
                    <div
                        v-if="reposLoading"
                        class="d-flex align-center justify-center pa-8"
                    >
                        <v-progress-circular
                            indeterminate
                            size="32"
                            class="mr-3"
                        />
                        Loading repositories...
                    </div>

                    <v-alert
                        v-else-if="reposError"
                        type="error"
                        variant="tonal"
                        class="mb-3"
                    >
                        {{ reposError }}
                        <template #append>
                            <v-btn
                                variant="text"
                                size="small"
                                @click="loadRepos"
                            >
                                Retry
                            </v-btn>
                        </template>
                    </v-alert>

                    <v-alert
                        v-if="!reposLoading && !reposError && subscriptionsError"
                        type="error"
                        variant="tonal"
                        density="compact"
                        class="mb-3"
                        data-testid="github-webhook-inline-error"
                    >
                        {{ subscriptionsError }}
                    </v-alert>

                    <div
                        v-if="!reposLoading && !reposError && repos.length === 0"
                        class="text-center pa-8 text-medium-emphasis"
                    >
                        No repositories found. Make sure the GitHub App has access to your repositories.
                    </div>

                    <v-list
                        v-if="!reposLoading && !reposError && repos.length > 0"
                        variant="tonal"
                    >
                        <v-list-item
                            v-for="repo in repos"
                            :key="repo.id"

                            target="_blank"
                            class="my-1"
                        >
                            <template #prepend>
                                <v-icon>
                                    {{ repo.private ? 'mdi-lock' : 'mdi-source-repository' }}
                                </v-icon>
                            </template>
                            <v-list-item-title class="font-weight-medium">
                                {{ repo.name }}
                            </v-list-item-title>
                            <v-list-item-subtitle v-if="repo.description">
                                {{ repo.description }}
                            </v-list-item-subtitle>
                            <template #append>
                                <div class="d-flex align-center ga-3 text-caption text-medium-emphasis">
                                    <v-btn
                                        size="x-small"
                                        variant="tonal"
                                        :color="isRepoSubscribed(repo.full_name) ? 'warning' : 'primary'"
                                        :loading="isDirectSaveLoading(repo.full_name)"
                                        :data-testid="`github-webhook-toggle-button-${toRepoTestId(repo.full_name)}`"
                                        @click.stop.prevent="toggleRepoSubscriptionDirect(repo.full_name)"
                                    >
                                        {{ isRepoSubscribed(repo.full_name) ? 'Unsubscribe' : 'Subscribe' }}
                                    </v-btn>
                                    <v-chip
                                        size="x-small"
                                        :color="isRepoSubscribed(repo.full_name) ? 'success' : undefined"
                                        variant="tonal"
                                        data-testid="github-webhook-status-chip"
                                    >
                                        {{ isRepoSubscribed(repo.full_name) ? 'Subscribed' : 'Unsubscribed' }}
                                    </v-chip>
                                    <span
                                        v-if="repo.language"
                                        class="d-flex align-center ga-1"
                                    >
                                        <v-icon
                                            size="8"
                                            :color="languageColor(repo.language)"
                                        >
                                            mdi-circle
                                        </v-icon>
                                        {{ repo.language }}
                                    </span>
                                    <span v-if="repo.updated_at">
                                        {{ timeAgo(repo.updated_at) }}
                                    </span>
                                </div>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
