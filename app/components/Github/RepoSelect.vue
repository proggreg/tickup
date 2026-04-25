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
    if (listStore.currentTodo.githubLink) {
        listStore.currentTodo.githubRepo = null;
        listStore.currentTodo.githubBranchName = null;
        listStore.currentTodo.githubLink = null;
        listStore.updateTodo();
    }
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
        v-if="selectedRepo"
        class="repo-chip"
    >
        <i class="mdi mdi-source-repository repo-chip__icon" />
        <span class="repo-chip__name">{{ selectedRepo.name }}</span>
        <button
            class="repo-chip__unlink"
            aria-label="Unlink repository"
            @click="clearRepo"
        >
            <i class="mdi mdi-link-off" />
        </button>
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
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px 5px 9px;
    border-radius: 7px;
    border: 1px solid rgba(var(--v-border-color), 0.14);
    background: transparent;
    transition: background 0.12s;
    min-width: 0;
}

.repo-chip:hover {
    background: rgba(var(--v-border-color), 0.07);
}

.repo-chip__icon {
    font-size: 13px;
    color: rgb(var(--v-theme-primary));
    flex-shrink: 0;
}

.repo-chip__name {
    flex: 1;
    font-size: 12.5px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}

.repo-chip__unlink {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: rgba(var(--v-theme-on-surface), 0.55);
    padding: 0;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
}

.repo-chip__unlink:hover {
    background: rgba(var(--v-theme-error), 0.07);
    color: rgb(var(--v-theme-error));
}

.repo-chip__unlink .mdi {
    font-size: 15px;
}

.autocomplete {
    width: 100%;
}

.autocomplete__field {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 7px;
    border: 1px solid rgba(var(--v-border-color), 0.14);
    background: transparent;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}

.autocomplete__field:hover {
    border-color: rgba(var(--v-border-color), 0.22);
    background: rgba(var(--v-border-color), 0.07);
}

.autocomplete__field:focus-within {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.025);
}

.autocomplete__icon {
    font-size: 14px;
    opacity: 0.5;
    flex-shrink: 0;
}

.autocomplete__input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 12.5px;
    font-family: inherit;
    color: rgb(var(--v-theme-on-surface));
    min-width: 0;
    padding: 0;
    font-weight: 500;
}

.autocomplete__input::placeholder {
    font-weight: 400;
    color: rgba(var(--v-theme-on-surface), 0.35);
}

.clear-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: rgba(var(--v-theme-on-surface), 0.35);
    padding: 0;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
}

.clear-btn:hover {
    background: rgba(var(--v-border-color), 0.22);
    color: rgb(var(--v-theme-on-surface));
}

.clear-btn .mdi {
    font-size: 11px;
}

.autocomplete__dropdown {
    width: 280px;
    max-width: calc(100vw - 32px);
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.14);
    border-radius: 9px;
    box-shadow: 0 8px 24px rgba(15, 30, 53, 0.10), 0 2px 6px rgba(15, 30, 53, 0.06);
    padding: 4px;
    overflow: hidden;
}

.autocomplete__list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 196px;
    overflow-y: auto;
}

.autocomplete__item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 7px 10px;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.1s;
}

.autocomplete__item:hover {
    background: rgba(var(--v-border-color), 0.07);
}

.autocomplete__item-prepend {
    flex-shrink: 0;
    padding-top: 1px;
}

.autocomplete__item-icon {
    font-size: 13px;
    color: rgba(var(--v-theme-on-surface), 0.45);
}

.autocomplete__item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.autocomplete__item-title {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.autocomplete__item-sub {
    font-size: 11px;
    font-family: monospace;
    color: rgba(var(--v-theme-on-surface), 0.45);
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
