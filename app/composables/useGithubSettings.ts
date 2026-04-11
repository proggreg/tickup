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

    const deletingWebhookIds = ref<number[]>([]);
    const webhooksError = ref('');

    const subscriptionMenuOpen = ref(false);
    const subscriptionsLoading = ref(false);
    const subscriptionsSaving = ref(false);
    const subscriptionsError = ref('');
    const subscriptionsSaved = ref(false);
    const subscribedRepos = ref<WebhookItem[]>([]);
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
            const data = await $fetch<{ subscriptions: WebhookItem[] }>('/api/github/webhook/subscriptions');
            subscribedRepos.value = data.subscriptions || [];
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
            subscribedRepos.value = subscribedRepos.value.filter(h => h.id !== hookId);
        }
        catch (e: any) {
            webhooksError.value = e?.data?.message || 'Failed to delete webhook';
        }
        finally {
            deletingWebhookIds.value = deletingWebhookIds.value.filter(id => id !== hookId);
        }
    }

    function isRepoSubscribed(fullName: string) {
        return subscribedRepos.value.find(repo => repo.repoFullName === fullName);
    }

    function toggleRepoSubscription(fullName: string, subscribed: boolean) {
        if (subscribed) {
            if (!subscribedRepos.value.find(repo => repo.repoFullName === fullName)) {
                subscribedRepos.value = [
                    ...subscribedRepos.value,
                    {
                        id: 0,
                        active: true,
                        events: [],
                        config: {},
                        repoFullName: fullName,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ];
            }
            return;
        }
        subscribedRepos.value = subscribedRepos.value.filter(repo => repo.repoFullName !== fullName);
    }

    function isDirectSaveLoading(fullName: string) {
        return directSaveLoadingRepos.value.includes(fullName);
    }

    async function persistWebhookSubscriptions(): Promise<{ subscriptions: WebhookItem[] }> {
        const repoFullNames = subscribedRepos.value
            .map(item => item.repoFullName)
            .filter(Boolean);

        return await $fetch('/api/github/webhook/subscribe', {
            method: 'POST',
            body: {
                subscriptions: repoFullNames,
            },
        });
    }

    async function saveWebhookSubscriptions() {
        subscriptionsSaving.value = true;
        subscriptionsError.value = '';
        subscriptionsSaved.value = false;
        try {
            const { subscriptions } = await persistWebhookSubscriptions();
            subscriptionsSaved.value = true;
            subscribedRepos.value = subscriptions;
        }
        catch (e: any) {
            subscriptionsError.value = e?.data?.message || 'Failed to save webhook subscriptions';
        }
        subscriptionsSaving.value = false;
    }

    async function toggleRepoSubscriptionDirect(fullName: string) {
        if (!fullName) {
            throw Error('repo name');
        }

        if (isDirectSaveLoading(fullName)) {
            return;
        }
        subscriptionsError.value = '';
        const previousSubscriptions = [...subscribedRepos.value];
        const nextSubscribedState = !isRepoSubscribed(fullName);
        toggleRepoSubscription(fullName, nextSubscribedState);
        directSaveLoadingRepos.value = [...directSaveLoadingRepos.value, fullName];
        try {
            const { subscriptions } = await persistWebhookSubscriptions();
            subscribedRepos.value = subscriptions || [];
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
