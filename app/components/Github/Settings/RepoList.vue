<script setup lang="ts">
import type { RepoItem } from '~/composables/useGithubSettings';

const props = defineProps<{
    repos: RepoItem[];
    reposLoading: boolean;
    reposError: string;
    subscriptionsError: string;
    isRepoSubscribed: (fullName: string) => boolean;
    isDirectSaveLoading: (fullName: string) => boolean;
}>();

const emit = defineEmits<{
    retryLoad: [];
    toggleDirect: [fullName: string];
}>();

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
</script>

<template>
    <div>
        <div
            v-if="props.reposLoading"
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
            v-else-if="props.reposError"
            type="error"
            variant="tonal"
            class="mb-3"
        >
            {{ props.reposError }}
            <template #append>
                <v-btn
                    variant="text"
                    size="small"
                    @click="emit('retryLoad')"
                >
                    Retry
                </v-btn>
            </template>
        </v-alert>

        <v-alert
            v-if="!props.reposLoading && !props.reposError && props.subscriptionsError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
            data-testid="github-webhook-inline-error"
        >
            {{ props.subscriptionsError }}
        </v-alert>

        <div
            v-if="!props.reposLoading && !props.reposError && props.repos.length === 0"
            class="text-center pa-8 text-medium-emphasis"
        >
            No repositories found. Make sure the GitHub App has access to your repositories.
        </div>

        <v-list
            v-if="!props.reposLoading && !props.reposError && props.repos.length > 0"
            variant="tonal"
        >
            <v-list-item
                v-for="repo in props.repos"
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
                            :color="props.isRepoSubscribed(repo.full_name) ? 'warning' : 'primary'"
                            :loading="props.isDirectSaveLoading(repo.full_name)"
                            :data-testid="`github-webhook-toggle-button-${toRepoTestId(repo.full_name)}`"
                            @click.stop.prevent="emit('toggleDirect', repo.full_name)"
                        >
                            {{ props.isRepoSubscribed(repo.full_name) ? 'Unsubscribe' : 'Subscribe' }}
                        </v-btn>
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
    </div>
</template>
