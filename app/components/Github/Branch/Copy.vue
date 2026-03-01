<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const githubBranchName = useState<string>('githubBranchName');
const selectedRepo = useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>('githubRepo');
const { notify } = useNotification();
const listStore = useListsStore();

const githubBranchCommand = computed(() => {
    if (listStore.currentTodo.githubBranchName) {
        return `git checkout "${githubBranchName.value}"`;
    }
    return `git checkout -b "${githubBranchName.value}"`;
});

const copyToClipBoard = () => {
    if (githubBranchName.value) {
        navigator.clipboard.writeText(githubBranchCommand.value);
        notify('Copied to clipboard');

        if (!listStore.currentTodo.githubBranchName) {
            listStore.currentTodo.githubBranchName = githubBranchName.value as string;
            listStore.currentTodo.githubRepo = selectedRepo.value?.full_name;

            listStore.updateTodo(listStore.currentTodo);
        }
    }
};
</script>

<template>
    <v-btn
        size="small"
        icon="mdi-content-copy"
        @click.stop="copyToClipBoard"
    />
</template>
