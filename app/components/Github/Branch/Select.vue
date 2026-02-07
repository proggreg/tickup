<script setup lang="ts">
import { GithubBranchLink, GithubBranchUnlink } from '#components';
import type { Endpoints } from '@octokit/types';

type ListBranchesData = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
type BranchItem = ListBranchesData[number];
const listStore = useListsStore();
const selectedBranch = useState('githubBranch', () => null);
const selectedRepo = useState('githubRepo', () => null);
const githubBranchName = useState('githubBranchName');
const branches = ref<BranchItem[]>([]);
const loading = ref(false);
const error = ref('');
const selectBranchInput = ref();

const hasBranch = useState('hasBranch', () => false);

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
            // Add a delay to allow the autocomplete to finish its internal updates
            setTimeout(() => {
                if (selectBranchInput.value) {
                    // Focus the actual input element inside the Vuetify component
                    const input = selectBranchInput.value.$el?.querySelector('input');
                    if (input) {
                        input.focus();
                    }
                }
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

watch(selectedRepo, (newVal, oldVal) => {
    console.log('selectedRepo changed:', { newVal, oldVal });
    if (newVal && newVal !== oldVal) {
        selectedBranch.value = '';
        loadBranches();
    }
},
);

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
    <v-chip
        v-if="listStore.currentTodo.githubBranchName"
    >
        <v-icon icon="mdi-source-branch" />
        {{ listStore.currentTodo.githubBranchName }}
        <template #append>
            <github-branch-unlink :branches="branches" />
        </template>
    </v-chip>
    <v-autocomplete
        v-else
        ref="selectBranchInput"
        v-model="selectedBranch"
        :items="branches"
        :loading="loading"
        item-value="id"
        item-title="name"
        return-object
        label="Branch"
        placeholder="Select a branch"
        variant="outlined"
        density="compact"
        hide-details
        no-data-text="No branches found"
        :error-messages="error"
        prepend-inner-icon="mdi-source-branch"
        clearable
    >
        <template #item="{ props, item }">
            <v-list-item
                v-bind="props"
                :subtitle="item.raw.commit.sha"
            />
        </template>

        <template #append>
            <github-branch-link />
        </template>
    </v-autocomplete>
</template>
