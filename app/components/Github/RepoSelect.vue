<script setup lang="ts">
import { Input, Popover } from '@vuetify/v0';

const listStore = useListsStore();
export interface Repo {
    id: number;
    name: string;
    full_name?: string;
    private?: boolean;
    html_url?: string;
    description?: string | null;
    language?: string | null;
    default_branch?: string;
    updated_at?: string;
}

const liststore = useListsStore();
const selectedRepo = useState('githubRepo', () => null);
const repos = ref<Repo[]>([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const popoverOpen = ref(false);
const emit = defineEmits(['updateRepo']);

const filteredRepos = computed(() => {
    if (!searchQuery.value) return repos.value;
    const q = searchQuery.value.toLowerCase();
    return repos.value.filter(r => r.name.toLowerCase().includes(q));
});

async function loadRepos() {
    loading.value = true;
    error.value = '';
    try {
        const data = await $fetch('/api/github/repos');
        repos.value = data.repositories;
    }
    catch (e: any) {
        error.value = e?.data?.message || 'Failed to load repositories';
    }
    loading.value = false;
}

function handleRepoSelect(value: Repo) {
    selectedRepo.value = value;
    searchQuery.value = value.name;
    listStore.currentList.githubRepo = value.name;
    emit('updateRepo');
    popoverOpen.value = false;
}

function clearRepo() {
    selectedRepo.value = null;
    searchQuery.value = '';
}

onBeforeMount(async () => {
    await loadRepos();
    if (!listStore.currentList.githubRepo) return;
    selectedRepo.value = repos.value.find(repo => repo?.name === listStore.currentList.githubRepo);
    if (selectedRepo.value) {
        searchQuery.value = selectedRepo.value.name;
    }
});

onUnmounted(() => {
    selectedRepo.value = null;
});

watch(() => liststore.currentList.githubRepo, (repo) => {
    const listsDefaultRepo = repos.value.find(r => r.name === repo);
    if (listsDefaultRepo) {
        selectedRepo.value = listsDefaultRepo;
        searchQuery.value = listsDefaultRepo.name;
    }
});
</script>

<template>
    <!-- Linked repo chip -->
    <div
        v-if="listStore.currentTodo.githubRepo && listStore.currentTodo.githubLink"
        class="repo-chip"
    >
        <i class="mdi mdi-source-repository repo-chip__icon" />
        <span class="repo-chip__name">{{ listStore.currentTodo.githubRepo }}</span>
    </div>

    <!-- Repo search autocomplete -->
    <div
        v-else
        class="autocomplete"
    >
        <Popover.Root v-model:open="popoverOpen">
            <Popover.Activator>
                <div class="autocomplete__field">
                    <i class="mdi mdi-source-repository autocomplete__icon" />
                    <Input.Root v-model="searchQuery">
                        <Input.Control
                            class="autocomplete__input"
                            placeholder="Select a repository"
                            @focus="popoverOpen = true"
                            @input="popoverOpen = true"
                        />
                    </Input.Root>
                    <span
                        v-if="loading"
                        class="spinner spinner--sm"
                    />
                    <button
                        v-if="searchQuery"
                        class="clear-btn"
                        @click="clearRepo"
                    >
                        <i class="mdi mdi-close" />
                    </button>
                </div>
            </Popover.Activator>
            <Popover.Content>
                <div class="autocomplete__dropdown">
                    <div
                        v-if="error"
                        class="autocomplete__error"
                    >
                        {{ error }}
                    </div>
                    <ul
                        v-else-if="filteredRepos.length"
                        class="autocomplete__list"
                    >
                        <li
                            v-for="repo in filteredRepos"
                            :key="repo.id"
                            class="autocomplete__item"
                            @click="handleRepoSelect(repo)"
                        >
                            <div class="autocomplete__item-prepend">
                                <i :class="`mdi ${repo.private ? 'mdi-lock' : 'mdi-source-repository'} autocomplete__item-icon`" />
                            </div>
                            <div class="autocomplete__item-body">
                                <span class="autocomplete__item-title">{{ repo.name }}</span>
                                <span
                                    v-if="repo.description"
                                    class="autocomplete__item-sub"
                                >{{ repo.description }}</span>
                            </div>
                        </li>
                    </ul>
                    <div
                        v-else
                        class="autocomplete__empty"
                    >
                        No repositories found
                    </div>
                </div>
            </Popover.Content>
        </Popover.Root>
    </div>
</template>

<style scoped>
.repo-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(var(--v-border-color), 0.1);
    font-size: 0.8125rem;
    font-weight: 500;
}

.repo-chip__icon {
    font-size: 14px;
    opacity: 0.7;
}

.repo-chip__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
}

.autocomplete {
    width: 100%;
}

.autocomplete__field {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 6px;
    background: transparent;
    transition: border-color 0.15s;
}

.autocomplete__field:focus-within {
    border-color: rgb(var(--v-theme-primary));
}

.autocomplete__icon {
    font-size: 16px;
    opacity: 0.5;
    flex-shrink: 0;
}

.autocomplete__input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.8125rem;
    font-family: inherit;
    color: inherit;
    min-width: 0;
    padding: 2px 0;
}

.clear-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 3px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    padding: 0;
    flex-shrink: 0;
}

.clear-btn:hover {
    background: rgba(var(--v-border-color), 0.1);
}

.clear-btn .mdi {
    font-size: 13px;
}

.autocomplete__dropdown {
    width: 280px;
    max-width: calc(100vw - 32px);
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    overflow: hidden;
}

.autocomplete__list {
    list-style: none;
    margin: 0;
    padding: 4px;
    max-height: 240px;
    overflow-y: auto;
}

.autocomplete__item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s;
}

.autocomplete__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.autocomplete__item-prepend {
    flex-shrink: 0;
    padding-top: 1px;
}

.autocomplete__item-icon {
    font-size: 16px;
    opacity: 0.6;
}

.autocomplete__item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.autocomplete__item-title {
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.autocomplete__item-sub {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.autocomplete__empty,
.autocomplete__error {
    padding: 12px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
    text-align: center;
}

.autocomplete__error {
    color: rgb(var(--v-theme-error));
}

.spinner {
    display: inline-block;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

.spinner--sm { width: 14px; height: 14px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
