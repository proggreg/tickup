<script setup lang="ts">
import { Button } from '@vuetify/v0';
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

        if (error?.status === 401 || error?.statusCode === 401) {
            notify('Please reconnect GitHub in Settings');
        }
    }
}
</script>

<template>
    <Button.Root
        v-if="!listStore.currentTodo.githubLink"
        class="icon-btn icon-btn--success"
        aria-label="Create branch"
        :disabled="!selectedRepo || hasBranch"
        @click="createBranch"
    >
        <Button.Icon>
            <i class="mdi mdi-plus" />
        </Button.Icon>
    </Button.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
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

.icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.icon-btn .mdi {
    font-size: 16px;
}
</style>
