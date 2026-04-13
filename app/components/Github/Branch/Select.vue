<script setup lang="ts">
import { Input, Popover } from '@vuetify/v0';
import { GithubBranchLink, GithubBranchUnlink } from '#components';
import type { Endpoints } from '@octokit/types';

type ListBranchesData = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
type BranchItem = ListBranchesData[number];
const listStore = useListsStore();
const selectedBranch = useState<BranchItem | null>('githubBranch', () => null);
const selectedRepo = useState('githubRepo', () => null);
const githubBranchName = useState('githubBranchName');
const branches = ref<BranchItem[]>([]);
const loading = ref(false);
const error = ref('');
const inputEl = ref<HTMLInputElement | null>(null);
const searchQuery = ref('');
const popoverOpen = ref(false);

const hasBranch = useState('hasBranch', () => false);

const emit = defineEmits<{
    'branch-selected': [branch: BranchItem | null];
}>();

const filteredBranches = computed(() => {
    if (!searchQuery.value) return branches.value;
    const q = searchQuery.value.toLowerCase();
    return branches.value.filter(b => b.name.toLowerCase().includes(q));
});

async function loadBranches() {
    loading.value = true;
    error.value = '';
    if (!selectedRepo.value) {
        loading.value = false;
        return;
    }
    try {
        const data = await $fetch<ListBranchesData>('/api/github/branches', {
            query: {
                owner: selectedRepo.value?.full_name?.split('/').shift(),
                repo: selectedRepo?.value?.name,
            },
        });

        branches.value = data;

        if (branches.value && branches.value.length > 0) {
            const foundBranch = branches.value.find(branch => branch.name === githubBranchName.value);

            if (foundBranch) {
                hasBranch.value = true;
                selectedBranch.value = foundBranch;
            }
            else {
                hasBranch.value = false;
            }

            await nextTick();
            setTimeout(() => {
                if (inputEl.value) inputEl.value.focus();
            }, 150);
        }
    }
    catch (e: any) {
        error.value = e?.data?.message || 'Failed to load branches';
        branches.value = [];
    }
    finally {
        loading.value = false;
    }
}

function selectBranch(branch: BranchItem) {
    selectedBranch.value = branch;
    searchQuery.value = branch.name;
    popoverOpen.value = false;
    emit('branch-selected', branch);
}

function clearBranch() {
    selectedBranch.value = null;
    searchQuery.value = '';
    emit('branch-selected', null);
}

watch(selectedBranch, (newBranch, oldBranch) => {
    if (newBranch === oldBranch) return;
    emit('branch-selected', newBranch);
});

watch(selectedRepo, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
        selectedBranch.value = '';
        loadBranches();
    }
});

onMounted(() => {
    if (selectedRepo.value) {
        loadBranches();
    }
});

onUnmounted(() => {
    selectedBranch.value = '';
});
</script>

<template>
    <!-- Linked branch chip -->
    <div
        v-if="listStore.currentTodo.githubBranchName"
        class="branch-chip"
    >
        <i class="mdi mdi-source-branch branch-chip__icon" />
        <span class="branch-chip__name">{{ listStore.currentTodo.githubBranchName }}</span>
        <GithubBranchUnlink :branches="branches" />
    </div>

    <!-- Branch search autocomplete -->
    <div
        v-else
        class="autocomplete"
    >
        <Popover.Root v-model:open="popoverOpen">
            <Popover.Activator>
                <div class="autocomplete__field">
                    <i class="mdi mdi-source-branch autocomplete__icon" />
                    <Input.Root v-model="searchQuery">
                        <Input.Control
                            ref="inputEl"
                            class="autocomplete__input"
                            placeholder="Select a branch"
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
                        @click="clearBranch"
                    >
                        <i class="mdi mdi-close" />
                    </button>
                    <GithubBranchLink />
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
                        v-else-if="filteredBranches.length"
                        class="autocomplete__list"
                    >
                        <li
                            v-for="branch in filteredBranches"
                            :key="branch.name"
                            class="autocomplete__item"
                            @click="selectBranch(branch)"
                        >
                            <span class="autocomplete__item-title">{{ branch.name }}</span>
                            <span class="autocomplete__item-sub">{{ branch.commit.sha.slice(0, 7) }}</span>
                        </li>
                    </ul>
                    <div
                        v-else
                        class="autocomplete__empty"
                    >
                        No branches found
                    </div>
                </div>
            </Popover.Content>
        </Popover.Root>
    </div>
</template>

<style scoped>
.branch-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(var(--v-border-color), 0.1);
    font-size: 0.8125rem;
    font-weight: 500;
}

.branch-chip__icon {
    font-size: 14px;
    opacity: 0.7;
}

.branch-chip__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
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
    width: 320px;
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
    max-height: 200px;
    overflow-y: auto;
}

.autocomplete__item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s;
}

.autocomplete__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.autocomplete__item-title {
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.autocomplete__item-sub {
    font-size: 0.75rem;
    font-family: monospace;
    color: rgba(var(--v-theme-on-surface), 0.5);
    flex-shrink: 0;
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
