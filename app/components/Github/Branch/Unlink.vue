<script setup lang="ts">
import { Button } from '@vuetify/v0';
import type { Endpoints } from '@octokit/types';

type ListBranchesData = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
type BranchItem = ListBranchesData[number];
const listStore = useListsStore();
const selectedBranch = useState('githubBranch');
const { branches } = defineProps<{ branches: BranchItem[] }>();
const githubBranchName = useState('githubBranchName');

async function unlinkBranch() {
    selectedBranch.value = branches.find(branch => branch.name === githubBranchName.value);
    listStore.currentTodo.githubBranchName = null;
    listStore.currentTodo.githubLink = null;
    listStore.updateTodo();
}
</script>

<template>
    <Button.Root
        class="icon-btn icon-btn--danger"
        aria-label="Unlink branch"
        @click="unlinkBranch"
    >
        <Button.Icon>
            <i class="mdi mdi-link-off" />
        </Button.Icon>
    </Button.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
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

.icon-btn--danger .mdi {
    color: rgb(var(--v-theme-error));
}

.icon-btn .mdi {
    font-size: 16px;
}
</style>
