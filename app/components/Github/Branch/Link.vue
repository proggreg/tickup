<script setup lang="ts">
import { Button } from '@vuetify/v0';
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
    <Button.Root
        v-if="selectedBranch"
        class="icon-btn icon-btn--success"
        aria-label="Link branch"
        @click="linkBranch"
    >
        <Button.Icon>
            <i class="mdi mdi-link" />
        </Button.Icon>
    </Button.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn--success .mdi {
    color: rgb(var(--v-theme-success));
}

.icon-btn .mdi {
    font-size: 14px;
}
</style>
