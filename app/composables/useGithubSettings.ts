export type WebhookItem = {
    id: number;
    active: boolean;
    events: string[];
    config: { url?: string; content_type?: string };
    repoFullName: string;
    created_at: string;
    updated_at: string;
};

export type RepoItem = {
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

export function useGithubSettings() {
    const route = useRoute();

    const githubConnected = ref(false);
    const githubLoading = ref(true);

    const repos = ref<RepoItem[]>([]);
    const reposLoading = ref(false);
    const reposError = ref('');

    const webhooks = ref<WebhookItem[]>([]);
    const deletingWebhookIds = ref<number[]>([]);
    const webhooksError = ref('');

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
        webhooksError.value = '';
        try {
            const data = await $fetch<{ subscriptions: string[]; webhooks: WebhookItem[] }>('/api/github/webhook/subscriptions');
            subscribedRepos.value = data.subscriptions || [];
            webhooks.value = data.webhooks || [];
        }
        catch (e: any) {
            subscriptionsError.value = e?.data?.message || 'Failed to load webhook subscriptions';
        }
        subscriptionsLoading.value = false;
    }

    async function deleteWebhook(hookId: number, repoFullName: string) {
        deletingWebhookIds.value = [...deletingWebhookIds.value, hookId];
        webhooksError.value = '';
        const [owner, repo] = repoFullName.split('/');
        try {
            await $fetch(`/api/github/webhook/${hookId}`, {
                method: 'DELETE',
                query: { owner, repo },
            });
            webhooks.value = webhooks.value.filter(h => h.id !== hookId);
        }
        catch (e: any) {
            webhooksError.value = e?.data?.message || 'Failed to delete webhook';
        }
        finally {
            deletingWebhookIds.value = deletingWebhookIds.value.filter(id => id !== hookId);
        }
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
            webhooks.value = [];
        }
        catch (e) {
            console.error('Failed to disconnect GitHub:', e);
        }
        githubLoading.value = false;
    }

    async function initializeGithubData() {
        if (!githubConnected.value) {
            return;
        }
        await loadRepos();
        await loadWebhookSubscriptions();
    }

    onMounted(async () => {
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

    return {
        githubConnected,
        githubLoading,
        repos,
        reposLoading,
        reposError,
        webhooks,
        deletingWebhookIds,
        webhooksError,
        subscriptionMenuOpen,
        subscriptionsLoading,
        subscriptionsSaving,
        subscriptionsError,
        subscriptionsSaved,
        subscribedRepos,
        directSaveLoadingRepos,
        loadRepos,
        isRepoSubscribed,
        toggleRepoSubscription,
        isDirectSaveLoading,
        saveWebhookSubscriptions,
        toggleRepoSubscriptionDirect,
        deleteWebhook,
        disconnectGithub,
    };
}
