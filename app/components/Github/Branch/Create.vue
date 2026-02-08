<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const { notify } = useNotification();
const githubBranchName = useState('githubBranchName');
const selectedRepo = useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>('githubRepo');
const listStore = useListsStore();
const hasBranch = useState('hasBranch', () => false);
const pendingBranchResponse = useState('pendingBranchResponse');
const showLinkDialog = useState('showLinkDialog');

async function createBranch() {
    try {
        const response = await $fetch('/api/github/branch', {
            method: 'POST',
            body: {
                branchName: githubBranchName.value,
                repo: selectedRepo.value,
            },
        });

        if (response.ref) {
            if (response.alreadyExists) {
                // Show confirmation dialog
                pendingBranchResponse.value = response;
                showLinkDialog.value = true;
            }
            else {
                listStore.currentTodo.githubBranchName = githubBranchName.value as string;
                listStore.currentTodo.githubRepo = selectedRepo.value?.full_name;
                listStore.currentTodo.githubLink = response.url;

                listStore.updateTodo(listStore.currentTodo);
                notify('Branch created successfully');
            }
        }
    }
    catch (error: any) {
        console.error('Failed to create branch:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to create branch';
        notify(errorMessage);

        // If it's an auth error, suggest reconnecting
        if (error?.status === 401 || error?.statusCode === 401) {
            notify('Please reconnect GitHub in Settings');
        }
    }
}
</script>

<template>
    <v-btn
        v-if="!listStore.currentTodo.githubLink"
        icon="mdi-plus"
        size="small"
        variant="tonal"
        color="green"
        width="30"
        height="30"
        :disabled="!selectedRepo || hasBranch"
        @click="createBranch"
    />
</template>
