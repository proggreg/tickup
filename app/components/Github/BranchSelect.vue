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

async function loadBranches() {
    loading.value = true;
    error.value = '';
    if (!selectedRepo.value) {
        return;
    }
    const data = await $fetch<ListBranchesData>('/api/github/branches', {
        query: {
            owner: selectedRepo.value?.full_name.split('/').shift(),
            repo: selectedRepo.value?.name,
        },
    });
    branches.value = data;
    loading.value = false;
}

async function linkBranch() {
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

function unlinkBranch() {
    listStore.currentTodo.githubBranchName = null;
    listStore.currentTodo.githubRepo = null;
    listStore.currentTodo.githubLink = null;
    listStore.updateTodo();
}

watch(selectedRepo, (newSelectedRepo) => {
    if (newSelectedRepo.name) {
        loadBranches();
    }
});

onMounted(() => {
    console.log('mount select branch', selectedRepo);
    if (selectedRepo.value) {
        loadBranches();
    }
});
</script>

<template>
    <v-text-field
        v-if="listStore.currentTodo.githubBranchName"
    >
        {{ listStore.currentTodo.githubBranchName }}
        <template #append>
            <v-btn
                color="red"
                icon="mdi-link-off"
                @click="unlinkBranch"
            />
        </template>
    </v-text-field>
    <v-autocomplete
        v-else
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
        clearable
    >
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
        <template #item="{ props, item }">
            <v-list-item
                v-bind="props"
                :subtitle="item.raw.commit.sha"
            >
                <template #prepend>
                    <v-icon size="small">
                        mdi-git-branch
                    </v-icon>
                </template>
            </v-list-item>
        </template>

        <template #selection="{ item }">
            <div class="d-flex align-center ga-2">
                <v-icon size="small">
                    mdi-git-branch
                </v-icon>
                {{ item.raw.name }}
            </div>
        </template>
    </v-autocomplete>
</template>
