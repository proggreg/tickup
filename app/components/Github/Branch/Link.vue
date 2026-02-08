<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const listStore = useListsStore();
const selectedBranch = useState('githubBranch', () => null);
const selectedRepo = useState('githubRepo', () => null);

async function linkBranch() {
    if (!selectedBranch.value) {
        return;
    }
    if (!selectedBranch.value.name) {
        console.warn('branch name is required');
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
</script>

<template>
    <v-btn
        v-if="selectedBranch"
        icon="mdi-link"
        variant="tonal"
        size="x-small"
        color="green"
        @click="linkBranch"
    />
</template>
