<script setup lang="ts">
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
    <v-btn
        color="red"
        icon="mdi-link-off"
        size="small"
        @click="unlinkBranch"
    />
</template>
