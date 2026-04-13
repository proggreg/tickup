<script setup lang="ts">
import { Button } from '@vuetify/v0';
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
            class="loading-state"
        >
            <span class="spinner spinner--lg" />
            <span>Loading repositories...</span>
        </div>

        <div
            v-else-if="props.reposError"
            class="alert alert--error"
            role="alert"
        >
            <span>{{ props.reposError }}</span>
            <Button.Root
                class="btn btn--text"
                @click="emit('retryLoad')"
            >
                <Button.Content>Retry</Button.Content>
            </Button.Root>
        </div>

        <div
            v-if="!props.reposLoading && !props.reposError && props.subscriptionsError"
            class="alert alert--error alert--compact"
            role="alert"
            data-testid="github-webhook-inline-error"
        >
            {{ props.subscriptionsError }}
        </div>

        <div
            v-if="!props.reposLoading && !props.reposError && props.repos.length === 0"
            class="empty-state"
        >
            No repositories found. Make sure the GitHub App has access to your repositories.
        </div>

        <ul
            v-if="!props.reposLoading && !props.reposError && props.repos.length > 0"
            class="repo-list"
        >
            <li
                v-for="repo in props.repos"
                :key="repo.id"
                class="repo-item"
            >
                <div class="repo-item__icon">
                    <i :class="`mdi ${repo.private ? 'mdi-lock' : 'mdi-source-repository'}`" />
                </div>
                <div class="repo-item__info">
                    <span class="repo-item__name">{{ repo.name }}</span>
                    <span
                        v-if="repo.description"
                        class="repo-item__desc"
                    >{{ repo.description }}</span>
                </div>
                <div class="repo-item__meta">
                    <span
                        v-if="repo.language"
                        class="repo-item__lang"
                    >
                        <span
                            class="lang-dot"
                            :style="{ backgroundColor: languageColor(repo.language) }"
                        />
                        {{ repo.language }}
                    </span>
                    <span
                        v-if="repo.updated_at"
                        class="repo-item__time"
                    >{{ timeAgo(repo.updated_at) }}</span>
                    <Button.Root
                        class="btn"
                        :class="props.isRepoSubscribed(repo.full_name) ? 'btn--warning-tonal' : 'btn--primary-tonal'"
                        :disabled="props.isDirectSaveLoading(repo.full_name)"
                        :data-testid="`github-webhook-toggle-button-${toRepoTestId(repo.full_name)}`"
                        @click.stop.prevent="emit('toggleDirect', repo.full_name)"
                    >
                        <span
                            v-if="props.isDirectSaveLoading(repo.full_name)"
                            class="spinner spinner--sm"
                        />
                        <Button.Content>
                            {{ props.isRepoSubscribed(repo.full_name) ? 'Unsubscribe' : 'Subscribe' }}
                        </Button.Content>
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
    justify-content: center;
    gap: 12px;
    padding: 32px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 0.875rem;
}

.alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 12px;
}

.alert--error {
    background: rgba(var(--v-theme-error), 0.1);
    color: rgb(var(--v-theme-error));
}

.alert--compact {
    padding: 6px 12px;
    font-size: 0.8125rem;
}

.empty-state {
    text-align: center;
    padding: 32px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-size: 0.875rem;
}

.repo-list {
    list-style: none;
    margin: 0;
    padding: 0;
    background: rgba(var(--v-border-color), 0.06);
    border-radius: 8px;
    overflow: hidden;
}

.repo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.repo-item:last-child {
    border-bottom: none;
}

.repo-item__icon {
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-size: 18px;
    flex-shrink: 0;
}

.repo-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.repo-item__name {
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.repo-item__desc {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.repo-item__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.repo-item__lang {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.repo-item__time {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.lang-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
}

.btn--text:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.btn--primary-tonal {
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}

.btn--primary-tonal:hover {
    background: rgba(var(--v-theme-primary), 0.2);
}

.btn--warning-tonal {
    background: rgba(var(--v-theme-warning), 0.12);
    color: rgb(var(--v-theme-warning));
}

.btn--warning-tonal:hover {
    background: rgba(var(--v-theme-warning), 0.2);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

.spinner--lg {
    width: 28px;
    height: 28px;
}

.spinner--sm {
    width: 12px;
    height: 12px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
