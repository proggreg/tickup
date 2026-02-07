<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

type ListBranchesData = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
type BranchItem = ListBranchesData[number];
const listStore = useListsStore();
const selectedBranch = useState('githubBranch', () => null);
const selectedRepo = useState('githubRepo', () => null);
const branches = ref<BranchItem[]>([]);
const loading = ref(false);
const error = ref('');
const selectBranchInput = ref();
const { branchName } = defineProps <{ branchName: string }>();
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
            const foundBranch = branches.value.find(branch => branch.name === branchName);

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

async function linkBranch() {
    if (!selectedBranch.value?.name || !selectedRepo.value?.name || !selectedRepo.value?.full_name) {
        return;
    }
    const branch = await $fetch<Endpoints['GET /repos/{owner}/{repo}/branches/{branch}']['response']['data']>('/api/github/branch', {
        query: {
            branch: selectedBranch.value.name,
            repo: selectedRepo.value.name,
            owner: selectedRepo.value.full_name.split('/').shift(),
        },
    });

    if (branch) {
        listStore.currentTodo.githubBranchName = branch.name;
        listStore.currentTodo.githubRepo = selectedRepo.value.name;
        listStore.currentTodo.githubLink = branch._links.html;
        listStore.updateTodo();
        selectedBranch.value = null;
    }
}

async function unlinkBranch() {
    listStore.currentTodo.githubBranchName = null;
    listStore.currentTodo.githubLink = null;
    listStore.updateTodo();
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
            <v-btn
                color="red"
                icon="mdi-link-off"
                size="small"
                @click="unlinkBranch"
            />
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
            <v-btn
                v-if="selectedBranch"
                icon="mdi-link"
                variant="tonal"
                size="small"
                color="green"
                @click="linkBranch"
            />
        </template>
    </v-autocomplete>
</template>
